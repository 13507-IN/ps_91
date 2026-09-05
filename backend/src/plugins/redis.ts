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
    setRedisClient(redis as never);
    fastify.decorate('redis', redis);
  } catch (err) {
    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      fastify.log.warn(
        '⚠️ Upstash Redis connection failed or offline. Using in-memory fallback cache for development.',
      );
      const inMemoryStore = new Map<string, { val: string; expiresAt?: number }>();
      const mockRedis = {
        async get(key: string): Promise<string | null> {
          const entry = inMemoryStore.get(key);
          if (!entry) return null;
          if (entry.expiresAt && Date.now() > entry.expiresAt) {
            inMemoryStore.delete(key);
            return null;
          }
          return entry.val;
        },
        async set(key: string, value: string, opts?: { ex?: number }): Promise<string> {
          inMemoryStore.set(key, {
            val: value,
            expiresAt: opts?.ex ? Date.now() + opts.ex * 1000 : undefined,
          });
          return 'OK';
        },
        async del(...keys: string[]): Promise<number> {
          let count = 0;
          for (const k of keys) {
            if (inMemoryStore.delete(k)) count++;
          }
          return count;
        },
        async ping(): Promise<string> {
          return 'PONG';
        },
      };

      setRedisClient(mockRedis as never);
      fastify.decorate('redis', mockRedis as never);
    } else {
      fastify.log.error(err, '❌ Redis connection failed');
      throw err;
    }
  }
}

export default fp(redisPlugin, {
  name: 'redis',
});
