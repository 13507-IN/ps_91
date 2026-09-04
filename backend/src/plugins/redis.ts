import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Redis } from '@upstash/redis';
import { getEnv } from '../config/env.js';
import { setRedisClient } from '../lib/cache.js';

/**
 * Upstash Redis plugin — decorates fastify.redis with an Upstash Redis client.
 * Also initializes the cache helper module.
 */
async function redisPlugin(fastify: FastifyInstance): Promise<void> {
  const env = getEnv();

  const redis = new Redis({
    url: env.REDIS_URL,
    token: env.REDIS_TOKEN,
  });

  // Test connection
  try {
    await redis.ping();
    fastify.log.info('✅ Redis (Upstash) connected');
  } catch (err) {
    fastify.log.error(err, '❌ Redis connection failed');
    throw err;
  }

  // Initialize cache helpers
  setRedisClient(redis as never);

  fastify.decorate('redis', redis);
}

export default fp(redisPlugin, {
  name: 'redis',
});
