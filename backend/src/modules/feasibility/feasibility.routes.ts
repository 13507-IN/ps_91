import type { FastifyPluginAsync } from 'fastify';
import { FeasibilityService } from './feasibility.service.js';
import {
  analyzeFeasibilityBodySchema,
  getAnalysisParamsSchema,
} from './feasibility.schema.js';

export const feasibilityRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new FeasibilityService(fastify.prisma);

  /**
   * POST /api/feasibility/analyze
   * The core end-to-end evaluation endpoint
   */
  fastify.post('/analyze', {
    schema: {
      tags: ['Feasibility & Decision Support'],
      summary: 'Run end-to-end feasibility analysis: Market + Financial + Scheme + Risk + AI',
      body: {
        type: 'object',
        properties: {
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          villageId: { type: 'integer' },
          catchmentRadiusKm: { type: 'number', default: 10 },
          businessCategory: { type: 'string' },
          businessIdea: { type: 'string' },
          availableCapital: { type: 'number' },
          age: { type: 'integer' },
          gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
          category: { type: 'string', enum: ['GENERAL', 'SC', 'ST', 'OBC', 'MINORITY'] },
          isMinority: { type: 'boolean' },
          businessExperience: { type: 'string' },
          availableLand: { type: 'string' },
          availableEquipment: { type: 'string' },
          expectedWorkingHours: { type: 'number' },
        },
        required: ['latitude', 'longitude', 'businessIdea', 'availableCapital'],
      },
    },
    handler: async (request, reply) => {
      const body = analyzeFeasibilityBodySchema.parse(request.body);
      
      // Optional authenticated user id
      let userId: string | undefined;
      try {
        await fastify.authenticate(request, reply);
        userId = request.userId;
      } catch {
        // Unauthenticated guest evaluation is supported
      }

      const result = await service.analyze(body, userId);
      return reply.send(result);
    },
  });

  /**
   * GET /api/feasibility/analyses
   * List saved feasibility analyses for logged-in user
   */
  fastify.get('/analyses', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Feasibility & Decision Support'],
      summary: 'List past feasibility analyses for current user',
    },
    handler: async (request, reply) => {
      if (!request.userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      const list = await service.listUserAnalyses(request.userId);
      return reply.send({
        total: list.length,
        analyses: list,
      });
    },
  });

  /**
   * GET /api/feasibility/analyses/:id
   * Get complete details of a saved analysis
   */
  fastify.get('/analyses/:id', {
    schema: {
      tags: ['Feasibility & Decision Support'],
      summary: 'Get full details of a saved feasibility analysis',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
    handler: async (request, reply) => {
      const params = getAnalysisParamsSchema.parse(request.params);
      let userId: string | undefined;
      try {
        await fastify.authenticate(request, reply);
        userId = request.userId;
      } catch {
        // Optional
      }

      const analysis = await service.getAnalysisById(params.id, userId);
      return reply.send(analysis);
    },
  });
};
