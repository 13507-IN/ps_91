import { Decimal } from 'decimal.js';
import { calculateCashflow } from './cashflow.js';

export interface StressScenario {
  name: string;
  description: string;
  rawMaterialCostChangePct?: number; // e.g. +15 for +15%
  demandChangePct?: number;           // e.g. -20 for -20%
  sellingPriceChangePct?: number;     // e.g. -10 for -10%
  interestRateChangePct?: number;     // e.g. +2 for +2% rate increase
}

export interface StressTestInput {
  monthlyRevenue: number;
  monthlyOperatingCosts: number;
  monthlyEmi: number;
  annualRate?: number;
  loanPrincipal?: number;
  tenureMonths?: number;
  scenarios?: StressScenario[];
}

export interface StressScenarioResult {
  scenarioName: string;
  description: string;
  stressedRevenue: number;
  stressedCosts: number;
  stressedEmi: number;
  stressedMonthlyNetCashflow: number;
  netCashflowChangePct: number;
  isViable: boolean;
}

export interface StressTestOutput {
  baseMonthlyNetCashflow: number;
  scenarioResults: StressScenarioResult[];
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const DEFAULT_STRESS_SCENARIOS: StressScenario[] = [
  {
    name: 'Raw Material Inflation',
    description: 'Raw material and supply costs increase by 15%',
    rawMaterialCostChangePct: 15,
  },
  {
    name: 'Demand Slump',
    description: 'Customer demand drops by 20%',
    demandChangePct: -20,
  },
  {
    name: 'Price Competition',
    description: 'Selling prices drop by 10% due to local competition',
    sellingPriceChangePct: -10,
  },
  {
    name: 'Combined Downside',
    description: 'Simultaneous 10% cost increase and 15% demand drop',
    rawMaterialCostChangePct: 10,
    demandChangePct: -15,
  },
];

/**
 * Runs stress scenarios against a business model to evaluate resilience under adverse conditions.
 */
export function runStressTest(input: StressTestInput): StressTestOutput {
  const baseRevenue = new Decimal(input.monthlyRevenue);
  const baseCosts = new Decimal(input.monthlyOperatingCosts);
  const baseEmi = new Decimal(input.monthlyEmi);

  const baseNet = baseRevenue.minus(baseCosts).minus(baseEmi);
  const baseNetNum = baseNet.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

  const scenarios = input.scenarios ?? DEFAULT_STRESS_SCENARIOS;
  const scenarioResults: StressScenarioResult[] = [];
  let unviableCount = 0;

  for (const sc of scenarios) {
    const revMult = new Decimal(1).plus(
      new Decimal(sc.demandChangePct ?? 0).plus(sc.sellingPriceChangePct ?? 0).dividedBy(100),
    );
    const costMult = new Decimal(1).plus(new Decimal(sc.rawMaterialCostChangePct ?? 0).dividedBy(100));

    const stressedRev = Decimal.max(0, baseRevenue.times(revMult));
    const stressedCost = Decimal.max(0, baseCosts.times(costMult));
    const stressedEmi = baseEmi; // Assumed fixed unless rate change logic applied

    const stressedNet = stressedRev.minus(stressedCost).minus(stressedEmi);
    const stressedNetNum = stressedNet.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

    let netChangePct = 0;
    if (!baseNet.equals(0)) {
      netChangePct = stressedNet.minus(baseNet).dividedBy(baseNet.abs()).times(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
    }

    const isViable = stressedNetNum > 0;
    if (!isViable) unviableCount++;

    scenarioResults.push({
      scenarioName: sc.name,
      description: sc.description,
      stressedRevenue: stressedRev.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      stressedCosts: stressedCost.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      stressedEmi: stressedEmi.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      stressedMonthlyNetCashflow: stressedNetNum,
      netCashflowChangePct: netChangePct,
      isViable,
    });
  }

  let overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (unviableCount === 0) {
    overallRiskLevel = 'LOW';
  } else if (unviableCount === 1) {
    overallRiskLevel = 'MEDIUM';
  } else if (unviableCount === 2 || unviableCount === 3) {
    overallRiskLevel = 'HIGH';
  } else {
    overallRiskLevel = 'CRITICAL';
  }

  return {
    baseMonthlyNetCashflow: baseNetNum,
    scenarioResults,
    overallRiskLevel,
  };
}
