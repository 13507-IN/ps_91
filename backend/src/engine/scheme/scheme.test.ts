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
});
