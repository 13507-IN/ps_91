import { Decimal } from 'decimal.js';

export interface CashflowInput {
  /** Expected monthly revenue (in ₹) */
  monthlyRevenue: number;
  /** Expected monthly operating costs (raw material, labor, utilities) (in ₹) */
  monthlyOperatingCosts: number;
  /** Monthly EMI commitment (in ₹) */
  monthlyEmi: number;
  /** Seasonality month multipliers (12 numbers representing relative demand e.g. 1.0, 1.2, 0.8) */
  seasonalityMultipliers?: number[];
  /** Annual growth rate percentage (default 5%) */
  annualGrowthRate?: number;
  /** Projection horizon in months (default 12) */
  projectionMonths?: number;
}

export interface MonthlyCashflowRow {
  month: number;
  revenue: number;
  operatingCosts: number;
  grossSurplus: number;
  emi: number;
  netCashflow: number;
  cumulativeCashflow: number;
}

export interface QuarterlyCashflowSummary {
  quarter: string;
  totalRevenue: number;
  totalOperatingCosts: number;
  totalEmi: number;
  netCashflow: number;
}

export interface CashflowOutput {
  monthlyCashflow: MonthlyCashflowRow[];
  quarterlySummary: QuarterlyCashflowSummary[];
  annualRevenue: number;
  annualNetProfit: number;
  avgMonthlyNetCashflow: number;
  isCashflowPositive: boolean;
}

/**
 * Projects monthly and quarterly cash flows for small rural enterprises.
 * Takes seasonality and annual growth rates into account.
 */
export function calculateCashflow(input: CashflowInput): CashflowOutput {
  const baseRevenue = new Decimal(input.monthlyRevenue);
  const baseCosts = new Decimal(input.monthlyOperatingCosts);
  const emi = new Decimal(input.monthlyEmi);
  const growthRate = new Decimal(input.annualGrowthRate ?? 5).dividedBy(100);
  const horizon = input.projectionMonths ?? 12;

  const defaultMultipliers = Array(12).fill(1.0) as number[];
  const multipliers = input.seasonalityMultipliers && input.seasonalityMultipliers.length === 12
    ? input.seasonalityMultipliers
    : defaultMultipliers;

  const monthlyCashflow: MonthlyCashflowRow[] = [];
  const quarterlySummary: QuarterlyCashflowSummary[] = [];

  let cumulativeDecimal = new Decimal(0);
  let totalAnnualRevenueDecimal = new Decimal(0);
  let totalAnnualNetProfitDecimal = new Decimal(0);

  let currentQuarterRevenue = new Decimal(0);
  let currentQuarterCosts = new Decimal(0);
  let currentQuarterEmi = new Decimal(0);
  let currentQuarterNet = new Decimal(0);

  for (let month = 1; month <= horizon; month++) {
    // Apply annual compounding after year 1 (month > 12)
    const yearIndex = Math.floor((month - 1) / 12);
    const growthMultiplier = new Decimal(1).plus(growthRate).pow(yearIndex);

    const monthIndex = (month - 1) % 12;
    const seasonMult = new Decimal(multipliers[monthIndex] ?? 1.0);

    const revenue = baseRevenue.times(seasonMult).times(growthMultiplier);
    const operatingCosts = baseCosts.times(growthMultiplier);
    const grossSurplus = revenue.minus(operatingCosts);
    const netCashflow = grossSurplus.minus(emi);

    cumulativeDecimal = cumulativeDecimal.plus(netCashflow);

    if (month <= 12) {
      totalAnnualRevenueDecimal = totalAnnualRevenueDecimal.plus(revenue);
      totalAnnualNetProfitDecimal = totalAnnualNetProfitDecimal.plus(netCashflow);
    }

    monthlyCashflow.push({
      month,
      revenue: revenue.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      operatingCosts: operatingCosts.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      grossSurplus: grossSurplus.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      emi: emi.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      netCashflow: netCashflow.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      cumulativeCashflow: cumulativeDecimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    });

    // Aggregate quarterly
    currentQuarterRevenue = currentQuarterRevenue.plus(revenue);
    currentQuarterCosts = currentQuarterCosts.plus(operatingCosts);
    currentQuarterEmi = currentQuarterEmi.plus(emi);
    currentQuarterNet = currentQuarterNet.plus(netCashflow);

    if (month % 3 === 0 || month === horizon) {
      const qNum = Math.ceil(month / 3);
      const yearNum = Math.floor((month - 1) / 12) + 1;
      quarterlySummary.push({
        quarter: `Y${yearNum} Q${((qNum - 1) % 4) + 1}`,
        totalRevenue: currentQuarterRevenue.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        totalOperatingCosts: currentQuarterCosts.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        totalEmi: currentQuarterEmi.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        netCashflow: currentQuarterNet.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      });

      currentQuarterRevenue = new Decimal(0);
      currentQuarterCosts = new Decimal(0);
      currentQuarterEmi = new Decimal(0);
      currentQuarterNet = new Decimal(0);
    }
  }

  const avgMonthlyNetDecimal = totalAnnualNetProfitDecimal.dividedBy(Math.min(12, horizon));

  return {
    monthlyCashflow,
    quarterlySummary,
    annualRevenue: totalAnnualRevenueDecimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    annualNetProfit: totalAnnualNetProfitDecimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    avgMonthlyNetCashflow: avgMonthlyNetDecimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    isCashflowPositive: avgMonthlyNetDecimal.greaterThan(0),
  };
}
