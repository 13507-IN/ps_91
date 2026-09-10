import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

import { getEnv } from './config/env.js';
import authPlugin from './plugins/auth.js';
import prismaPlugin from './plugins/prisma.js';
import rateLimitPlugin from './plugins/rateLimit.js';
import redisPlugin from './plugins/redis.js';
import swaggerPlugin from './plugins/swagger.js';

import { authRoutes } from './modules/auth/auth.routes.js';
import { userRoutes } from './modules/user/user.routes.js';
import { schemeRoutes } from './modules/scheme/scheme.routes.js';
import { marketRoutes } from './modules/market/market.routes.js';
import { feasibilityRoutes } from './modules/feasibility/feasibility.routes.js';
import { businessRoutes } from './modules/business/business.routes.js';
import { locationRoutes } from './modules/location/location.routes.js';
import { financialRoutes } from './modules/financial/financial.routes.js';
import { aiRoutes } from './modules/ai/ai.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const env = getEnv();

  const app = Fastify({
    logger:
      env.NODE_ENV === 'development'
        ? {
            transport: {
              target: 'pino-pretty',
            },
          }
        : true,
    ignoreTrailingSlash: true,
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(helmet, {
    global: true,
  });

  await app.register(rateLimitPlugin);
  await app.register(swaggerPlugin);
  await app.register(prismaPlugin);
  await app.register(redisPlugin);
  await app.register(authPlugin);

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(schemeRoutes, { prefix: '/api/schemes' });
  await app.register(marketRoutes, { prefix: '/api/market' });
  await app.register(feasibilityRoutes, { prefix: '/api/feasibility' });
  await app.register(businessRoutes, { prefix: '/api/business' });
  await app.register(locationRoutes, { prefix: '/api/location' });
  await app.register(financialRoutes, { prefix: '/api/financial' });
  await app.register(aiRoutes, { prefix: '/api/ai' });
  await app.register(adminRoutes, { prefix: '/api/admin' });

  app.get('/health', async () => ({
    ok: true,
    service: 'udyamsetu-backend',
    environment: env.NODE_ENV,
  }));

  return app;
}
