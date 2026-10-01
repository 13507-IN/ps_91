import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyPassport from '@fastify/passport';
import { getEnv } from '../../config/env.js';

export async function googleAuthRoutes(fastify: FastifyInstance): Promise<void> {
  const env = getEnv();
  const FRONTEND_URL = env.FRONTEND_URL;

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
        description: 'Processes Google profile, generates tokens and redirects directly to frontend.',
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

      // Issue full JWT access & refresh tokens directly (no OTP required)
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
    },
  );
}
