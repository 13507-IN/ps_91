import { Decimal } from 'decimal.js';
import { RuleEngine } from './ruleEngine.js';
import { calculateEmi } from '../financial/emi.js';
import type { UserSchemeFacts, MatchedSchemeResult, SchemeConfig } from './types.js';

export class SchemeEvaluator {
  private ruleEngine: RuleEngine;

  constructor(ruleEngine?: RuleEngine) {
    this.ruleEngine = ruleEngine ?? new RuleEngine();
  }

  /**
   * Evaluate user facts against registered schemes and generate full financial breakdowns.
   */
  public evaluateSchemes(facts: UserSchemeFacts): MatchedSchemeResult[] {
    const matchedConfigs = this.ruleEngine.evaluate(facts);
    const results: MatchedSchemeResult[] = [];

    const projectCostDecimal = new Decimal(facts.projectCost);
    const userMarginDecimal = new Decimal(facts.availableMargin ?? 0);

    for (const scheme of matchedConfigs) {
      const fin = scheme.financial;

      // Calculate required margin money
      const marginPctDecimal = new Decimal(fin.marginPercentage).dividedBy(100);
      const requiredMarginDecimal = projectCostDecimal.times(marginPctDecimal);

      // Base loan required
      let eligibleLoanDecimal = projectCostDecimal.minus(requiredMarginDecimal);
      const maxLoanDecimal = new Decimal(fin.maxLoanAmount);

      if (eligibleLoanDecimal.greaterThan(maxLoanDecimal)) {
        eligibleLoanDecimal = maxLoanDecimal;
      }

      // Calculate subsidy amount
      let subsidyDecimal = new Decimal(0);
      if (fin.subsidyPercentage > 0) {
        subsidyDecimal = eligibleLoanDecimal.times(new Decimal(fin.subsidyPercentage).dividedBy(100));
        if (fin.maxSubsidy > 0 && subsidyDecimal.greaterThan(fin.maxSubsidy)) {
          subsidyDecimal = new Decimal(fin.maxSubsidy);
        }
      }

      // Net loan borrower needs to repay
      const netLoanDecimal = Decimal.max(0, eligibleLoanDecimal.minus(subsidyDecimal));

      // Calculate EMI and interest using Decimal-backed EMI calculator
      let estimatedEmi = 0;
      let totalInterest = 0;

      if (netLoanDecimal.greaterThan(0)) {
        const emiResult = calculateEmi({
          principal: netLoanDecimal.toNumber(),
          annualRate: fin.interestRate,
          tenureMonths: fin.tenureMonths,
          moratoriumMonths: fin.moratoriumMonths,
          moratoriumType: fin.moratoriumType,
        });

        estimatedEmi = emiResult.emi;
        totalInterest = emiResult.totalInterest;
      }

      const notes: string[] = [];
      if (userMarginDecimal.lessThan(requiredMarginDecimal)) {
        const deficit = requiredMarginDecimal.minus(userMarginDecimal).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
        notes.push(`Additional margin of ₹${deficit} recommended to meet mandatory ${fin.marginPercentage}% margin.`);
      }
      if (fin.subsidyPercentage > 0) {
        notes.push(`Eligible for ${fin.subsidyPercentage}% capital subsidy (up to ₹${fin.maxSubsidy}).`);
      }

      results.push({
        schemeId: scheme.schemeId,
        name: scheme.name,
        shortName: scheme.shortName,
        description: scheme.description,
        nodalAgency: scheme.nodalAgency,
        priority: scheme.priority,

        projectCost: projectCostDecimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        userMargin: userMarginDecimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        requiredMargin: requiredMarginDecimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        eligibleLoanAmount: eligibleLoanDecimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        subsidyAmount: subsidyDecimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        netLoanAmount: netLoanDecimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        interestRate: fin.interestRate,
        tenureMonths: fin.tenureMonths,
        moratoriumMonths: fin.moratoriumMonths,
        estimatedEmi,
        totalInterest,
        requiredDocuments: scheme.requiredDocuments,
        eligibilityNotes: notes,
      });
    }

    return results;
  }
}
