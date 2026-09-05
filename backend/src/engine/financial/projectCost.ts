import { Decimal } from 'decimal.js';

export interface ProjectCostInput {
  /** Available margin money / own contribution (in ₹) */
  availableMargin: number;
  /** Margin percentage required (e.g., 10 for 10%, default 10) */
  marginPercentage?: number;
  /** Maximum project cost cap (optional, e.g. from scheme limits) */
  maxProjectCostCap?: number;
}

export interface ProjectCostOutput {
  /** Total project cost (in ₹) */
  projectCost: number;
  /** Required loan amount (in ₹) */
  loanAmount: number;
  /** Own contribution / margin money used (in ₹) */
  ownContribution: number;
  /** Margin percentage actually applied */
  marginPercentage: number;
}

/**
 * Calculates project cost and loan amount from available margin money.
 * Formula: Project Cost = Available Margin / (Margin % / 100)
 * Loan Amount = Project Cost - Available Margin
 */
export function calculateProjectCost(input: ProjectCostInput): ProjectCostOutput {
  const margin = new Decimal(input.availableMargin);
  if (margin.lessThanOrEqualTo(0)) {
    throw new Error('Available margin must be greater than zero');
  }

  const marginPctVal = input.marginPercentage ?? 10;
  const marginPct = new Decimal(marginPctVal);

  if (marginPct.lessThanOrEqualTo(0) || marginPct.greaterThan(100)) {
    throw new Error('Margin percentage must be between 0 and 100');
  }

  // projectCost = margin / (marginPct / 100)
  let projectCostDecimal = margin.dividedBy(marginPct.dividedBy(100));

  if (input.maxProjectCostCap && projectCostDecimal.greaterThan(input.maxProjectCostCap)) {
    projectCostDecimal = new Decimal(input.maxProjectCostCap);
  }

  const loanAmountDecimal = projectCostDecimal.minus(margin);

  return {
    projectCost: projectCostDecimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    loanAmount: Decimal.max(0, loanAmountDecimal).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    ownContribution: margin.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    marginPercentage: marginPctVal,
  };
}
