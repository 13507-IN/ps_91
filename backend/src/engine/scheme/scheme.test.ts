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
});
