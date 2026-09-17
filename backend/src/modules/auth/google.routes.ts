import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyPassport from '@fastify/passport';
import { BadRequestError, UnauthorizedError } from '../../lib/errors.js';
import { getEnv } from '../../config/env.js';

interface TempTokenPayload {
  userId: string;
  purpose: 'PHONE_VERIFICATION';
}

export async function googleAuthRoutes(fastify: FastifyInstance): Promise<void> {
  const env = getEnv();
  const FRONTEND_URL = process.env['FRONTEND_URL'] || 'http://localhost:3000';

  // ---- 1. GET /api/v1/auth/google ----
  fastify.get(
    '/google',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Initiate Google OAuth authentication',
        description: 'Redirects user to Google OAuth 2.0 consent screen.',
      },
    },
    fastifyPassport.authenticate('google', { scope: ['profile', 'email'] }),
  );

  // ---- 2. GET /api/v1/auth/google/callback ----
  fastify.get(
    '/google/callback',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Google OAuth callback URL',
        description: 'Processes Google profile, generates tokens or temp onboarding token, and redirects to frontend.',
      },
      preValidation: fastifyPassport.authenticate('google', {
        failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed`,
      }),
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user) {
        return reply.redirect(`${FRONTEND_URL}/login?error=user_not_found`);
      }

      // Check if user has a verified phone number
      const hasVerifiedPhone = Boolean(user.phone && user.isPhoneVerified);

      if (hasVerifiedPhone) {
        // Issue full JWT access & refresh tokens
        const accessToken = fastify.jwt.sign(
          { sub: user.id, role: user.role ?? 'USER' } as any,
          { expiresIn: env.JWT_ACCESS_EXPIRY },
        );

        const refreshToken = fastify.jwt.sign(
          { sub: user.id } as any,
          { expiresIn: env.JWT_REFRESH_EXPIRY },
        );

        // Calculate expiresAt for refresh token (7 days default)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await fastify.prisma.refreshToken.create({
          data: {
            token: refreshToken,
            userId: user.id,
            expiresAt,
          },
        });

        const redirectUrl = new URL(`${FRONTEND_URL}/auth/callback`);
        redirectUrl.searchParams.set('accessToken', accessToken);
        redirectUrl.searchParams.set('refreshToken', refreshToken);
        return reply.redirect(redirectUrl.toString());
      } else {
        // User needs mobile verification → issue 15m temp token
        const tempToken = fastify.jwt.sign(
          { sub: user.id, userId: user.id, purpose: 'PHONE_VERIFICATION' } as any,
          { expiresIn: '15m' },
        );

        const redirectUrl = new URL(`${FRONTEND_URL}/auth/callback`);
        redirectUrl.searchParams.set('tempToken', tempToken);
        if (user.name) redirectUrl.searchParams.set('name', user.name);
        return reply.redirect(redirectUrl.toString());
      }
    },
  );

  // ---- 3. POST /api/v1/auth/google/link-phone/send-otp ----
  fastify.post(
    '/google/link-phone/send-otp',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Send SMS OTP to verify mobile number for Google OAuth user',
        body: {
          type: 'object',
          required: ['tempToken', 'phone'],
          properties: {
            tempToken: { type: 'string' },
            phone: { type: 'string', minLength: 10, maxLength: 15 },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { tempToken, phone } = request.body as { tempToken: string; phone: string };

      let decoded: TempTokenPayload;
      try {
        decoded = fastify.jwt.verify<TempTokenPayload>(tempToken);
        if (decoded.purpose !== 'PHONE_VERIFICATION') throw new Error('Invalid token purpose');
      } catch {
        throw new UnauthorizedError('Invalid or expired onboarding session');
      }

      const cleanPhone = phone.trim();
      const existingUser = await fastify.prisma.user.findFirst({
        where: { phone: cleanPhone, NOT: { id: decoded.userId } },
      });

      if (existingUser) {
        throw new BadRequestError('This mobile number is already registered to another account.');
      }

      const result = await fastify.otpService.sendOtp(cleanPhone, 'VERIFY');
      return reply.send(result);
    },
  );

  // ---- 4. POST /api/v1/auth/google/link-phone/verify-otp ----
  fastify.post(
    '/google/link-phone/verify-otp',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Verify OTP and finalize Google user profile with verified phone',
        body: {
          type: 'object',
          required: ['tempToken', 'phone', 'code'],
          properties: {
            tempToken: { type: 'string' },
            phone: { type: 'string', minLength: 10, maxLength: 15 },
            code: { type: 'string', minLength: 6, maxLength: 6 },
            whatsappOptIn: { type: 'boolean', default: true },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { tempToken, phone, code, whatsappOptIn } = request.body as {
        tempToken: string;
        phone: string;
        code: string;
        whatsappOptIn?: boolean;
      };

      let decoded: TempTokenPayload;
      try {
        decoded = fastify.jwt.verify<TempTokenPayload>(tempToken);
        if (decoded.purpose !== 'PHONE_VERIFICATION') throw new Error('Invalid token purpose');
      } catch {
        throw new UnauthorizedError('Invalid or expired onboarding session');
      }

      const cleanPhone = phone.trim();

      // Verify OTP code
      await fastify.otpService.verifyOtp(cleanPhone, code, 'VERIFY');

      // Update User record with verified phone & whatsappOptIn
      const user = await fastify.prisma.user.update({
        where: { id: decoded.userId },
        data: {
          phone: cleanPhone,
          isPhoneVerified: true,
          whatsappOptIn: whatsappOptIn ?? true,
        },
      });

      // Issue full JWT access & refresh tokens
      const accessToken = fastify.jwt.sign(
        { sub: user.id, role: user.role ?? 'USER' } as any,
        { expiresIn: env.JWT_ACCESS_EXPIRY },
      );

      const refreshToken = fastify.jwt.sign(
        { sub: user.id } as any,
        { expiresIn: env.JWT_REFRESH_EXPIRY },
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await fastify.prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      });

      return reply.send({
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          role: user.role,
          isPhoneVerified: user.isPhoneVerified,
          whatsappOptIn: user.whatsappOptIn,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    },
  );
}
