import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

/**
 * Swagger/OpenAPI plugin — auto-generates API docs from route schemas.
 * Accessible at /docs in development.
 */
async function swaggerPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'UdyamSetu AI — Backend API',
        description:
          'Hyper-Local Enterprise Intelligence & Credit Readiness Platform API. ' +
          'Provides market intelligence, financial calculations, scheme matching, ' +
          'and feasibility analysis for rural entrepreneurs.',
        version: '0.1.0',
        contact: {
          name: 'UdyamSetu Team',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local development',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'User Profile', description: 'User profile management' },
        { name: 'Geospatial & Location', description: 'Village search & proximity lookup' },
        { name: 'Market Intelligence', description: 'Catchment demographics, prices & infrastructure' },
        { name: 'Enterprise & Business Registry', description: 'Business registry & community reporting' },
        { name: 'Financial Engine', description: 'EMI, cashflow, breakeven, stress testing' },
        { name: 'Scheme Engine', description: 'Government scheme auto-selection' },
        { name: 'AI Intelligence Layer', description: 'AI classification, demand, risk & recommendations' },
        { name: 'Feasibility & Decision Support', description: 'Full end-to-end feasibility analysis' },
        { name: 'Admin Ingestion', description: 'Data ingestion management' },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true,
    },
  });
}

export default fp(swaggerPlugin, {
  name: 'swagger',
});
