import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BadRequestError } from '../../lib/errors.js';
import { getEnv } from '../../config/env.js';
import { sendOtpSchema, verifyOtpSchema } from './otp.mdel.js';

// ============================================================
// OTP Auth Routes
//   POST /api/auth/otp/send   |  POST /api/auth/send-otp
//   POST /api/auth/otp/verify |  POST /api/auth/verify-otp
// ============================================================

export async function otpAuthRoutes(fastify: FastifyInstance): Promise<void> {
  // Reuse the singleton OtpService registered by the auth-control plugin.
  const otpService = fastify.otpService;
  const env = getEnv();

  // ---- Request OTP to be sent to a phone number ----
  const handleSendOtp = async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = sendOtpSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0]?.message ?? 'Invalid input');
    }

    const result = await otpService.sendOtp(parsed.data.phone, parsed.data.purpose);
    return reply.send(result);
  };

  // ---- Verify OTP and authenticate; registers user if first time ----
  const handleVerifyOtp = async (request: FastifyRequest, reply: FastifyReply) => {
    // Accept the code under both the `code` (otp/verify) and the
    // `otp` (verify-otp) field names.
    const raw = (request.body ?? {}) as Record<string, unknown>;
    const parsed = verifyOtpSchema.safeParse({
      ...raw,
      code: raw.code ?? raw.otp,
    });
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0]?.message ?? 'Invalid input');
    }

    const result = await otpService.verifyOtp(
      parsed.data.phone,
      parsed.data.code,
      parsed.data.purpose,
      parsed.data.name,
    );

    return reply.send(result);
  };

  // Shared OpenAPI bodies
  const sendBody = {
    type: 'object',
    required: ['phone'],
    properties: {
      phone: { type: 'string', minLength: 10, maxLength: 15, description: 'Indian mobile number (10 digits or with +91)' },
      purpose: { type: 'string', enum: ['REGISTER', 'LOGIN', 'VERIFY'], default: 'REGISTER' },
      name: { type: 'string', maxLength: 200 },
    },
  };

  const verifyBody = {
    type: 'object',
    required: ['phone'],
    properties: {
      phone: { type: 'string', minLength: 10, maxLength: 15 },
      code: { type: 'string', minLength: 6, maxLength: 6 },
      otp: { type: 'string', minLength: 6, maxLength: 6, description: 'Alias for code' },
      purpose: { type: 'string', enum: ['REGISTER', 'LOGIN', 'VERIFY'], default: 'REGISTER' },
      name: { type: 'string', maxLength: 200 },
    },
  };

  const sendResponse = {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        expiresInMinutes: { type: 'number' },
        devOtp: { type: 'string', nullable: true },
      },
    },
  };

  const verifyResponse = {
    200: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            phone: { type: 'string' },
            name: { type: 'string', nullable: true },
            isNew: { type: 'boolean' },
          },
        },
        tokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
      },
    },
  };

  // ---- POST /api/auth/otp/send ----
  fastify.post(
    '/otp/send',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Send OTP to phone number',
        description:
          'Generates a 6-digit OTP and sends it via SMS (httpSMS). In development mode the OTP is returned in the response body.',
        body: sendBody,
        response: sendResponse,
      },
      config: { rateLimit: { max: env.RATE_LIMIT_AUTH_MAX, timeWindow: '1 minute' } },
    },
    handleSendOtp,
  );

  // ---- POST /api/auth/send-otp (alias) ----
  fastify.post(
    '/send-otp',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Send OTP to phone number (alias)',
        description:
          'Alias for POST /api/auth/otp/send. Generates a 6-digit OTP and sends it via SMS (httpSMS).',
        body: sendBody,
        response: sendResponse,
      },
      config: { rateLimit: { max: env.RATE_LIMIT_AUTH_MAX, timeWindow: '1 minute' } },
    },
    handleSendOtp,
  );

  // ---- POST /api/auth/otp/verify ----
  fastify.post(
    '/otp/verify',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Verify OTP and authenticate',
        description:
          'Verifies the 6-digit OTP for a phone number. Registers a new user if first time, or logs in an existing user. Returns JWT access + refresh tokens.',
        body: verifyBody,
        response: verifyResponse,
      },
      config: { rateLimit: { max: env.RATE_LIMIT_AUTH_MAX, timeWindow: '1 minute' } },
    },
    handleVerifyOtp,
  );

  // ---- POST /api/auth/verify-otp (alias) ----
  fastify.post(
    '/verify-otp',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Verify OTP and authenticate (alias)',
        description:
          'Alias for POST /api/auth/otp/verify. Verifies the 6-digit OTP (field `otp`) and issues JWT tokens.',
        body: verifyBody,
        response: verifyResponse,
      },
      config: { rateLimit: { max: env.RATE_LIMIT_AUTH_MAX, timeWindow: '1 minute' } },
    },
    handleVerifyOtp,
  );
}