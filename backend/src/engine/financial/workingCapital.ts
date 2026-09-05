import { Decimal } from 'decimal.js';

export interface WorkingCapitalInput {
  /** Monthly raw material & operating expenses (in ₹) */
  monthlyOperatingExpenses: number;
  /** Inventory holding period in days (default 15) */
  inventoryDays?: number;
  /** Receivable collection period in days (default 15) */
  receivableDays?: number;
  /** Payable deferral period in days (default 10) */
  payableDays?: number;
  /** Contingency buffer percentage (default 10%) */
  bufferPercentage?: number;
}

export interface WorkingCapitalOutput {
  /** Operating cycle in days (Inventory Days + Receivable Days - Payable Days) */
  operatingCycleDays: number;
  /** Daily operating expense (in ₹) */
  dailyExpense: number;
  /** Working capital required for operating cycle (in ₹) */
  baseWorkingCapital: number;
  /** Contingency buffer amount (in ₹) */
  bufferAmount: number;
  /** Total recommended working capital (in ₹) */
  totalWorkingCapital: number;
}

/**
 * Calculates working capital requirements based on operating cycle days.
 * Formula: Operating Cycle = Inventory Days + Receivable Days - Payable Days
 * Working Capital = Daily Operating Expense × Operating Cycle Days + Buffer
 */
export function calculateWorkingCapital(input: WorkingCapitalInput): WorkingCapitalOutput {
  const monthlyExpenses = new Decimal(input.monthlyOperatingExpenses);
  if (monthlyExpenses.lessThan(0)) {
    throw new Error('Monthly operating expenses cannot be negative');
  }

  const inventoryDays = input.inventoryDays ?? 15;
  const receivableDays = input.receivableDays ?? 15;
  const payableDays = input.payableDays ?? 10;
  const bufferPct = new Decimal(input.bufferPercentage ?? 10).dividedBy(100);

  const operatingCycleDays = Math.max(1, inventoryDays + receivableDays - payableDays);
  const dailyExpense = monthlyExpenses.dividedBy(30);

  const baseWorkingCapital = dailyExpense.times(operatingCycleDays);
  const bufferAmount = baseWorkingCapital.times(bufferPct);
  const totalWorkingCapital = baseWorkingCapital.plus(bufferAmount);

  return {
    operatingCycleDays,
    dailyExpense: dailyExpense.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    baseWorkingCapital: baseWorkingCapital.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    bufferAmount: bufferAmount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    totalWorkingCapital: totalWorkingCapital.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
  };
}
