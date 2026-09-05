import { Decimal } from 'decimal.js';

export interface EmiInput {
  /** Loan principal amount (in ₹) */
  principal: number;
  /** Annual interest rate percentage (e.g. 8.5 for 8.5%) */
  annualRate: number;
  /** Total tenure in months */
  tenureMonths: number;
  /** Moratorium period in months (default 0) */
  moratoriumMonths?: number;
  /** Moratorium repayment behavior: INTEREST_ONLY (pay interest only) or NO_PAYMENT (interest added to principal) */
  moratoriumType?: 'INTEREST_ONLY' | 'NO_PAYMENT';
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  remainingPrincipal: number;
  isMoratorium: boolean;
}

export interface EmiOutput {
  /** Monthly EMI during active repayment (in ₹) */
  emi: number;
  /** Total interest paid over loan life (in ₹) */
  totalInterest: number;
  /** Total amount paid (principal + interest) (in ₹) */
  totalPayment: number;
  /** Monthly breakdown */
  schedule: AmortizationRow[];
}

/**
 * Calculate Equated Monthly Installment (EMI) and amortization schedule.
 * Standard formula: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEmi(input: EmiInput): EmiOutput {
  const principal = new Decimal(input.principal);
  const annualRate = new Decimal(input.annualRate);
  const totalTenure = input.tenureMonths;
  const moratoriumMonths = input.moratoriumMonths ?? 0;
  const moratoriumType = input.moratoriumType ?? 'INTEREST_ONLY';

  if (principal.lessThanOrEqualTo(0)) {
    throw new Error('Principal must be greater than zero');
  }
  if (annualRate.lessThan(0)) {
    throw new Error('Interest rate cannot be negative');
  }
  if (totalTenure <= 0) {
    throw new Error('Tenure must be at least 1 month');
  }
  if (moratoriumMonths >= totalTenure) {
    throw new Error('Moratorium period cannot exceed or equal total tenure');
  }

  // Monthly interest rate r = (annualRate / 100) / 12
  const r = annualRate.dividedBy(100).dividedBy(12);

  // Active repayment months N = totalTenure - moratoriumMonths
  const activeTenure = totalTenure - moratoriumMonths;

  const schedule: AmortizationRow[] = [];
  let currentPrincipal = principal;
  let accumulatedInterestTotal = new Decimal(0);
  let totalPaymentDecimal = new Decimal(0);

  // Handle 0% interest edge case
  if (r.equals(0)) {
    const emiDecimal = principal.dividedBy(activeTenure);
    const emiNum = emiDecimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

    for (let month = 1; month <= totalTenure; month++) {
      const isMoratorium = month <= moratoriumMonths;
      const payment = isMoratorium ? 0 : emiNum;
      const principalPaid = isMoratorium ? 0 : Math.min(emiNum, currentPrincipal.toNumber());
      currentPrincipal = currentPrincipal.minus(principalPaid);
      totalPaymentDecimal = totalPaymentDecimal.plus(payment);

      schedule.push({
        month,
        payment,
        principalPaid,
        interestPaid: 0,
        remainingPrincipal: Decimal.max(0, currentPrincipal).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        isMoratorium,
      });
    }

    return {
      emi: emiNum,
      totalInterest: 0,
      totalPayment: principal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      schedule,
    };
  }

  // Process Moratorium Months
  for (let month = 1; month <= moratoriumMonths; month++) {
    const monthlyInterest = currentPrincipal.times(r);
    accumulatedInterestTotal = accumulatedInterestTotal.plus(monthlyInterest);

    if (moratoriumType === 'INTEREST_ONLY') {
      const payment = monthlyInterest.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
      totalPaymentDecimal = totalPaymentDecimal.plus(payment);
      schedule.push({
        month,
        payment,
        principalPaid: 0,
        interestPaid: payment,
        remainingPrincipal: currentPrincipal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        isMoratorium: true,
      });
    } else {
      // NO_PAYMENT: interest capitalizes into principal
      currentPrincipal = currentPrincipal.plus(monthlyInterest);
      schedule.push({
        month,
        payment: 0,
        principalPaid: 0,
        interestPaid: 0,
        remainingPrincipal: currentPrincipal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        isMoratorium: true,
      });
    }
  }

  // Calculate EMI for active repayment period on remaining/capitalized principal
  // EMI = P * r * (1 + r)^N / ((1 + r)^N - 1)
  const onePlusRToN = r.plus(1).pow(activeTenure);
  const emiDecimal = currentPrincipal.times(r).times(onePlusRToN).dividedBy(onePlusRToN.minus(1));
  const emiNum = emiDecimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

  // Process Active Repayment Months
  for (let month = moratoriumMonths + 1; month <= totalTenure; month++) {
    const monthlyInterest = currentPrincipal.times(r);
    let principalPaid = emiDecimal.minus(monthlyInterest);

    // Final month adjustment
    if (month === totalTenure || principalPaid.greaterThan(currentPrincipal)) {
      principalPaid = currentPrincipal;
    }

    const actualPayment = principalPaid.plus(monthlyInterest);
    currentPrincipal = currentPrincipal.minus(principalPaid);
    accumulatedInterestTotal = accumulatedInterestTotal.plus(monthlyInterest);
    totalPaymentDecimal = totalPaymentDecimal.plus(actualPayment);

    schedule.push({
      month,
      payment: actualPayment.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      principalPaid: principalPaid.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      interestPaid: monthlyInterest.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      remainingPrincipal: Decimal.max(0, currentPrincipal).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      isMoratorium: false,
    });
  }

  return {
    emi: emiNum,
    totalInterest: accumulatedInterestTotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    totalPayment: totalPaymentDecimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    schedule,
  };
}
