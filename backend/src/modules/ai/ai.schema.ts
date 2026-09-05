import { z } from 'zod';
import { BusinessCategory } from '@prisma/client';

export const classifyBusinessInputSchema = z.object({
  idea: z.string().trim().min(2, 'Idea description is required'),
});

export const classifyBusinessOutputSchema = z.object({
  category: z.nativeEnum(BusinessCategory),
  subcategory: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export const demandEstimateInputSchema = z.object({
  businessCategory: z.nativeEnum(BusinessCategory),
  totalPopulation: z.number().min(0),
  totalHouseholds: z.number().min(0),
  avgLiteracyRate: z.number().optional(),
  nearbyTownDistanceKm: z.number().optional(),
});

export const demandEstimateOutputSchema = z.object({
  estimatedAnnualDemandUnits: z.number(),
  estimatedDailyDemandUnits: z.number(),
  unit: z.string(),
  confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  keyDrivers: z.array(z.string()),
});

export const opportunityDiscoveryInputSchema = z.object({
  businessCategory: z.nativeEnum(BusinessCategory),
  existingCompetitors: z.number().min(0),
  estimatedDemandUnits: z.number().min(0),
  topCrops: z.array(z.string()).optional(),
  livestockCount: z.number().optional(),
});

export const opportunityDiscoveryOutputSchema = z.object({
  marketGaps: z.array(z.string()),
  potentialNiches: z.array(z.string()),
  recommendedModel: z.string(),
  opportunityScore: z.number().min(0).max(100),
});

export const riskAssessmentInputSchema = z.object({
  businessCategory: z.nativeEnum(BusinessCategory),
  projectCost: z.number(),
  loanAmount: z.number(),
  monthlyEmi: z.number(),
  postEmiCashflow: z.number().optional(),
});

export const riskFactorSchema = z.object({
  name: z.string(),
  probability: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  impact: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  mitigation: z.string(),
});

export const riskAssessmentOutputSchema = z.object({
  riskFactors: z.array(riskFactorSchema),
  overallRiskScore: z.number().min(0).max(100), // 0-100 where higher means riskier
  riskRating: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']),
});

export const recommendationInputSchema = z.object({
  businessCategory: z.nativeEnum(BusinessCategory),
  businessIdea: z.string().optional(),
  opportunityScore: z.number(),
  financialViabilityScore: z.number(),
  riskScore: z.number(),
  matchedScheme: z.string().optional(),
});

export const recommendationOutputSchema = z.object({
  decision: z.enum(['PROCEED', 'PROCEED_WITH_MODIFICATIONS', 'MODIFY', 'HIGH_RISK']),
  viabilityScore: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendedNextStep: z.string(),
});

export const actionPlanInputSchema = z.object({
  businessCategory: z.nativeEnum(BusinessCategory),
  loanAmount: z.number(),
  schemeName: z.string().optional(),
});

export const actionMilestoneSchema = z.object({
  phase: z.string(),
  dayRange: z.string(),
  tasks: z.array(z.string()),
});

export const actionPlanOutputSchema = z.object({
  planDurationDays: z.number().default(30),
  milestones: z.array(actionMilestoneSchema),
  fundingReadinessChecklist: z.array(z.string()),
});

export type ClassifyBusinessInput = z.infer<typeof classifyBusinessInputSchema>;
export type ClassifyBusinessOutput = z.infer<typeof classifyBusinessOutputSchema>;
export type DemandEstimateInput = z.infer<typeof demandEstimateInputSchema>;
export type DemandEstimateOutput = z.infer<typeof demandEstimateOutputSchema>;
export type OpportunityDiscoveryInput = z.infer<typeof opportunityDiscoveryInputSchema>;
export type OpportunityDiscoveryOutput = z.infer<typeof opportunityDiscoveryOutputSchema>;
export type RiskAssessmentInput = z.infer<typeof riskAssessmentInputSchema>;
export type RiskAssessmentOutput = z.infer<typeof riskAssessmentOutputSchema>;
export type RecommendationInput = z.infer<typeof recommendationInputSchema>;
export type RecommendationOutput = z.infer<typeof recommendationOutputSchema>;
export type ActionPlanInput = z.infer<typeof actionPlanInputSchema>;
export type ActionPlanOutput = z.infer<typeof actionPlanOutputSchema>;
