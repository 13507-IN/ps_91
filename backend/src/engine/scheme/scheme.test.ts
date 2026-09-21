import { describe, it, expect } from 'vitest';
import { RuleEngine } from './ruleEngine.js';
import { SchemeEvaluator } from './schemeEvaluator.js';

describe('Scheme Engine', () => {
  it('loads built-in scheme configurations', () => {
    const engine = new RuleEngine();
    const schemes = engine.getAllSchemes();

    expect(schemes.length).toBeGreaterThan(0);
    const ids = schemes.map((s) => s.schemeId);
    expect(ids).toContain('mudra_kishore');
  });

  it('matches eligible schemes for a rural entrepreneur', () => {
    const engine = new RuleEngine();
    const evaluator = new SchemeEvaluator(engine);

    const matches = evaluator.evaluateSchemes({
      age: 28,
      gender: 'FEMALE',
      category: 'SC',
      businessCategory: 'DAIRY',
      projectCost: 300000,
      availableMargin: 50000,
      state: 'West Bengal',
      district: 'Nadia',
    });

    expect(matches.length).toBeGreaterThan(0);
    const firstMatch = matches[0];
    expect(firstMatch).toBeDefined();
    expect(firstMatch?.name).toBeDefined();
    expect(firstMatch?.eligibleLoanAmount).toBeGreaterThan(0);
    expect(firstMatch?.estimatedEmi).toBeGreaterThan(0);
  });

  it('filters out schemes when project cost exceeds ceiling', () => {
    const engine = new RuleEngine();
    const evaluator = new SchemeEvaluator(engine);

    // MUDRA Kishore max is 500,000, PMEGP is 5,000,000
    // Test with project cost = 150,000,000 (15 Crore - way above limits)
    const matches = evaluator.evaluateSchemes({
      age: 30,
      gender: 'MALE',
      category: 'GENERAL',
      businessCategory: 'RETAIL',
      projectCost: 150000000,
      availableMargin: 15000000,
    });

    // Should not match MUDRA or PMEGP since project cost exceeds maxProjectCost
    const mudraMatches = matches.filter((m) => m.schemeId.includes('mudra'));
    expect(mudraMatches).toHaveLength(0);
  });

  it('loads MoSJE and Women Entrepreneurship scheme configurations', () => {
    const engine = new RuleEngine();
    const schemes = engine.getAllSchemes();

    const ids = schemes.map((s) => s.schemeId);
    expect(ids).toContain('mosje_swarnima_obc');
    expect(ids).toContain('mosje_nsfdc_micro');
    expect(ids).toContain('mosje_nskfdc_mahila');
    expect(ids).toContain('mosje_pm_daksh');
    expect(ids).toContain('women_mahila_udyam_nidhi');
    expect(ids).toContain('women_tread');
    expect(ids).toContain('women_stree_shakti');
  });

  it('matches women entrepreneurship schemes for female OBC rural profile', () => {
    const engine = new RuleEngine();
    const evaluator = new SchemeEvaluator(engine);

    const matches = evaluator.evaluateSchemes({
      age: 26,
      gender: 'FEMALE',
      category: 'OBC',
      businessCategory: 'TEXTILES_TAILORING',
      projectCost: 200000,
      availableMargin: 20000,
      state: 'West Bengal',
    });

    const matchIds = matches.map((m) => m.schemeId);
    expect(matchIds).toContain('mosje_swarnima_obc');
    expect(matchIds).toContain('women_mahila_udyam_nidhi');
    expect(matchIds).toContain('women_tread');
    expect(matchIds).toContain('women_stree_shakti');
  });

  it('matches NSFDC and PM-DAKSH schemes for rural SC entrepreneur', () => {
    const engine = new RuleEngine();
    const evaluator = new SchemeEvaluator(engine);

    const matches = evaluator.evaluateSchemes({
      age: 32,
      gender: 'MALE',
      category: 'SC',
      businessCategory: 'FOOD_PROCESSING',
      projectCost: 400000,
      availableMargin: 40000,
    });

    const matchIds = matches.map((m) => m.schemeId);
    expect(matchIds).toContain('mosje_nsfdc_micro');
    expect(matchIds).toContain('mosje_pm_daksh');
  });

  it('loads SCA Micro Finance and SCA Term Loan scheme configurations', () => {
    const engine = new RuleEngine();
    const schemes = engine.getAllSchemes();

    const ids = schemes.map((s) => s.schemeId);
    expect(ids).toContain('sca_micro_finance');
    expect(ids).toContain('sca_term_loan');
  });

  it('matches SCA Micro Finance (Logic A) for project cost <= 1.40L', () => {
    const engine = new RuleEngine();
    const evaluator = new SchemeEvaluator(engine);

    // Project cost = 1,40,000 (Margin = 14,000)
    const matches = evaluator.evaluateSchemes({
      age: 29,
      gender: 'MALE',
      category: 'OBC',
      businessCategory: 'HANDICRAFT',
      projectCost: 140000,
      availableMargin: 14000,
    });

    const scaMicro = matches.find((m) => m.schemeId === 'sca_micro_finance');
    expect(scaMicro).toBeDefined();
    expect(scaMicro?.interestRate).toBe(6.5);
    expect(scaMicro?.tenureMonths).toBe(36);
    expect(scaMicro?.moratoriumMonths).toBe(3);
    expect(scaMicro?.eligibleLoanAmount).toBeLessThanOrEqual(125000);
  });

  it('matches SCA Term Loan (Logic B) for project cost between 1.40L and 50.00L', () => {
    const engine = new RuleEngine();
    const evaluator = new SchemeEvaluator(engine);

    // PS-91 Example: Project cost = 10,00,000 (Margin = 1,00,000)
    const matches = evaluator.evaluateSchemes({
      age: 35,
      gender: 'FEMALE',
      category: 'SC',
      businessCategory: 'FOOD_PROCESSING',
      projectCost: 1000000,
      availableMargin: 100000,
    });

    const scaTerm = matches.find((m) => m.schemeId === 'sca_term_loan');
    expect(scaTerm).toBeDefined();
    expect(scaTerm?.interestRate).toBe(8.0);
    expect(scaTerm?.tenureMonths).toBe(84);
    expect(scaTerm?.moratoriumMonths).toBe(6);
    expect(scaTerm?.eligibleLoanAmount).toBe(900000); // 90% of 10 Lakh
  });
});
