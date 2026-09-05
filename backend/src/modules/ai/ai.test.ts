import { describe, it, expect } from 'vitest';
import { AiClient } from './ai.client.js';
import { BusinessCategory } from '@prisma/client';

describe('AiClient', () => {
  const client = new AiClient();

  it('classifies free text into business category using keyword fallback', async () => {
    const dairyResult = await client.classifyBusiness({
      idea: 'I want to start a shop selling cow milk and paneer to villagers',
    });
    expect(dairyResult.category).toBe(BusinessCategory.DAIRY);
    expect(dairyResult.confidence).toBeGreaterThanOrEqual(0.8);

    const tailorResult = await client.classifyBusiness({
      idea: 'Opening a boutique stitching ladies blouses and dresses',
    });
    expect(tailorResult.category).toBe(BusinessCategory.TEXTILES_TAILORING);

    const millResult = await client.classifyBusiness({
      idea: 'Setting up an atta chakkai and mustard oil mill',
    });
    expect(millResult.category).toBe(BusinessCategory.FOOD_PROCESSING);
  });

  it('estimates local consumer demand for a business category', async () => {
    const demand = await client.estimateDemand({
      businessCategory: BusinessCategory.DAIRY,
      totalPopulation: 5000,
      totalHouseholds: 1000,
    });

    expect(demand.estimatedDailyDemandUnits).toBeGreaterThan(0);
    expect(demand.estimatedAnnualDemandUnits).toBeGreaterThan(demand.estimatedDailyDemandUnits);
    expect(demand.unit).toContain('Milk');
  });

  it('discovers opportunity niches and generates opportunity score', async () => {
    const opp = await client.discoverOpportunities({
      businessCategory: BusinessCategory.DAIRY,
      existingCompetitors: 3,
      estimatedDemandUnits: 1500,
    });

    expect(opp.marketGaps.length).toBeGreaterThan(0);
    expect(opp.opportunityScore).toBeGreaterThan(30);
    expect(opp.recommendedModel).toBeDefined();
  });

  it('assesses enterprise and credit risk', async () => {
    const risk = await client.assessRisk({
      businessCategory: BusinessCategory.FOOD_PROCESSING,
      projectCost: 500000,
      loanAmount: 450000,
      monthlyEmi: 9500,
    });

    expect(risk.riskFactors.length).toBeGreaterThanOrEqual(2);
    expect(risk.overallRiskScore).toBeGreaterThan(0);
    expect(risk.riskRating).toBeDefined();
  });

  it('synthesizes recommendation and viability decision', async () => {
    const rec = await client.generateRecommendation({
      businessCategory: BusinessCategory.DAIRY,
      opportunityScore: 82,
      financialViabilityScore: 85,
      riskScore: 25,
      matchedScheme: 'PMMY MUDRA Kishore',
    });

    expect(rec.viabilityScore).toBeGreaterThan(70);
    expect(['PROCEED', 'PROCEED_WITH_MODIFICATIONS']).toContain(rec.decision);
    expect(rec.strengths.length).toBeGreaterThan(0);
  });

  it('generates a 30-day action plan with funding readiness checklist', async () => {
    const plan = await client.generateActionPlan({
      businessCategory: BusinessCategory.DAIRY,
      loanAmount: 400000,
      schemeName: 'PMMY MUDRA Kishore',
    });

    expect(plan.milestones).toHaveLength(4);
    expect(plan.fundingReadinessChecklist.length).toBeGreaterThanOrEqual(5);
  });
});
