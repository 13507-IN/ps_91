import type { FastifyPluginAsync } from 'fastify';
import { MarketService } from './market.service.js';
import {
  marketIntelligenceBodySchema,
  competitorsQuerySchema,
  pricesQuerySchema,
  infrastructureQuerySchema,
} from './market.schema.js';

export const marketRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new MarketService(fastify.prisma);

  /**
   * POST /api/market/intelligence
   * Full market intelligence across catchment area
   */
  fastify.post('/intelligence', {
    schema: {
      tags: ['Market Intelligence'],
      summary: 'Compute demographic, amenity, and agricultural intelligence across catchment',
      body: {
        type: 'object',
        properties: {
          lat: { type: 'number', description: 'Center latitude' },
          lng: { type: 'number', description: 'Center longitude' },
          radiusKm: { type: 'number', default: 10, description: 'Catchment radius in km' },
          businessCategory: {
            type: 'string',
            enum: [
              'DAIRY',
              'FOOD_PROCESSING',
              'RETAIL',
              'TEXTILES_TAILORING',
              'POULTRY',
              'AGRICULTURE',
              'LIVESTOCK',
              'TRANSPORT',
              'HANDICRAFT',
              'SERVICES',
              'OTHER',
            ],
          },
        },
        required: ['lat', 'lng'],
      },
    },
    handler: async (request, reply) => {
      const body = marketIntelligenceBodySchema.parse(request.body);
      const result = await service.getMarketIntelligence(
        body.lat,
        body.lng,
        body.radiusKm,
        body.businessCategory,
      );
      return reply.send(result);
    },
  });

  /**
   * GET /api/market/competitors
   * Competitor analysis with confidence-aware breakdown (Observed, Reported, Inferred)
   */
  fastify.get('/competitors', {
    schema: {
      tags: ['Market Intelligence'],
      summary: 'Get observed, reported, and AI-inferred competitors in catchment',
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
      const query = competitorsQuerySchema.parse(request.query);
      const result = await service.getCompetitorAnalysis(
        query.lat,
        query.lng,
        query.radiusKm,
        query.category,
      );
      return reply.send(result);
    },
  });

  /**
   * GET /api/market/prices
   * Mandi commodity prices from AGMARKNET
   */
  fastify.get('/prices', {
    schema: {
      tags: ['Market Intelligence'],
      summary: 'Get mandi wholesale commodity prices from AGMARKNET records',
      querystring: {
        type: 'object',
        properties: {
          commodity: { type: 'string', description: 'e.g. Milk, Potato, Jute, Paddy' },
          district: { type: 'string', default: 'Nadia' },
        },
        required: ['commodity'],
      },
    },
    handler: async (request, reply) => {
      const query = pricesQuerySchema.parse(request.query);
      const result = await service.getCommodityPrices(query.commodity, query.district);
      return reply.send(result);
    },
  });

  /**
   * GET /api/market/infrastructure
   * Village amenities & road connectivity
   */
  fastify.get('/infrastructure', {
    schema: {
      tags: ['Market Intelligence'],
      summary: 'Get village amenities and road connectivity for a specific village',
      querystring: {
        type: 'object',
        properties: {
          villageId: { type: 'integer' },
        },
        required: ['villageId'],
      },
    },
    handler: async (request, reply) => {
      const query = infrastructureQuerySchema.parse(request.query);
      const result = await service.getInfrastructure(query.villageId);
      return reply.send(result);
    },
  });

  /**
   * GET /api/market/seasonal-calendar
   * 12-month business seasonality, price trends & demand forecast
   */
  fastify.get('/seasonal-calendar', {
    schema: {
      tags: ['Market Intelligence'],
      summary: 'Get 12-month seasonal timeline, price index, and festival demand cycles for a business category',
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string', default: 'DAIRY' },
          district: { type: 'string', default: 'Nadia' },
        },
      },
    },
    handler: async (request, reply) => {
      const { SeasonalService } = await import('./seasonal.service.js');
      const seasonalService = new SeasonalService(fastify.prisma);
      const query = request.query as { category?: string; district?: string };
      const category = (query.category as any) || 'DAIRY';
      const district = query.district || 'Nadia';
      const result = await seasonalService.getSeasonalCalendar(category, district);
      return reply.send(result);
    },
  });
};
