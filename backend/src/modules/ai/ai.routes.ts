import type { FastifyPluginAsync } from 'fastify';
import { AiClient } from './ai.client.js';
import {
  classifyBusinessInputSchema,
  demandEstimateInputSchema,
  opportunityDiscoveryInputSchema,
  riskAssessmentInputSchema,
  recommendationInputSchema,
  actionPlanInputSchema,
} from './ai.schema.js';

export const aiRoutes: FastifyPluginAsync = async (fastify) => {
  const client = new AiClient();

  /**
   * POST /api/ai/classify
   * Classify free-text business idea into structured category
   */
  fastify.post('/classify', {
    schema: {
      tags: ['AI Intelligence Layer'],
      summary: 'Classify unstructured business idea text into category and subcategory',
      body: {
        type: 'object',
        properties: {
          idea: { type: 'string', description: 'Free-text business description' },
        },
        required: ['idea'],
      },
    },
    handler: async (request, reply) => {
      const body = classifyBusinessInputSchema.parse(request.body);
      const result = await client.classifyBusiness(body);
      return reply.send(result);
    },
  });

  /**
   * POST /api/ai/demand-estimate
   * Estimate local consumption demand given market parameters
   */
  fastify.post('/demand-estimate', {
    schema: {
      tags: ['AI Intelligence Layer'],
      summary: 'Estimate local consumer demand for a business category',
      body: {
        type: 'object',
        properties: {
          businessCategory: { type: 'string' },
          totalPopulation: { type: 'number' },
          totalHouseholds: { type: 'number' },
        },
        required: ['businessCategory', 'totalPopulation', 'totalHouseholds'],
      },
    },
    handler: async (request, reply) => {
      const body = demandEstimateInputSchema.parse(request.body);
      const result = await client.estimateDemand(body);
      return reply.send(result);
    },
  });

  /**
   * POST /api/ai/opportunity-discover
   * Identify market niches and unserved gaps
   */
  fastify.post('/opportunity-discover', {
    schema: {
      tags: ['AI Intelligence Layer'],
      summary: 'Identify hyper-local opportunity niches and market gaps',
      body: {
        type: 'object',
        properties: {
          businessCategory: { type: 'string' },
          existingCompetitors: { type: 'number' },
          estimatedDemandUnits: { type: 'number' },
        },
        required: ['businessCategory', 'existingCompetitors', 'estimatedDemandUnits'],
      },
    },
    handler: async (request, reply) => {
      const body = opportunityDiscoveryInputSchema.parse(request.body);
      const result = await client.discoverOpportunities(body);
      return reply.send(result);
    },
  });

  /**
   * POST /api/ai/risk-assess
   * Risk evaluation and mitigation suggestions
   */
  fastify.post('/risk-assess', {
    schema: {
      tags: ['AI Intelligence Layer'],
      summary: 'Evaluate enterprise operational and credit risks',
      body: {
        type: 'object',
        properties: {
          businessCategory: { type: 'string' },
          projectCost: { type: 'number' },
          loanAmount: { type: 'number' },
          monthlyEmi: { type: 'number' },
        },
        required: ['businessCategory', 'projectCost', 'loanAmount', 'monthlyEmi'],
      },
    },
    handler: async (request, reply) => {
      const body = riskAssessmentInputSchema.parse(request.body);
      const result = await client.assessRisk(body);
      return reply.send(result);
    },
  });

  /**
   * POST /api/ai/recommend
   * AI-generated business recommendation and viability decision
   */
  fastify.post('/recommend', {
    schema: {
      tags: ['AI Intelligence Layer'],
      summary: 'Synthesize full recommendation and explainable viability score',
      body: {
        type: 'object',
        properties: {
          businessCategory: { type: 'string' },
          opportunityScore: { type: 'number' },
          financialViabilityScore: { type: 'number' },
          riskScore: { type: 'number' },
          matchedScheme: { type: 'string' },
        },
        required: ['businessCategory', 'opportunityScore', 'financialViabilityScore', 'riskScore'],
      },
    },
    handler: async (request, reply) => {
      const body = recommendationInputSchema.parse(request.body);
      const result = await client.generateRecommendation(body);
      return reply.send(result);
    },
  });

  /**
   * POST /api/ai/action-plan
   * Generate 30-day funding readiness roadmap
   */
  fastify.post('/action-plan', {
    schema: {
      tags: ['AI Intelligence Layer'],
      summary: 'Generate 30-day step-by-step action plan and funding checklist',
      body: {
        type: 'object',
        properties: {
          businessCategory: { type: 'string' },
          loanAmount: { type: 'number' },
          schemeName: { type: 'string' },
        },
        required: ['businessCategory', 'loanAmount'],
      },
    },
    handler: async (request, reply) => {
      const body = actionPlanInputSchema.parse(request.body);
      const result = await client.generateActionPlan(body);
      return reply.send(result);
    },
  });
};
