import { getEnv } from '../config/env.js';

// ============================================================
// Redis Cache Helpers
// ============================================================

interface RedisLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, opts?: { ex?: number }): Promise<string | null>;
  del(...keys: string[]): Promise<number>;
}

let redisClient: RedisLike | null = null;

export function setRedisClient(client: RedisLike): void {
  redisClient = client;
}

function getRedis(): RedisLike {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Register the Redis plugin first.');
  }
  return redisClient;
}

/**
 * Get a cached value. Returns parsed JSON or null if not found.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await getRedis().get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch {
    // Cache errors should not break the app — log and continue
    return null;
  }
}

/**
 * Set a cached value with TTL (seconds).
 */
export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    await getRedis().set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch {
    // Cache errors should not break the app — silently fail
  }
}

/**
 * Delete one or more cache keys.
 */
export async function cacheDel(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) {
      await getRedis().del(...keys);
    }
  } catch {
    // Cache errors should not break the app
  }
}

/**
 * Build a namespaced cache key.
 */
export function cacheKey(namespace: string, ...parts: (string | number)[]): string {
  return `udyamsetu:${namespace}:${parts.join(':')}`;
}
