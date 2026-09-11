import type {
  AiRecommendation,
  BreakEvenOutput,
  BusinessCategory,
  CashflowOutput,
  CompetitorAnalysis,
  Confidence,
  EmiOutput,
  FeasibilityReport,
  FinancialPlan,
  MarketIntelligence,
  OpportunityAnalysis,
  RiskAssessment,
  RiskLevel,
  WorkingCapitalOutput,
} from '@/types';

// ============================================================
// Raw backend response shapes (mirrors backend Fastify API)
// ============================================================

interface BackendAmortizationRow {
  month: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  remainingPrincipal: number;
  isMoratorium: boolean;
}

interface BackendEmiOutput {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  schedule: BackendAmortizationRow[];
}

interface BackendWorkingCapitalOutput {
  operatingCycleDays: number;
  dailyExpense: number;
  baseWorkingCapital: number;
  bufferAmount: number;
  totalWorkingCapital: number;
}

interface BackendMonthlyCashflowRow {
  month: number;
  revenue: number;
  operatingCosts: number;
  grossSurplus: number;
  emi: number;
  netCashflow: number;
  cumulativeCashflow: number;
}

interface BackendCashflowOutput {
  monthlyCashflow: BackendMonthlyCashflowRow[];
  quarterlySummary: unknown[];
  annualRevenue: number;
  annualNetProfit: number;
  avgMonthlyNetCashflow: number;
  isCashflowPositive: boolean;
}

interface BackendBreakEvenOutput {
  breakEvenUnits: number;
  breakEvenRevenue: number;
  contributionMarginPerUnit?: number;
  contributionMarginRatio?: number;
  marginOfSafetyUnits?: number;
  marginOfSafetyPercentage?: number;
  paybackPeriodMonths?: number;
  isViable: boolean;
}

interface BackendStressScenarioResult {
  scenarioName: string;
  description: string;
  stressedRevenue: number;
  stressedCosts: number;
  stressedEmi: number;
  stressedMonthlyNetCashflow: number;
  netCashflowChangePct: number;
  isViable: boolean;
}

interface BackendStressTestOutput {
  baseMonthlyNetCashflow: number;
  scenarioResults: BackendStressScenarioResult[];
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface BackendMarketIntelligence {
  catchment: { center: { lat: number; lng: number }; radiusKm: number; areaSqKm: number };
  demographics: {
    totalVillages: number;
    totalPopulation: number;
    totalHouseholds: number;
    avgLiteracyRate: number;
    [key: string]: unknown;
  };
  amenities: Record<string, number>;
  topCrops: Array<{ cropName: string; totalAreaHectares: number; totalProductionTonnes: number }>;
  livestock: Array<{ animalType: string; totalCount: number; milkProducingCount: number }>;
  confidence: Confidence;
  source: string;
  cachedAt?: string;
}

interface BackendCompetitorAnalysis {
  totalObserved: number;
  totalReported: number;
  estimatedInferredMin: number;
  estimatedInferredMax: number;
  totalEstimatedMin: number;
  totalEstimatedMax: number;
  densityPerSqKm: number;
  confidence: Confidence;
  breakdown: {
    observed: Array<{
      id: string;
      name: string | null;
      category: string;
      subcategory: string | null;
      scale: string | null;
      operatingStatus: string;
      source: string;
      verificationStatus: string;
    }>;
    reported: Array<{
      id: string;
      name: string | null;
      category: string;
      subcategory: string | null;
      scale: string | null;
      operatingStatus: string;
      source: string;
      verificationStatus: string;
    }>;
  };
}

interface BackendOpportunityAnalysis {
  marketGaps: string[];
  potentialNiches: string[];
  recommendedModel: string;
  opportunityScore: number;
  estimatedAnnualDemandUnits?: number;
  estimatedDailyDemandUnits?: number;
  unit?: string;
  keyDrivers?: string[];
}

interface BackendRiskAssessment {
  riskFactors: Array<{
    name: string;
    probability: RiskLevel;
    impact: RiskLevel;
    mitigation: string;
  }>;
  overallRiskScore: number;
  riskRating: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

interface BackendAiRecommendation {
  decision:
    | 'PROCEED'
    | 'PROCEED_WITH_MODIFICATIONS'
    | 'MODIFY'
    | 'HIGH_RISK'
    | 'INSUFFICIENT_DATA';
  viabilityScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendedNextStep: string;
}

interface BackendActionPlan {
  planDurationDays: number;
  milestones: Array<{ phase: string; dayRange: string; tasks: string[] }>;
  fundingReadinessChecklist: string[];
}

export interface BackendFeasibilityResult {
  id?: string;
  businessCategory: BusinessCategory;
  businessIdea: string;
  catchment: { latitude: number; longitude: number; radiusKm: number };
  marketIntelligence: BackendMarketIntelligence;
  competitorAnalysis: BackendCompetitorAnalysis;
  opportunityAnalysis: BackendOpportunityAnalysis;
  financialPlan: {
    projectCost: number;
    availableCapital: number;
    loanRequired: number;
    marginPercentage: number;
    matchedSchemeName: string;
    matchedSchemeUrl?: string;
    interestRate: number;
    tenureMonths: number;
    subsidyAmount: number;
    netLoanAmount: number;
    emi: BackendEmiOutput;
    workingCapital: BackendWorkingCapitalOutput;
    cashflow: BackendCashflowOutput;
    breakEven: BackendBreakEvenOutput;
    stressTest: BackendStressTestOutput;
  };
  schemeMatches: Array<{
    id: string;
    name: string;
    description: string;
    maxLoan: number;
    interestRate: number;
    tenureMonths: number;
    moratoriumMonths: number;
    subsidyAmount: number;
    netLoanAmount: number;
    eligible: boolean;
    reason: string;
    applyUrl?: string;
  }>;
  riskAssessment: BackendRiskAssessment;
  feasibilityScore: {
    marketDemandScore: number;
    competitionScore: number;
    financialViabilityScore: number;
    capitalAdequacyScore: number;
    riskResilienceScore: number;
    totalScore: number;
    grade: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
  };
  actionPlan: BackendActionPlan;
  aiRecommendation: BackendAiRecommendation;
  status: 'COMPLETED';
  confidence: Confidence;
  createdAt: string;
}

// ============================================================
// Mapping helpers
// ============================================================

const AMENITY_LABELS: Record<string, string> = {
  villagesWithPrimarySchool: 'Primary Schools',
  villagesWithMiddleSchool: 'Middle Schools',
  villagesWithHighSchool: 'High Schools',
  villagesWithPHC: 'Primary Health Centres',
  villagesWithBankBranch: 'Bank Branches',
  villagesWithATM: 'ATMs',
  villagesWithElectricity: 'Villages with Electricity',
  villagesWithBusService: 'Villages with Bus Service',
  villagesWithRailway: 'Villages with Railway',
  villagesWithMobileNetwork: 'Villages with Mobile Network',
  villagesWithInternet: 'Villages with Internet',
};

function mapMarketIntelligence(raw: BackendMarketIntelligence): MarketIntelligence {
  const amenitiesCount: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw.amenities)) {
    amenitiesCount[AMENITY_LABELS[key] ?? key] = typeof value === 'number' ? value : 0;
  }

  const livestock: Record<string, number> = {};
  for (const item of raw.livestock) {
    livestock[item.animalType] = item.totalCount;
  }

  return {
    totalPopulation: raw.demographics.totalPopulation ?? 0,
    totalHouseholds: raw.demographics.totalHouseholds ?? 0,
    literacyRate: raw.demographics.avgLiteracyRate ?? 0,
    catchmentRadiusKm: raw.catchment.radiusKm,
    amenitiesCount,
    topCrops: (raw.topCrops ?? []).map((crop) => ({
      cropName: crop.cropName,
      areaHectares: crop.totalAreaHectares ?? 0,
      productionTonnes: crop.totalProductionTonnes ?? 0,
    })),
    livestock,
    infrastructure: {
      allWeatherRoadAccess: raw.amenities.villagesWithBusService ?? 0,
      mobileConnectivity: raw.amenities.villagesWithMobileNetwork ?? 0,
      internetAccess: raw.amenities.villagesWithInternet ?? 0,
      nearestTownDistanceKm: null,
    },
    confidence: raw.confidence,
  };
}

function mapCompetitorAnalysis(raw: BackendCompetitorAnalysis): CompetitorAnalysis {
  return {
    totalObserved: raw.totalObserved,
    totalReported: raw.totalReported,
    totalEstimatedMin: raw.totalEstimatedMin,
    totalEstimatedMax: raw.totalEstimatedMax,
    overallEstimate: Math.round((raw.totalEstimatedMin + raw.totalEstimatedMax) / 2),
    densityPerSqKm: raw.densityPerSqKm,
    confidence: raw.confidence,
    competitors: [...raw.breakdown.observed, ...raw.breakdown.reported]
      .slice(0, 6)
      .map((c) => ({
        name:
          c.name ??
          (c.subcategory ? `${c.subcategory} (${c.source})` : `Business #${c.id.slice(0, 6)}`),
        scale: (['MICRO', 'SMALL', 'MEDIUM'].includes(c.scale ?? '')
          ? c.scale
          : 'SMALL') as CompetitorAnalysis['competitors'][number]['scale'],
        distance: 0,
      })),
  };
}

function mapOpportunityAnalysis(raw: BackendOpportunityAnalysis): OpportunityAnalysis {
  return {
    marketGaps: raw.marketGaps ?? [],
    potentialNiches: raw.potentialNiches ?? [],
    recommendedModel: raw.recommendedModel ?? '',
    opportunityScore: raw.opportunityScore ?? 0,
    estimatedAnnualDemandUnits: raw.estimatedAnnualDemandUnits ?? 0,
    estimatedDailyDemandUnits: raw.estimatedDailyDemandUnits ?? 0,
    unit: raw.unit ?? 'Units',
    keyDrivers: raw.keyDrivers ?? [],
  };
}

function mapEmi(raw: BackendEmiOutput): EmiOutput {
  return {
    emi: raw.emi,
    totalInterest: raw.totalInterest,
    totalPayment: raw.totalPayment,
    schedule: raw.schedule.map((row) => ({
      month: row.month,
      principal: row.principalPaid,
      interest: row.interestPaid,
      balance: row.remainingPrincipal,
    })),
  };
}

function mapWorkingCapital(raw: BackendWorkingCapitalOutput): WorkingCapitalOutput {
  return {
    requiredWorkingCapital: raw.totalWorkingCapital,
    monthsCovered: Math.max(1, Math.round(raw.operatingCycleDays / 30)),
  };
}

function mapCashflow(raw: BackendCashflowOutput): CashflowOutput {
  return {
    projections: raw.monthlyCashflow.map((row) => ({
      month: row.month,
      revenue: row.revenue,
      operatingCosts: row.operatingCosts,
      emi: row.emi,
      netCashflow: row.netCashflow,
      cumulativeCashflow: row.cumulativeCashflow,
    })),
    averageMonthlyCashflow: raw.avgMonthlyNetCashflow,
    isCashflowPositive: raw.isCashflowPositive,
  };
}

function mapBreakEven(raw: BackendBreakEvenOutput): BreakEvenOutput {
  return {
    breakEvenUnits: raw.breakEvenUnits,
    breakEvenRevenue: raw.breakEvenRevenue,
    breakEvenMonth: raw.paybackPeriodMonths ?? null,
    isViable: raw.isViable,
    chartData: [],
  };
}

export function getSchemePortalUrl(schemeName: string): string {
  if (!schemeName) return 'https://www.jansamarth.in/';
  const name = schemeName.toLowerCase();
  if (name.includes('pmegp')) return 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp';
  if (name.includes('mudra')) return 'https://www.jansamarth.in/';
  if (name.includes('bhabishyat') || name.includes('bccs') || name.includes('wb')) return 'https://bccs.wb.gov.in/';
  if (name.includes('stand') || name.includes('up')) return 'https://www.standupmitra.in/';
  if (name.includes('svanidhi') || name.includes('vendor')) return 'https://pmsvanidhi.mohua.gov.in/';
  return 'https://www.jansamarth.in/';
}

function mapFinancialPlan(
  raw: BackendFeasibilityResult['financialPlan'],
): FinancialPlan {
  return {
    projectCost: raw.projectCost,
    availableCapital: raw.availableCapital,
    loanRequired: raw.loanRequired,
    marginPercentage: raw.marginPercentage,
    matchedSchemeName: raw.matchedSchemeName,
    matchedSchemeUrl:
      raw.matchedSchemeUrl ??
      getSchemePortalUrl(raw.matchedSchemeName),
    interestRate: raw.interestRate,
    tenureMonths: raw.tenureMonths,
    subsidyAmount: raw.subsidyAmount,
    netLoanAmount: raw.netLoanAmount,
    emi: mapEmi(raw.emi),
    workingCapital: mapWorkingCapital(raw.workingCapital),
    cashflow: mapCashflow(raw.cashflow),
    breakEven: mapBreakEven(raw.breakEven),
    stressTest: {
      base: {
        name: 'Base Case',
        revenueChange: 0,
        costChange: 0,
        monthlyNetCashflow: raw.stressTest.baseMonthlyNetCashflow,
        canServiceDebt: raw.stressTest.baseMonthlyNetCashflow >= 0,
      },
      scenarios: raw.stressTest.scenarioResults.map((scenario) => ({
        name: scenario.scenarioName,
        revenueChange: 0,
        costChange: 0,
        monthlyNetCashflow: scenario.stressedMonthlyNetCashflow,
        canServiceDebt: scenario.isViable,
      })),
      overallRiskLevel: raw.stressTest.overallRiskLevel,
    },
  };
}

function mapRiskAssessment(raw: BackendRiskAssessment): RiskAssessment {
  return {
    riskFactors: raw.riskFactors.map((factor) => ({
      name: factor.name,
      probability: factor.probability,
      impact: factor.impact,
      mitigation: factor.mitigation,
    })),
    overallRiskScore: raw.overallRiskScore,
    riskRating:
      raw.riskRating === 'MODERATE' ? 'MEDIUM' : raw.riskRating === 'CRITICAL' ? 'HIGH' : raw.riskRating,
  };
}

function mapAiRecommendation(raw: BackendAiRecommendation): AiRecommendation {
  const decision: AiRecommendation['decision'] =
    raw.decision === 'PROCEED' || raw.decision === 'INSUFFICIENT_DATA'
      ? raw.decision
      : 'MODIFY';

  return {
    decision,
    viabilityScore: raw.viabilityScore,
    summary: raw.summary,
    strengths: raw.strengths,
    weaknesses: raw.weaknesses,
    recommendedNextStep: raw.recommendedNextStep,
  };
}

export function toFeasibilityReport(raw: BackendFeasibilityResult): FeasibilityReport {
  const mappedSchemes = (raw.schemeMatches ?? []).map((s) => ({
    ...s,
    applyUrl: s.applyUrl ?? (s as unknown as { url?: string }).url ?? getSchemePortalUrl(s.name),
  }));

  return {
    id: raw.id,
    businessCategory: raw.businessCategory,
    businessIdea: raw.businessIdea,
    catchment: raw.catchment,
    marketIntelligence: mapMarketIntelligence(raw.marketIntelligence),
    competitorAnalysis: mapCompetitorAnalysis(raw.competitorAnalysis),
    opportunityAnalysis: mapOpportunityAnalysis(raw.opportunityAnalysis),
    financialPlan: mapFinancialPlan(raw.financialPlan),
    schemeMatches: mappedSchemes,
    riskAssessment: mapRiskAssessment(raw.riskAssessment),
    feasibilityScore: raw.feasibilityScore,
    actionPlan: raw.actionPlan,
    aiRecommendation: mapAiRecommendation(raw.aiRecommendation),
    status: 'COMPLETED',
    confidence: raw.confidence,
    createdAt: raw.createdAt,
  };
}