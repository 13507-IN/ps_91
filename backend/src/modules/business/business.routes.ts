import type { FastifyPluginAsync } from 'fastify';
import { BusinessService } from './business.service.js';
import {
  listBusinessesQuerySchema,
  createBusinessBodySchema,
  businessDensityQuerySchema,
} from './business.schema.js';

export const businessRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new BusinessService(fastify.prisma);

  /**
   * GET /api/businesses/categories
   * List supported business categories (public)
   */
  fastify.get('/categories', {
    schema: {
      tags: ['Enterprise & Business Registry'],
      summary: 'List supported business categories with typical investment ranges and subcategories',
    },
    handler: async () => {
      return service.getCategories();
    },
  });

  /**
   * GET /api/businesses
   * List registered businesses with pagination
   */
  fastify.get('/', {
    schema: {
      tags: ['Enterprise & Business Registry'],
      summary: 'List formal and informal enterprises with pagination and category filtering',
      querystring: {
        type: 'object',
        properties: {
          villageId: { type: 'integer' },
          category: { type: 'string' },
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20 },
        },
      },
    },
    handler: async (request, reply) => {
      const query = listBusinessesQuerySchema.parse(request.query);
      const results = await service.listBusinesses(query);
      return reply.send(results);
    },
  });

  /**
   * POST /api/businesses
   * Community reporting / crowdsourced business registration
   */
  fastify.post('/', {
    schema: {
      tags: ['Enterprise & Business Registry'],
      summary: 'Register a formal or informal local business (Community Intelligence)',
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          category: { type: 'string' },
          subcategory: { type: 'string' },
          products: { type: 'array', items: { type: 'string' } },
          villageId: { type: 'integer' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          scale: { type: 'string', enum: ['MICRO', 'SMALL', 'MEDIUM'] },
          priceRange: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          seasonality: { type: 'string' },
        },
        required: ['name', 'category', 'products'],
      },
    },
    handler: async (request, reply) => {
      const body = createBusinessBodySchema.parse(request.body);
      const business = await service.createBusiness(body);
      return reply.status(201).send(business);
    },
  });

  /**
   * GET /api/businesses/density
   * Catchment enterprise density calculation
   */
  fastify.get('/density', {
    schema: {
      tags: ['Enterprise & Business Registry'],
      summary: 'Calculate business density per square kilometer in catchment',
      querystring: {
        type: 'object',
        properties: {
          lat: { type: 'number' },
          lng: { type: 'number' },
          radiusKm: { type: 'number', default: 10 },
          category: { type: 'string' },
        },
        required: ['lat', 'lng'],
      },
    },
    handler: async (request, reply) => {
      const query = businessDensityQuerySchema.parse(request.query);
      const result = await service.getBusinessDensity(
        query.lat,
        query.lng,
        query.radiusKm,
        query.category,
      );
      return reply.send(result);
    },
  });
};
