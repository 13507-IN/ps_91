import type { FastifyPluginAsync } from 'fastify';
import { AdminService } from './admin.service.js';
import { triggerIngestionParamsSchema, triggerIngestionBodySchema, triggerAllIngestionBodySchema } from './admin.schema.js';
import type { IngestionSource } from '../../ingestion/types.js';

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  const adminService = new AdminService(fastify.prisma);

  // Require auth for admin routes
  fastify.addHook('onRequest', fastify.authenticate);

  /**
   * GET /api/admin/ingest/pipelines
   * List available pipelines and execution order
   */
  fastify.get('/ingest/pipelines', {
    schema: {
      tags: ['Admin Ingestion'],
      summary: 'Get ingestion pipeline order and info',
      response: {
        200: {
          type: 'object',
          properties: {
            order: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    handler: async () => {
      return adminService.getPipelineInfo();
    },
  });

  /**
   * POST /api/admin/ingest/:source
   * Trigger ingestion for a specific data source
   */
  fastify.post('/ingest/:source', {
    schema: {
      tags: ['Admin Ingestion'],
      summary: 'Trigger data ingestion pipeline for a specific source',
      params: {
        type: 'object',
        properties: {
          source: { type: 'string' },
        },
        required: ['source'],
      },
      body: {
        type: 'object',
        properties: {
          filePath: { type: 'string' },
          dryRun: { type: 'boolean', default: false },
          batchSize: { type: 'number', default: 500 },
        },
        required: ['filePath'],
      },
    },
    handler: async (request, reply) => {
      const params = triggerIngestionParamsSchema.parse(request.params);
      const body = triggerIngestionBodySchema.parse(request.body);

      const result = await adminService.triggerIngestion(
        params.source as IngestionSource,
        body.filePath,
        { dryRun: body.dryRun, batchSize: body.batchSize },
      );

      return reply.status(202).send(result);
    },
  });

  /**
   * POST /api/admin/ingest/all
   * Trigger all ingestion pipelines in order
   */
  fastify.post('/ingest/all', {
    schema: {
      tags: ['Admin Ingestion'],
      summary: 'Trigger all data ingestion pipelines in order',
      body: {
        type: 'object',
        properties: {
          fileMap: { type: 'object', additionalProperties: { type: 'string' } },
          dryRun: { type: 'boolean', default: false },
          batchSize: { type: 'number', default: 500 },
        },
        required: ['fileMap'],
      },
    },
    handler: async (request, reply) => {
      const body = triggerAllIngestionBodySchema.parse(request.body);

      const result = await adminService.triggerAllIngestions(
        body.fileMap as Partial<Record<IngestionSource, string>>,
        { dryRun: body.dryRun, batchSize: body.batchSize },
      );

      return reply.status(202).send(result);
    },
  });

  /**
   * GET /api/admin/ingest/status
   * GET /api/admin/ingest/status?jobId=...
   * Check status of ingestion jobs
   */
  fastify.get('/ingest/status', {
    schema: {
      tags: ['Admin Ingestion'],
      summary: 'Get ingestion job status',
      querystring: {
        type: 'object',
        properties: {
          jobId: { type: 'string' },
        },
      },
    },
    handler: async (request) => {
      const { jobId } = request.query as { jobId?: string };
      return adminService.getJobStatus(jobId);
    },
  });
};
