import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerSchema, loginSchema, refreshSchema } from './auth.schema.js';
import { AuthService } from './auth.service.js';
import { BadRequestError } from '../../lib/errors.js';
import { getEnv } from '../../config/env.js';

// ============================================================
// Auth Routes
// ============================================================

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const authService = new AuthService(fastify);
  const env = getEnv();

  // ---- POST /api/auth/register ----
  fastify.post(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Create a new account with phone number and password.',
        body: {
          type: 'object',
          required: ['phone', 'password'],
          properties: {
            phone: { type: 'string', minLength: 10, maxLength: 15 },
            password: { type: 'string', minLength: 8, maxLength: 128 },
            name: { type: 'string', maxLength: 200 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  phone: { type: 'string' },
                  name: { type: 'string', nullable: true },
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
        },
      },
      config: {
        rateLimit: {
          max: env.RATE_LIMIT_AUTH_MAX,
          timeWindow: '1 minute',
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = registerSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      const result = await authService.register(parsed.data);
      return reply.status(201).send(result);
    },
  );

  // ---- POST /api/auth/login ----
  fastify.post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Login with phone and password',
        description: 'Authenticate and receive access + refresh tokens.',
        body: {
          type: 'object',
          required: ['phone', 'password'],
          properties: {
            phone: { type: 'string' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  phone: { type: 'string' },
                  name: { type: 'string', nullable: true },
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
        },
      },
      config: {
        rateLimit: {
          max: env.RATE_LIMIT_AUTH_MAX,
          timeWindow: '1 minute',
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = loginSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      const result = await authService.login(parsed.data);
      return reply.send(result);
    },
  );

  // ---- POST /api/auth/refresh ----
  fastify.post(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        description: 'Exchange a valid refresh token for a new access + refresh token pair.',
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = refreshSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      const tokens = await authService.refresh(parsed.data.refreshToken);
      return reply.send(tokens);
    },
  );

  // ---- POST /api/auth/logout ----
  fastify.post(
    '/logout',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Auth'],
        summary: 'Logout',
        description: 'Invalidate the refresh token.',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = refreshSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      await authService.logout(parsed.data.refreshToken);
      return reply.send({ message: 'Logged out successfully' });
    },
  );
}
