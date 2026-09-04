import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import fjwt from '@fastify/jwt';
import { getEnv } from '../config/env.js';
import { UnauthorizedError } from '../lib/errors.js';

/**
 * JWT Auth plugin — registers @fastify/jwt and decorates fastify.authenticate.
 * Use `{ onRequest: [fastify.authenticate] }` on protected routes.
 */
async function authPlugin(fastify: FastifyInstance): Promise<void> {
  const env = getEnv();

  await fastify.register(fjwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_ACCESS_EXPIRY,
    },
  });

  // Authentication preHandler
  const authenticate = async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    try {
      const decoded = await request.jwtVerify<{ sub: string }>();
      request.userId = decoded.sub;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  };

  fastify.decorate('authenticate', authenticate);
}

export default fp(authPlugin, {
  name: 'auth',
});
