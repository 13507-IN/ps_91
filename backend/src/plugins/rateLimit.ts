import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import { getEnv } from '../config/env.js';

/**
 * Rate limiting plugin — applies global rate limits.
 * Per-route limits can be overridden using route config.
 */
async function rateLimitPlugin(fastify: FastifyInstance): Promise<void> {
  const env = getEnv();

  await fastify.register(rateLimit, {
    max: env.RATE_LIMIT_GLOBAL_MAX,
    timeWindow: '1 minute',
    errorResponseBuilder: (_request, context) => ({
      statusCode: 429,
      code: 'TOO_MANY_REQUESTS',
      message: `Rate limit exceeded. Retry after ${Math.ceil(context.ttl / 1000)}s`,
      retryAfter: Math.ceil(context.ttl / 1000),
    }),
  });
}

export default fp(rateLimitPlugin, {
  name: 'rate-limit',
});
