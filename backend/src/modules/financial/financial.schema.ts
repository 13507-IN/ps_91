import { z } from 'zod';

export const emiCalculationSchema = z.object({
  principal: z.number().positive('Principal must be positive'),
  annualRate: z.number().min(0, 'Interest rate cannot be negative'),
  tenureMonths: z.number().int().positive('Tenure must be positive'),
  moratoriumMonths: z.number().int().min(0).optional().default(0),
  moratoriumType: z.enum(['INTEREST_ONLY', 'NO_PAYMENT']).optional().default('INTEREST_ONLY'),
});

export const projectCostCalculationSchema = z.object({
  availableMargin: z.number().positive('Available margin must be positive'),
  marginPercentage: z.number().positive().max(100).optional().default(10),
  maxProjectCostCap: z.number().positive().optional(),
});

export const cashflowCalculationSchema = z.object({
  monthlyRevenue: z.number().min(0),
  monthlyOperatingCosts: z.number().min(0),
  monthlyEmi: z.number().min(0),
  seasonalityMultipliers: z.array(z.number()).length(12).optional(),
  annualGrowthRate: z.number().optional().default(5),
  projectionMonths: z.number().int().positive().optional().default(12),
});

export const breakevenCalculationSchema = z.object({
  monthlyFixedCosts: z.number().min(0),
  variableCostPerUnit: z.number().min(0),
  sellingPricePerUnit: z.number().positive('Selling price must be positive'),
  initialProjectCost: z.number().positive().optional(),
  expectedMonthlyUnits: z.number().min(0).optional(),
});

export const stressTestSchema = z.object({
  monthlyRevenue: z.number().positive(),
  monthlyOperatingCosts: z.number().min(0),
  monthlyEmi: z.number().min(0),
  annualRate: z.number().optional(),
  loanPrincipal: z.number().optional(),
  tenureMonths: z.number().optional(),
  scenarios: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        rawMaterialCostChangePct: z.number().optional(),
        demandChangePct: z.number().optional(),
        sellingPriceChangePct: z.number().optional(),
        interestRateChangePct: z.number().optional(),
      }),
    )
    .optional(),
});

export const fullFinancialPlanSchema = z.object({
  availableMargin: z.number().positive(),
  marginPercentage: z.number().positive().max(100).optional().default(10),
  annualRate: z.number().min(0),
  tenureMonths: z.number().int().positive(),
  monthlyRevenue: z.number().positive(),
  monthlyOperatingCosts: z.number().min(0),
  variableCostPerUnit: z.number().min(0),
  sellingPricePerUnit: z.number().positive(),
  expectedMonthlyUnits: z.number().positive(),
  seasonalityMultipliers: z.array(z.number()).length(12).optional(),
});

export type EmiCalculationInput = z.infer<typeof emiCalculationSchema>;
export type ProjectCostCalculationInput = z.infer<typeof projectCostCalculationSchema>;
export type CashflowCalculationInput = z.infer<typeof cashflowCalculationSchema>;
export type BreakevenCalculationInput = z.infer<typeof breakevenCalculationSchema>;
export type StressTestInputSchema = z.infer<typeof stressTestSchema>;
export type FullFinancialPlanInput = z.infer<typeof fullFinancialPlanSchema>;
