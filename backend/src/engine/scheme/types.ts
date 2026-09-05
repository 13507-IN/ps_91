import { z } from 'zod';
import { SocialCategory, Gender, BusinessCategory } from '@prisma/client';

export const SchemeEligibilitySchema = z.object({
  categories: z.array(z.nativeEnum(SocialCategory)).optional(), // Allowed social categories
  gender: z.array(z.nativeEnum(Gender)).optional(),              // Allowed genders
  ageMin: z.number().int().min(14).optional(),
  ageMax: z.number().int().max(100).optional(),
  isMinority: z.boolean().nullable().optional(),
  businessCategories: z.array(z.nativeEnum(BusinessCategory)).optional(),
  minProjectCost: z.number().optional(),
  maxProjectCost: z.number().optional(),
  states: z.array(z.string()).optional(), // State restrictions (e.g. "West Bengal")
});

export const SchemeFinancialSchema = z.object({
  maxLoanAmount: z.number(),
  interestRate: z.number(), // Annual rate %
  subsidyPercentage: z.number().default(0), // Subsidy / Capital grant %
  maxSubsidy: z.number().default(0),        // Max subsidy cap in ₹
  marginPercentage: z.number().default(10),  // Required margin %
  tenureMonths: z.number().default(60),
  moratoriumMonths: z.number().default(0),
  moratoriumType: z.enum(['INTEREST_ONLY', 'NO_PAYMENT']).default('INTEREST_ONLY'),
});

export const SchemeConfigSchema = z.object({
  schemeId: z.string(),
  name: z.string(),
  shortName: z.string().optional(),
  description: z.string(),
  nodalAgency: z.string(),
  targetAudience: z.string().optional(),
  eligibility: SchemeEligibilitySchema,
  financial: SchemeFinancialSchema,
  requiredDocuments: z.array(z.string()).default([]),
  priority: z.number().int().default(1),
  active: z.boolean().default(true),
  version: z.string().default('1.0.0'),
  lastUpdated: z.string().optional(),
});

export type SchemeEligibility = z.infer<typeof SchemeEligibilitySchema>;
export type SchemeFinancial = z.infer<typeof SchemeFinancialSchema>;
export type SchemeConfig = z.infer<typeof SchemeConfigSchema>;

export interface UserSchemeFacts {
  age?: number;
  gender?: Gender;
  category?: SocialCategory;
  isMinority?: boolean;
  businessCategory?: BusinessCategory;
  projectCost: number;
  availableMargin?: number;
  state?: string;
  district?: string;
}

export interface MatchedSchemeResult {
  schemeId: string;
  name: string;
  shortName?: string;
  description: string;
  nodalAgency: string;
  priority: number;
  
  // Financial match results
  projectCost: number;
  userMargin: number;
  requiredMargin: number;
  eligibleLoanAmount: number;
  subsidyAmount: number;
  netLoanAmount: number;
  interestRate: number;
  tenureMonths: number;
  moratoriumMonths: number;
  estimatedEmi: number;
  totalInterest: number;
  requiredDocuments: string[];
  eligibilityNotes: string[];
}
