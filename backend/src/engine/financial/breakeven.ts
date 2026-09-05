import { Decimal } from 'decimal.js';

export interface BreakEvenInput {
  /** Fixed monthly costs (rent, salaries, utility base rate, EMI) (in ₹) */
  monthlyFixedCosts: number;
  /** Variable cost per unit produced/sold (in ₹) */
  variableCostPerUnit: number;
  /** Selling price per unit (in ₹) */
  sellingPricePerUnit: number;
  /** Initial project cost / capital expenditure (optional, for payback period calculation) */
  initialProjectCost?: number;
  /** Expected monthly sales volume in units (optional) */
  expectedMonthlyUnits?: number;
}

export interface BreakEvenOutput {
  /** Minimum units required to break even per month */
  breakEvenUnits: number;
  /** Revenue required to break even per month (in ₹) */
  breakEvenRevenue: number;
  /** Contribution margin per unit (Selling Price - Variable Cost) (in ₹) */
  contributionMarginPerUnit: number;
  /** Contribution margin ratio (%) */
  contributionMarginRatio: number;
  /** Margin of safety in units (Expected Units - Break Even Units) */
  marginOfSafetyUnits?: number;
  /** Margin of safety in percentage (%) */
  marginOfSafetyPercentage?: number;
  /** Payback period in months (Initial Investment / Monthly Surplus) */
  paybackPeriodMonths?: number;
  /** Is expected volume above break-even? */
  isViable: boolean;
}

/**
 * Calculates break-even sales volume, revenue, contribution margin, and payback period.
 */
export function calculateBreakEven(input: BreakEvenInput): BreakEvenOutput {
  const fixedCosts = new Decimal(input.monthlyFixedCosts);
  const variableCost = new Decimal(input.variableCostPerUnit);
  const sellingPrice = new Decimal(input.sellingPricePerUnit);

  if (sellingPrice.lessThanOrEqualTo(0)) {
    throw new Error('Selling price per unit must be greater than zero');
  }
  if (variableCost.greaterThanOrEqualTo(sellingPrice)) {
    throw new Error('Variable cost per unit must be strictly less than selling price');
  }

  // Contribution Margin = Selling Price - Variable Cost
  const contributionMargin = sellingPrice.minus(variableCost);
  const contributionRatio = contributionMargin.dividedBy(sellingPrice).times(100);

  // Break Even Units = Monthly Fixed Costs / Contribution Margin
  const breakEvenUnitsDecimal = fixedCosts.dividedBy(contributionMargin).ceil();
  const breakEvenRevenueDecimal = breakEvenUnitsDecimal.times(sellingPrice);

  let marginOfSafetyUnits: number | undefined;
  let marginOfSafetyPercentage: number | undefined;
  let isViable = false;

  if (input.expectedMonthlyUnits !== undefined) {
    const expectedUnits = new Decimal(input.expectedMonthlyUnits);
    const mosUnits = expectedUnits.minus(breakEvenUnitsDecimal);
    marginOfSafetyUnits = mosUnits.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();

    if (expectedUnits.greaterThan(0)) {
      const mosPct = mosUnits.dividedBy(expectedUnits).times(100);
      marginOfSafetyPercentage = mosPct.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
    }
    isViable = expectedUnits.greaterThanOrEqualTo(breakEvenUnitsDecimal);
  } else {
    isViable = true; // Without expected units, assume break-even baseline
  }

  let paybackPeriodMonths: number | undefined;
  if (input.initialProjectCost && input.expectedMonthlyUnits) {
    const expectedUnits = new Decimal(input.expectedMonthlyUnits);
    const monthlyNetSurplus = expectedUnits.times(contributionMargin).minus(fixedCosts);
    if (monthlyNetSurplus.greaterThan(0)) {
      const paybackDecimal = new Decimal(input.initialProjectCost).dividedBy(monthlyNetSurplus);
      paybackPeriodMonths = paybackDecimal.toDecimalPlaces(1, Decimal.ROUND_HALF_UP).toNumber();
    }
  }

  return {
    breakEvenUnits: breakEvenUnitsDecimal.toNumber(),
    breakEvenRevenue: breakEvenRevenueDecimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    contributionMarginPerUnit: contributionMargin.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    contributionMarginRatio: contributionRatio.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    marginOfSafetyUnits,
    marginOfSafetyPercentage,
    paybackPeriodMonths,
    isViable,
  };
}
