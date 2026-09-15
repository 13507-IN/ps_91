import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { BusinessService } from './business.service.js';

const verifyBodySchema = z.object({
  action: z.enum(['CONFIRM', 'FLAG']).default('CONFIRM'),
  notes: z.string().optional(),
});

const unverifiedQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(100).optional().default(25),
});

const leaderboardQuerySchema = z.object({
  blockId: z.coerce.number().int().positive().optional(),
  districtId: z.coerce.number().int().positive().optional(),
});

export const verificationRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new BusinessService(fastify.prisma);

  /**
   * POST /api/businesses/:id/verify
   * Submit community confirmation or flag for a business
   */
  fastify.post<{ Params: { id: string } }>('/:id/verify', {
    schema: {
      tags: ['Community Intelligence'],
      summary: 'Verify or flag a community-reported informal business',
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['CONFIRM', 'FLAG'] },
          notes: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      const body = verifyBodySchema.parse(request.body ?? {});

      let userId: string | undefined;
      try {
        await fastify.authenticate(request, reply);
        userId = request.userId;
      } catch {
        // Guest verifications supported
      }

      const updated = await service.verifyBusiness(id, userId, body.action, body.notes);
      return reply.send({ success: true, business: updated });
    },
  });

  /**
   * GET /api/businesses/unverified
   * List nearby unverified business reports
   */
  fastify.get('/unverified', {
    schema: {
      tags: ['Community Intelligence'],
      summary: 'List nearby unverified business reports needing community verification',
    },
    handler: async (request, reply) => {
      const query = unverifiedQuerySchema.parse(request.query);
      const result = await service.getUnverifiedNearby(query.lat, query.lng, query.radiusKm);
      return reply.send(result);
    },
  });

  /**
   * GET /api/businesses/community/leaderboard
   * Get contributor leaderboard and gamification badges
   */
  fastify.get('/community/leaderboard', {
    schema: {
      tags: ['Community Intelligence'],
      summary: 'Get community contributor leaderboard, trust scores, and badges',
    },
    handler: async (request, reply) => {
      const query = leaderboardQuerySchema.parse(request.query);
      const result = await service.getLeaderboard(query.blockId, query.districtId);
      return reply.send(result);
    },
  });
};
