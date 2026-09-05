import type { FastifyPluginAsync } from 'fastify';
import { LocationService } from './location.service.js';
import {
  searchVillagesQuerySchema,
  getVillageParamsSchema,
  nearbyVillagesQuerySchema,
} from './location.schema.js';

export const locationRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new LocationService(fastify.prisma);

  /**
   * GET /api/locations/search
   * Search villages by name
   */
  fastify.get('/search', {
    schema: {
      tags: ['Geospatial & Location'],
      summary: 'Search villages by name with administrative hierarchy',
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', description: 'Search query' },
          limit: { type: 'integer', default: 20 },
        },
        required: ['q'],
      },
    },
    handler: async (request, reply) => {
      const query = searchVillagesQuerySchema.parse(request.query);
      const villages = await service.searchVillages(query.q, query.limit);
      return reply.send({
        total: villages.length,
        villages,
      });
    },
  });

  /**
   * GET /api/locations/nearby
   * Find villages within catchment radius
   */
  fastify.get('/nearby', {
    schema: {
      tags: ['Geospatial & Location'],
      summary: 'Find nearby villages within a catchment radius using spatial indexing',
      querystring: {
        type: 'object',
        properties: {
          lat: { type: 'number', description: 'Center latitude' },
          lng: { type: 'number', description: 'Center longitude' },
          radiusKm: { type: 'number', default: 10, description: 'Catchment radius in km' },
          limit: { type: 'integer', default: 50 },
        },
        required: ['lat', 'lng'],
      },
    },
    handler: async (request, reply) => {
      const query = nearbyVillagesQuerySchema.parse(request.query);
      const villages = await service.getNearbyVillages(
        query.lat,
        query.lng,
        query.radiusKm,
        query.limit,
      );
      return reply.send({
        center: { lat: query.lat, lng: query.lng },
        radiusKm: query.radiusKm,
        total: villages.length,
        villages,
      });
    },
  });

  /**
   * GET /api/locations/villages/:id
   * Get village profile with census, amenities, crops, livestock, and roads
   */
  fastify.get('/villages/:id', {
    schema: {
      tags: ['Geospatial & Location'],
      summary: 'Get full village profile with demographics, amenities, and connectivity',
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Village LGD / Census ID' },
        },
        required: ['id'],
      },
    },
    handler: async (request, reply) => {
      const params = getVillageParamsSchema.parse(request.params);
      const village = await service.getVillageById(params.id);
      return reply.send(village);
    },
  });
};
