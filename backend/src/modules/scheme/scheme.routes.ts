import type { FastifyPluginAsync } from 'fastify';
import { SchemeService } from './scheme.service.js';
import { matchSchemesInputSchema, getSchemeParamsSchema } from './scheme.schema.js';

export const schemeRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new SchemeService();

  /**
   * POST /api/schemes/match
   * Evaluate user facts and return eligible government schemes with full financial projections
   */
  fastify.post('/match', {
    schema: {
      tags: ['Scheme Engine'],
      summary: 'Match eligible government schemes and calculate subsidy & loan benefits',
      body: {
        type: 'object',
        properties: {
          age: { type: 'integer' },
          gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
          category: { type: 'string', enum: ['GENERAL', 'SC', 'ST', 'OBC', 'MINORITY'] },
          isMinority: { type: 'boolean' },
          businessCategory: { type: 'string' },
          projectCost: { type: 'number' },
          availableMargin: { type: 'number' },
          state: { type: 'string', default: 'West Bengal' },
          district: { type: 'string' },
        },
        required: ['projectCost'],
      },
    },
    handler: async (request, reply) => {
      const body = matchSchemesInputSchema.parse(request.body);
      const results = service.matchSchemes(body);
      return reply.send({
        totalMatched: results.length,
        schemes: results,
      });
    },
  });

  /**
   * GET /api/schemes
   * List all active schemes
   */
  fastify.get('/', {
    schema: {
      tags: ['Scheme Engine'],
      summary: 'List all available government schemes',
    },
    handler: async () => {
      return service.getAllSchemes();
    },
  });

  /**
   * GET /api/schemes/:id
   * Get scheme by ID
   */
  fastify.get('/:id', {
    schema: {
      tags: ['Scheme Engine'],
      summary: 'Get detailed information for a specific scheme',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
    handler: async (request, reply) => {
      const params = getSchemeParamsSchema.parse(request.params);
      const scheme = service.getSchemeById(params.id);
      return reply.send(scheme);
    },
  });
};
