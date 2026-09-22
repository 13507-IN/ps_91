export type BusinessCategory =
  | 'DAIRY' | 'FOOD_PROCESSING' | 'RETAIL' | 'TEXTILES_TAILORING' | 'POULTRY' | 'AGRICULTURE' | 'LIVESTOCK' | 'TRANSPORT' | 'HANDICRAFT' | 'SERVICES' | 'OTHER';

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type Decision = 'PROCEED' | 'MODIFY' | 'INSUFFICIENT_DATA';
export type Grade = 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
export type SocialCategory = 'GENERAL' | 'SC' | 'ST' | 'OBC' | 'MINORITY';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type BusinessScale = 'MICRO' | 'SMALL' | 'MEDIUM';
export type PriceRange = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CategoryInfo {
  code: BusinessCategory;
  name: string;
  description: string;
  typicalInvestmentRange: { min: number; max: number };
  defaultMarginPct: number;
  subcategories: string[];
}

export interface EmiScheduleEntry {
  month: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface EmiOutput {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  schedule: EmiScheduleEntry[];
}

export interface WorkingCapitalOutput {
  requiredWorkingCapital: number;
  monthsCovered: number;
  inventoryDays?: number;
  receivableDays?: number;
  payableDays?: number;
  operatingCycleDays?: number;
  dailyExpense?: number;
  baseWorkingCapital?: number;
  bufferAmount?: number;
}

export interface RevenueAssumptionItem {
  name: string;
  dailyUnits: number;
  unitPrice: number;
  unitName: string;
  dailyRevenue: number;
  monthlyRevenue: number;
}

export interface CostBreakdownItem {
  category: string;
  monthlyAmount: number;
  description: string;
  isDirectCost: boolean;
}

export interface FinancialAssumptions {
  revenueItems: RevenueAssumptionItem[];
  costItems: CostBreakdownItem[];
  methodologyNotes: string[];
}

export interface DscrOutput {
  dscr: number;
  status: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'HIGH_RISK';
  benchmarkText: string;
}

export interface SeasonalMonthInfo {
  monthIndex: number;
  monthName: string;
  multiplier: number;
  status: 'PEAK' | 'NORMAL' | 'LEAN';
  reason: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'MACHINERY' | 'INSTRUMENT' | 'TOOL' | 'INFRASTRUCTURE' | 'SAFETY';
  estimatedCost: number;
  quantity: number;
  unit: string;
  importance: 'ESSENTIAL' | 'RECOMMENDED' | 'OPTIONAL';
  specification: string;
  vendorType: string;
}



export interface CashflowEntry {
  month: number;
  revenue: number;
  operatingCosts: number;
  emi: number;
  netCashflow: number;
  cumulativeCashflow: number;
}

export interface CashflowOutput {
  projections: CashflowEntry[];
  averageMonthlyCashflow: number;
  isCashflowPositive: boolean;
}

export interface BreakEvenOutput {
  breakEvenUnits: number;
  breakEvenRevenue: number;
  breakEvenMonth: number | null;
  isViable: boolean;
  chartData: { month: number; revenue: number; totalCost: number }[];
}

export interface StressTestScenario {
  name: string;
  revenueChange: number;
  costChange: number;
  monthlyNetCashflow: number;
  canServiceDebt: boolean;
}

export interface StressTestOutput {
  base: StressTestScenario;
  scenarios: StressTestScenario[];
  overallRiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface MatchedSchemeResult {
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
}

export interface CropSummary {
  cropName: string;
  areaHectares?: number;
  productionTonnes?: number;
}

export interface MarketIntelligence {
  totalPopulation: number;
  totalHouseholds: number;
  literacyRate: number;
  catchmentRadiusKm: number;
  amenitiesCount: Record<string, number>;
  topCrops: Array<string | CropSummary>;
  livestock: Record<string, number>;
  infrastructure: Record<string, unknown>;
  confidence: Confidence;
}

export interface CompetitorAnalysis {
  totalObserved: number;
  totalReported: number;
  totalEstimatedMin: number;
  totalEstimatedMax: number;
  overallEstimate: number;
  densityPerSqKm: number;
  confidence: Confidence;
  competitors: { name: string; scale: BusinessScale; distance: number }[];
}

export interface OpportunityAnalysis {
  villageName?: string;
  blockName?: string;
  districtName?: string;
  stateName?: string;
  marketGaps: string[];
  potentialNiches: string[];
  recommendedModel: string;
  selectionReasoning?: string;
  opportunityScore: number;
  estimatedAnnualDemandUnits: number;
  estimatedDailyDemandUnits: number;
  unit: string;
  keyDrivers: string[];
}

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskFactor {
  name: string;
  probability: number | RiskLevel;
  impact: number | RiskLevel;
  mitigation: string;
}

export interface RiskAssessment {
  riskFactors: RiskFactor[];
  overallRiskScore: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface FeasibilityScore {
  marketDemandScore: number;
  competitionScore: number;
  financialViabilityScore: number;
  capitalAdequacyScore: number;
  riskResilienceScore: number;
  totalScore: number;
  grade: Grade;
}

export interface ActionMilestone {
  phase: string;
  dayRange: string;
  tasks: string[];
}

export interface ActionPlan {
  planDurationDays: number;
  milestones: ActionMilestone[];
  fundingReadinessChecklist: string[];
}

export interface AiRecommendation {
  decision: Decision;
  viabilityScore: number;
  summary: string;
  selectionReasoning?: string;
  strengths: string[];
  weaknesses: string[];
  recommendedNextStep: string;
}

export interface FinancialPlan {
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
  emi: EmiOutput;
  workingCapital: WorkingCapitalOutput;
  cashflow: CashflowOutput;
  breakEven: BreakEvenOutput;
  stressTest: StressTestOutput;
  dscr?: DscrOutput;
  assumptions?: FinancialAssumptions;
  seasonalMultipliers?: SeasonalMonthInfo[];
  equipmentList?: EquipmentItem[];
}

export interface FeasibilityReport {
  id?: string;
  businessCategory: BusinessCategory;
  businessIdea: string;
  villageName?: string;
  blockName?: string;
  district?: string;
  state?: string;
  catchment: { latitude: number; longitude: number; radiusKm: number };
  marketIntelligence: MarketIntelligence;
  competitorAnalysis: CompetitorAnalysis;
  opportunityAnalysis: OpportunityAnalysis;
  financialPlan: FinancialPlan;
  localSuppliers?: SupplierItem[];
  equipmentList?: EquipmentItem[];
  schemeMatches: MatchedSchemeResult[];
  riskAssessment: RiskAssessment;
  feasibilityScore: FeasibilityScore;
  actionPlan: ActionPlan;
  aiRecommendation: AiRecommendation;
  status: 'COMPLETED';
  confidence: Confidence;
  createdAt: string;
}

export interface ApiError {
  statusCode?: number;
  code?: string;
  message?: string;
  details?: unknown;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface UserProfile {
  id: string;
  phone?: string;
  name?: string | null;
  email?: string | null;
  gender?: Gender | null;
  dateOfBirth?: string | null;
  category?: SocialCategory | null;
  isMinority?: boolean;
  businessExperience?: string | null;
  availableLand?: string | null;
  availableEquipment?: string | null;
  expectedWorkingHours?: number | null;
  preferredCategory?: BusinessCategory | null;
  catchmentRadiusKm?: number | null;
  location?: {
    latitude?: number;
    longitude?: number;
    village?: string;
    block?: string;
    district?: string;
    state?: string;
  } | null;
  createdAt?: string;
  role?: string;
}

export type UpdateUserProfileBody = Partial<
  Pick<
    UserProfile,
    | 'name'
    | 'email'
    | 'gender'
    | 'dateOfBirth'
    | 'category'
    | 'isMinority'
    | 'businessExperience'
    | 'availableLand'
    | 'availableEquipment'
    | 'expectedWorkingHours'
    | 'preferredCategory'
    | 'catchmentRadiusKm'
    | 'location'
  >
>;

export type AnalyzeFeasibilityBody = WizardDraft;

export interface CompetitorSummary {
  name: string;
  scale: BusinessScale;
  distance: number;
}

export interface SupplierItem {
  id: string;
  name: string | null;
  category: BusinessCategory;
  subcategory: string | null;
  scale: BusinessScale | null;
  distance: number;
}

export interface WizardDraft {
  step: number;
  villageId?: number;
  villageName?: string;
  block?: string;
  district?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  businessCategory?: BusinessCategory;
  businessIdea?: string;
  availableCapital?: number;
  catchmentRadiusKm?: number;
  age?: number;
  gender?: Gender;
  category?: SocialCategory;
  isMinority?: boolean;
  businessExperience?: string;
  availableLand?: string;
  availableEquipment?: string;
  expectedWorkingHours?: number;
}

export interface SchemeEligibility {
  categories?: SocialCategory[];
  gender?: Gender[];
  ageMin?: number;
  ageMax?: number;
  isMinority?: boolean;
  businessCategories?: BusinessCategory[];
  minProjectCost?: number;
  maxProjectCost?: number;
  states?: string[];
}

export interface SchemeFinancial {
  maxLoanAmount: number;
  interestRate: number;
  subsidyPercentage: number;
  maxSubsidy: number;
  marginPercentage: number;
  tenureMonths: number;
  moratoriumMonths: number;
  moratoriumType: string;
}

export interface SchemeConfig {
  schemeId: string;
  name: string;
  shortName?: string;
  description: string;
  nodalAgency: string;
  targetAudience?: string;
  applyUrl?: string;
  eligibility: SchemeEligibility;
  financial: SchemeFinancial;
  requiredDocuments: string[];
  priority: number;
  active: boolean;
  version: string;
  lastUpdated?: string;
}

export interface SchemeListResponse {
  totalMatched?: number;
  schemes: SchemeConfig[];
}

export type IngestionSource =
  | 'lgd' | 'census' | 'udyam' | 'livestock' | 'crop' | 'agmarknet' | 'roads' | 'amenities';

export interface IngestionResult {
  source: IngestionSource;
  status: 'completed' | 'failed';
  totalRows: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  errorDetails: string[];
  durationMs: number;
  timestamp: string;
}

export type IngestionJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface JobStatus {
  id: string;
  source?: IngestionSource | 'all';
  status: IngestionJobStatus;
  results?: IngestionResult | IngestionResult[];
  error?: string;
  startTime: string;
  endTime?: string;
}

export interface PipelineInfo {
  order: IngestionSource[];
}

export interface VillageFull {
  id: number;
  name: string;
  nameLocal: string | null;
  latitude: number | null;
  longitude: number | null;
  block: {
    name: string;
    district: {
      name: string;
      state: { name: string };
    };
  };
  censusData: {
    totalPopulation: number | null;
    malePopulation: number | null;
    femalePopulation: number | null;
    totalHouseholds: number | null;
    scPopulation: number | null;
    stPopulation: number | null;
    literacyRate: number | null;
    censusYear?: number;
  } | null;
  amenities: {
    hasPrimarySchool: boolean | null;
    hasMiddleSchool: boolean | null;
    hasHighSchool: boolean | null;
    hasPHC: boolean | null;
    hasPostOffice: boolean | null;
    hasBankBranch: boolean | null;
    hasATM: boolean | null;
    hasElectricity: boolean | null;
    hasBusService: boolean | null;
    hasRailway: boolean | null;
    hasMobileNetwork: boolean | null;
    hasInternet: boolean | null;
    nearestTownKm: number | null;
  } | null;
  livestock: {
    animalType: string;
    count: number | null;
    milkProducing: number | null;
    confidence: Confidence;
  }[];
  crops: {
    cropName: string;
    season: string;
    areaHectares: number | null;
    productionTonnes: number | null;
    yieldPerHectare: number | null;
    confidence: Confidence;
  }[];
  roads: {
    roadType: string;
    surfaceType: string | null;
    nearestTown: string | null;
    distanceKm: number | null;
  }[];
  businesses: {
    id: string;
    name: string | null;
    category: BusinessCategory;
    subcategory: string | null;
    scale: BusinessScale | null;
    priceRange: PriceRange | null;
    confidence: Confidence;
  }[];
}