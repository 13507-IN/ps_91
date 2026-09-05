import type { FastifyPluginAsync } from 'fastify';
import { FinancialService } from './financial.service.js';
import {
  emiCalculationSchema,
  projectCostCalculationSchema,
  cashflowCalculationSchema,
  breakevenCalculationSchema,
  stressTestSchema,
  fullFinancialPlanSchema,
} from './financial.schema.js';

export const financialRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new FinancialService();

  /**
   * POST /api/financial/emi
   * Standalone EMI calculator with amortization schedule
   */
  fastify.post('/emi', {
    schema: {
      tags: ['Financial Engine'],
      summary: 'Calculate EMI and amortization schedule',
      body: {
        type: 'object',
        properties: {
          principal: { type: 'number' },
          annualRate: { type: 'number' },
          tenureMonths: { type: 'integer' },
          moratoriumMonths: { type: 'integer', default: 0 },
          moratoriumType: { type: 'string', enum: ['INTEREST_ONLY', 'NO_PAYMENT'] },
        },
        required: ['principal', 'annualRate', 'tenureMonths'],
      },
    },
    handler: async (request, reply) => {
      const body = emiCalculationSchema.parse(request.body);
      const result = service.calculateEmi(body);
      return reply.send(result);
    },
  });

  /**
   * POST /api/financial/project-cost
   * Calculate project cost and required loan amount from margin money
   */
  fastify.post('/project-cost', {
    schema: {
      tags: ['Financial Engine'],
      summary: 'Calculate total project cost and required loan amount',
      body: {
        type: 'object',
        properties: {
          availableMargin: { type: 'number' },
          marginPercentage: { type: 'number', default: 10 },
          maxProjectCostCap: { type: 'number' },
        },
        required: ['availableMargin'],
      },
    },
    handler: async (request, reply) => {
      const body = projectCostCalculationSchema.parse(request.body);
      const result = service.calculateProjectCost(body);
      return reply.send(result);
    },
  });

  /**
   * POST /api/financial/cashflow
   * Calculate monthly & quarterly cash flow projections
   */
  fastify.post('/cashflow', {
    schema: {
      tags: ['Financial Engine'],
      summary: 'Calculate monthly and quarterly cash flow projections',
      body: {
        type: 'object',
        properties: {
          monthlyRevenue: { type: 'number' },
          monthlyOperatingCosts: { type: 'number' },
          monthlyEmi: { type: 'number' },
          seasonalityMultipliers: { type: 'array', items: { type: 'number' } },
          annualGrowthRate: { type: 'number', default: 5 },
          projectionMonths: { type: 'integer', default: 12 },
        },
        required: ['monthlyRevenue', 'monthlyOperatingCosts', 'monthlyEmi'],
      },
    },
    handler: async (request, reply) => {
      const body = cashflowCalculationSchema.parse(request.body);
      const result = service.calculateCashflow(body);
      return reply.send(result);
    },
  });

  /**
   * POST /api/financial/breakeven
   * Calculate break-even volume, revenue, contribution margin
   */
  fastify.post('/breakeven', {
    schema: {
      tags: ['Financial Engine'],
      summary: 'Calculate break-even units, revenue and payback period',
      body: {
        type: 'object',
        properties: {
          monthlyFixedCosts: { type: 'number' },
          variableCostPerUnit: { type: 'number' },
          sellingPricePerUnit: { type: 'number' },
          initialProjectCost: { type: 'number' },
          expectedMonthlyUnits: { type: 'number' },
        },
        required: ['monthlyFixedCosts', 'variableCostPerUnit', 'sellingPricePerUnit'],
      },
    },
    handler: async (request, reply) => {
      const body = breakevenCalculationSchema.parse(request.body);
      const result = service.calculateBreakeven(body);
      return reply.send(result);
    },
  });

  /**
   * POST /api/financial/stress-test
   * Run stress test scenarios
   */
  fastify.post('/stress-test', {
    schema: {
      tags: ['Financial Engine'],
      summary: 'Run financial stress test scenarios',
      body: {
        type: 'object',
        properties: {
          monthlyRevenue: { type: 'number' },
          monthlyOperatingCosts: { type: 'number' },
          monthlyEmi: { type: 'number' },
        },
        required: ['monthlyRevenue', 'monthlyOperatingCosts', 'monthlyEmi'],
      },
    },
    handler: async (request, reply) => {
      const body = stressTestSchema.parse(request.body);
      const result = service.runStressTest(body);
      return reply.send(result);
    },
  });

  /**
   * POST /api/financial/calculate
   * Generate full financial model
   */
  fastify.post('/calculate', {
    schema: {
      tags: ['Financial Engine'],
      summary: 'Generate comprehensive end-to-end financial plan',
    },
    handler: async (request, reply) => {
      const body = fullFinancialPlanSchema.parse(request.body);
      const result = service.generateFullFinancialPlan(body);
      return reply.send(result);
    },
  });
};
