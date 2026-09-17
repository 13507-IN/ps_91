import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

export function createPrismaClient(options?: Record<string, unknown>): PrismaClient {
  const connectionString =
    process.env['DATABASE_URL'] ||
    process.env['DIRECT_DATABASE_URL'] ||
    'postgresql://postgres:postgres@localhost:5432/arthsetu';
  // Pool size is configurable so concurrent requests don't queue behind the
  // default 10 connections (queued queries show up as "slow queries").
  const pool = new pg.Pool({
    connectionString,
    max: Number(process.env['DATABASE_POOL_SIZE'] ?? 10),
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter, ...(options as any) });
}

/**
 * Prisma plugin — decorates fastify.prisma with a PrismaClient instance.
 * Handles graceful shutdown on app close.
 */
async function prismaPlugin(fastify: FastifyInstance): Promise<void> {
  const logOptions =
    process.env['NODE_ENV'] === 'development'
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'stdout', level: 'warn' },
          { emit: 'stdout', level: 'error' },
        ]
      : [
          { emit: 'stdout', level: 'warn' },
          { emit: 'stdout', level: 'error' },
        ];

  const prisma = createPrismaClient({ log: logOptions });

  try {
    await prisma.$connect();
    fastify.log.info('✅ Prisma connected to database');
  } catch (err) {
    if (process.env['NODE_ENV'] === 'development' || process.env['NODE_ENV'] === 'test') {
      fastify.log.warn(
        '⚠️ Prisma database connection failed. Ensure PostgreSQL / Neon is running and DATABASE_URL in .env is configured.',
      );
    } else {
      throw err;
    }
  }

  // Log slow queries in development
  if (process.env['NODE_ENV'] === 'development') {
    prisma.$on('query' as never, (e: { duration: number; query: string }) => {
      if (e.duration > 200) {
        fastify.log.warn({ duration: e.duration, query: e.query }, '🐢 Slow query detected');
      }
    });
  }

  fastify.decorate('prisma', prisma);

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    fastify.log.info('Disconnecting Prisma...');
    await prisma.$disconnect();
  });
}

export default fp(prismaPlugin, {
  name: 'prisma',
});
