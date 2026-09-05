import { describe, it, expect } from 'vitest';
import {
  calculateEmi,
  calculateProjectCost,
  calculateCashflow,
  calculateBreakEven,
  calculateWorkingCapital,
  runStressTest,
} from './index.js';

describe('Financial Engine', () => {
  describe('calculateEmi', () => {
    it('calculates standard monthly EMI correctly', () => {
      // Principal = 100,000, 12% p.a., 12 months (1 year)
      // EMI = 100,000 * 0.01 * (1.01)^12 / ((1.01)^12 - 1) ~= 8884.88
      const result = calculateEmi({
        principal: 100000,
        annualRate: 12,
        tenureMonths: 12,
      });

      expect(result.emi).toBeCloseTo(8884.88, 1);
      expect(result.totalPayment).toBeGreaterThan(100000);
      expect(result.totalInterest).toBeCloseTo(result.totalPayment - 100000, 1);
      expect(result.schedule).toHaveLength(12);
      expect(result.schedule[11]?.remainingPrincipal).toBeCloseTo(0, 0);
    });

    it('handles moratorium period with INTEREST_ONLY payment', () => {
      const result = calculateEmi({
        principal: 100000,
        annualRate: 12,
        tenureMonths: 12,
        moratoriumMonths: 3,
        moratoriumType: 'INTEREST_ONLY',
      });

      expect(result.schedule).toHaveLength(12);
      // First 3 months should be moratorium
      expect(result.schedule[0]?.isMoratorium).toBe(true);
      expect(result.schedule[0]?.principalPaid).toBe(0);
      expect(result.schedule[0]?.interestPaid).toBe(1000); // 1% of 100,000
      // 4th month onwards is active repayment
      expect(result.schedule[3]?.isMoratorium).toBe(false);
      expect(result.schedule[11]?.remainingPrincipal).toBeCloseTo(0, 0);
    });

    it('throws error for invalid parameters', () => {
      expect(() =>
        calculateEmi({ principal: 0, annualRate: 10, tenureMonths: 12 }),
      ).toThrow('Principal must be greater than zero');

      expect(() =>
        calculateEmi({ principal: 100000, annualRate: 10, tenureMonths: 0 }),
      ).toThrow('Tenure must be at least 1 month');

      expect(() =>
        calculateEmi({
          principal: 100000,
          annualRate: 10,
          tenureMonths: 12,
          moratoriumMonths: 12,
        }),
      ).toThrow('Moratorium period cannot exceed or equal total tenure');
    });
  });

  describe('calculateProjectCost', () => {
    it('calculates project cost from available margin and margin percentage', () => {
      // 100,000 margin at 10% margin -> 1,000,000 project cost, 900,000 loan
      const result = calculateProjectCost({
        availableMargin: 100000,
        marginPercentage: 10,
      });

      expect(result.projectCost).toBe(1000000);
      expect(result.loanAmount).toBe(900000);
      expect(result.ownContribution).toBe(100000);
      expect(result.marginPercentage).toBe(10);
    });

    it('respects maximum project cost cap when specified', () => {
      const result = calculateProjectCost({
        availableMargin: 200000,
        marginPercentage: 10,
        maxProjectCostCap: 1500000,
      });

      expect(result.projectCost).toBe(1500000);
      expect(result.loanAmount).toBe(1300000);
      expect(result.ownContribution).toBe(200000);
    });
  });

  describe('calculateCashflow', () => {
    it('projects monthly cash flows with surplus/deficit and debt service coverage', () => {
      const result = calculateCashflow({
        monthlyRevenue: 50000,
        monthlyOperatingCosts: 30000,
        monthlyEmi: 5000,
        annualGrowthRate: 5,
        projectionMonths: 12,
      });

      expect(result.monthlyCashflow).toHaveLength(12);
      expect(result.annualRevenue).toBeGreaterThan(500000);
      expect(result.annualNetProfit).toBeGreaterThan(0);
      expect(result.isCashflowPositive).toBe(true);
      expect(result.quarterlySummary).toHaveLength(4);
    });
  });

  describe('calculateBreakEven', () => {
    it('computes breakeven volume, revenue, and months', () => {
      // Fixed costs = 20,000 / mo
      // Selling price = 100 / unit, variable cost = 60 / unit
      // Contribution margin = 40 / unit (40%)
      // Breakeven units = 20,000 / 40 = 500 units/mo
      // Breakeven revenue = 500 * 100 = 50,000 / mo
      const result = calculateBreakEven({
        monthlyFixedCosts: 20000,
        sellingPricePerUnit: 100,
        variableCostPerUnit: 60,
        expectedMonthlyUnits: 600,
        initialProjectCost: 100000,
      });

      expect(result.breakEvenUnits).toBe(500);
      expect(result.breakEvenRevenue).toBe(50000);
      expect(result.contributionMarginPerUnit).toBe(40);
      expect(result.contributionMarginRatio).toBe(40);
      expect(result.isViable).toBe(true);
    });
  });

  describe('calculateWorkingCapital', () => {
    it('estimates working capital requirement for operating cycle', () => {
      const result = calculateWorkingCapital({
        monthlyOperatingExpenses: 45000,
        inventoryDays: 15,
        receivableDays: 15,
        payableDays: 10,
        bufferPercentage: 10,
      });

      expect(result.operatingCycleDays).toBe(20);
      expect(result.dailyExpense).toBe(1500);
      expect(result.baseWorkingCapital).toBe(30000);
      expect(result.bufferAmount).toBe(3000);
      expect(result.totalWorkingCapital).toBe(33000);
    });
  });

  describe('runStressTest', () => {
    it('simulates stress scenarios and identifies viability flags', () => {
      const result = runStressTest({
        monthlyRevenue: 60000,
        monthlyOperatingCosts: 35000,
        monthlyEmi: 8000,
        scenarios: [
          {
            name: 'Severe Raw Material Inflation',
            description: 'Raw material price increases by 25%',
            rawMaterialCostChangePct: 25,
          },
          {
            name: 'Demand Drop',
            description: 'Revenue drops by 30%',
            demandChangePct: -30,
          },
        ],
      });

      expect(result.baseMonthlyNetCashflow).toBe(17000);
      expect(result.scenarioResults).toHaveLength(2);
      expect(result.overallRiskLevel).toBeDefined();
    });
  });
});
