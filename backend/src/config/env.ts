import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DIRECT_DATABASE_URL: z.string().url('DIRECT_DATABASE_URL must be a valid URL'),

  // Redis
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  REDIS_TOKEN: z.string().min(1, 'REDIS_TOKEN is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // AI Service
  AI_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  AI_SERVICE_TIMEOUT_MS: z.coerce.number().positive().default(30000),

  // Server
  PORT: z.coerce.number().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Rate Limiting
  RATE_LIMIT_GLOBAL_MAX: z.coerce.number().positive().default(100),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().positive().default(10),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | undefined;

export function loadEnv(): Env {
  if (_env) return _env;

  try {
    if (typeof (process as unknown as { loadEnvFile?: () => void }).loadEnvFile === 'function') {
      (process as unknown as { loadEnvFile: () => void }).loadEnvFile();
    }
  } catch {
    // .env not found or already loaded
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    const errors = Object.entries(formatted)
      .filter(([key]) => key !== '_errors')
      .map(([key, value]) => {
        const errObj = value as { _errors?: string[] };
        return `  ${key}: ${errObj._errors?.join(', ') ?? 'invalid'}`;
      })
      .join('\n');

    throw new Error(`\n❌ Invalid environment variables:\n${errors}\n`);
  }

  _env = result.data;
  return _env;
}

export function getEnv(): Env {
  if (!_env) {
    return loadEnv();
  }
  return _env;
}
