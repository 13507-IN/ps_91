import {
  calculateProjectCost,
  calculateEmi,
  calculateCashflow,
  calculateBreakEven,
  calculateWorkingCapital,
  runStressTest,
} from '../../engine/financial/index.js';
import type {
  EmiCalculationInput,
  ProjectCostCalculationInput,
  CashflowCalculationInput,
  BreakevenCalculationInput,
  StressTestInputSchema,
  FullFinancialPlanInput,
} from './financial.schema.js';

export class FinancialService {
  /**
   * Calculate EMI and amortization schedule
   */
  calculateEmi(input: EmiCalculationInput) {
    return calculateEmi(input);
  }

  /**
   * Calculate project cost and loan from available margin
   */
  calculateProjectCost(input: ProjectCostCalculationInput) {
    return calculateProjectCost(input);
  }

  /**
   * Calculate monthly/quarterly cashflow projections
   */
  calculateCashflow(input: CashflowCalculationInput) {
    return calculateCashflow(input);
  }

  /**
   * Calculate break-even units, revenue, contribution margin
   */
  calculateBreakeven(input: BreakevenCalculationInput) {
    return calculateBreakEven(input);
  }

  /**
   * Run stress test scenarios
   */
  runStressTest(input: StressTestInputSchema) {
    return runStressTest(input);
  }

  /**
   * Generate comprehensive financial plan combining all financial sub-engines
   */
  generateFullFinancialPlan(input: FullFinancialPlanInput) {
    // 1. Calculate project cost & loan amount
    const costOutput = calculateProjectCost({
      availableMargin: input.availableMargin,
      marginPercentage: input.marginPercentage,
    });

    // 2. Calculate EMI & repayment schedule
    const emiOutput = calculateEmi({
      principal: costOutput.loanAmount,
      annualRate: input.annualRate,
      tenureMonths: input.tenureMonths,
    });

    // 3. Calculate cash flow projection
    const cashflowOutput = calculateCashflow({
      monthlyRevenue: input.monthlyRevenue,
      monthlyOperatingCosts: input.monthlyOperatingCosts,
      monthlyEmi: emiOutput.emi,
      seasonalityMultipliers: input.seasonalityMultipliers,
    });

    // 4. Calculate break-even & payback period
    const breakevenOutput = calculateBreakEven({
      monthlyFixedCosts: input.monthlyOperatingCosts + emiOutput.emi,
      variableCostPerUnit: input.variableCostPerUnit,
      sellingPricePerUnit: input.sellingPricePerUnit,
      initialProjectCost: costOutput.projectCost,
      expectedMonthlyUnits: input.expectedMonthlyUnits,
    });

    // 5. Working capital requirement
    const workingCapitalOutput = calculateWorkingCapital({
      monthlyOperatingExpenses: input.monthlyOperatingCosts,
    });

    // 6. Stress testing
    const stressOutput = runStressTest({
      monthlyRevenue: input.monthlyRevenue,
      monthlyOperatingCosts: input.monthlyOperatingCosts,
      monthlyEmi: emiOutput.emi,
    });

    return {
      projectCost: costOutput,
      emi: emiOutput,
      cashflow: cashflowOutput,
      breakeven: breakevenOutput,
      workingCapital: workingCapitalOutput,
      stressTest: stressOutput,
      overallViabilityScore: breakevenOutput.isViable && cashflowOutput.isCashflowPositive ? 'FEASIBLE' : 'HIGH_RISK',
    };
  }
}
