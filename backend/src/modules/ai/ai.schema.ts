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

// ============================================================================
// Unified Assessment Endpoint Schemas
// ============================================================================

export const locationInputSchema = z.object({
  village: z.string(),
  block: z.string(),
  district: z.string(),
  state: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const marketInputSchema = z.object({
  population: z.number(),
  households: z.number(),
  estimated_demand: z.number().optional(),
  estimated_supply: z.number().optional(),
  avg_literacy_rate: z.number().optional(),
  total_workers: z.number().optional(),
  agricultural_labourers: z.number().optional(),
  cultivators: z.number().optional(),
  household_industry_workers: z.number().optional(),
  nearest_town_km: z.number().optional(),
});

export const informalEstimateSchema = z.object({
  min: z.number(),
  max: z.number(),
});

export const competitionInputSchema = z.object({
  verified: z.number(),
  reported: z.number(),
  estimated_informal: informalEstimateSchema.optional(),
  density_per_sq_km: z.number().optional(),
});

export const pricingInputSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  modal: z.number().optional(),
  unit: z.string().default('per unit'),
});

export const cropInfoSchema = z.object({
  crop_name: z.string(),
  total_area_hectares: z.number().optional(),
  total_production_tonnes: z.number().optional(),
});

export const livestockInfoSchema = z.object({
  animal_type: z.string(),
  total_count: z.number(),
  milk_producing_count: z.number().optional(),
});

export const infrastructureInputSchema = z.object({
  has_electricity: z.boolean().optional(),
  has_bank_branch: z.boolean().optional(),
  has_atm: z.boolean().optional(),
  has_bus_service: z.boolean().optional(),
  has_mobile_network: z.boolean().optional(),
  has_internet: z.boolean().optional(),
  has_post_office: z.boolean().optional(),
  has_phc: z.boolean().optional(),
  has_cold_storage: z.boolean().optional(),
  nearest_town_km: z.number().optional(),
  road_type: z.string().optional(),
});

export const financialInputSchema = z.object({
  margin: z.number(),
  project_cost: z.number(),
  loan: z.number(),
  interest_rate: z.number().optional(),
  tenure_months: z.number().optional(),
  monthly_emi: z.number().optional(),
  monthly_revenue_estimate: z.number().optional(),
  monthly_operating_cost: z.number().optional(),
  subsidy_amount: z.number().optional(),
  scheme_name: z.string().optional(),
});

export const assessmentInputSchema = z.object({
  location: locationInputSchema,
  business_category: z.nativeEnum(BusinessCategory),
  business_idea: z.string().optional(),
  market: marketInputSchema,
  competition: competitionInputSchema,
  pricing: pricingInputSchema.optional(),
  top_crops: z.array(cropInfoSchema).optional(),
  livestock: z.array(livestockInfoSchema).optional(),
  infrastructure: infrastructureInputSchema.optional(),
  financial: financialInputSchema,
});

export const marketAnalysisOutputSchema = z.object({
  demand_level: z.string(),
  market_condition: z.string(),
  reasoning: z.array(z.string()),
  confidence: z.string(),
});

export const marketGapSchema = z.object({
  name: z.string(),
  opportunity: z.string(),
  reason: z.string(),
});

export const competitionAnalysisOutputSchema = z.object({
  competition_level: z.string(),
  verified_businesses: z.number(),
  reported_businesses: z.number(),
  estimated_informal: z.object({
    min: z.number(),
    max: z.number(),
  }),
  informal_interpretation: z.string(),
  confidence: z.string(),
});

export const businessModelRecommendationSchema = z.object({
  name: z.string(),
  reasoning: z.array(z.string()),
  capital_fit: z.string(),
});

export const swotOutputSchema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  opportunities: z.array(z.string()),
  threats: z.array(z.string()),
});

export const riskFactorUnifiedSchema = z.object({
  risk: z.string(),
  category: z.string(),
  probability: z.string(),
  impact: z.string(),
  severity: z.string(),
  evidence: z.string(),
  mitigation: z.string(),
});

export const pricingStrategyOutputSchema = z.object({
  recommended_price_range: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }),
  strategy: z.string(),
  reasoning: z.string(),
  confidence: z.string(),
});

export const reasoningItemSchema = z.object({
  claim: z.string(),
  evidence: z.array(z.string()),
  inference: z.boolean(),
  confidence: z.number().optional(),
});

export const assessmentOutputSchema = z.object({
  market_score: z.number(),
  opportunity_score: z.number(),
  risk_score: z.number(),
  viability_score: z.number(),
  market_analysis: marketAnalysisOutputSchema,
  market_gaps: z.array(marketGapSchema),
  competition_analysis: competitionAnalysisOutputSchema,
  recommended_business_model: businessModelRecommendationSchema,
  swot: swotOutputSchema,
  risks: z.array(riskFactorUnifiedSchema),
  pricing_strategy: pricingStrategyOutputSchema,
  reasoning: z.array(reasoningItemSchema),
  confidence: z.string(),
});

export type AssessmentInput = z.infer<typeof assessmentInputSchema>;
export type AssessmentOutput = z.infer<typeof assessmentOutputSchema>;
