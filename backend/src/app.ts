import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { getEnv } from './config/env.js';
import { API_PREFIX } from './config/constants.js';
import { AppError } from './lib/errors.js';

// Plugins
import prismaPlugin from './plugins/prisma.js';
import redisPlugin from './plugins/redis.js';
import authPlugin from './plugins/auth.js';
import rateLimitPlugin from './plugins/rateLimit.js';
import swaggerPlugin from './plugins/swagger.js';

// Routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { userRoutes } from './modules/user/user.routes.js';

// ============================================================
// App Factory — creates and configures the Fastify instance
// ============================================================

export async function buildApp() {
  const env = getEnv();

  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // ---- Security ----
  await app.register(cors, {
    origin: env.NODE_ENV === 'production' ? false : true, // Configure for production
    credentials: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  });

  // ---- Swagger (before routes so it picks up schemas) ----
  await app.register(swaggerPlugin);

  // ---- Rate Limiting ----
  await app.register(rateLimitPlugin);

  // ---- Database & Cache ----
  await app.register(prismaPlugin);
  await app.register(redisPlugin);

  // ---- Auth ----
  await app.register(authPlugin);

  // ---- Global Error Handler ----
  app.setErrorHandler((error: any, request, reply) => {
    // Handle our custom AppErrors
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
    }

    // Handle Fastify validation errors
    if (error.validation) {
      return reply.status(400).send({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: error.message,
      });
    }

    // Handle rate limit errors
    if (error.statusCode === 429) {
      return reply.status(429).send({
        statusCode: 429,
        code: 'TOO_MANY_REQUESTS',
        message: error.message,
      });
    }

    // Unexpected errors
    request.log.error(error, 'Unhandled error');
    return reply.status(500).send({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message:
        env.NODE_ENV === 'production' ? 'An internal error occurred' : error.message,
    });
  });

  // ---- Health Check ----
  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
              version: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      return reply.send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '0.1.0',
      });
    },
  );

  // ---- API Routes ----
  await app.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
  await app.register(userRoutes, { prefix: `${API_PREFIX}/users` });

  return app;
}
