import type { PrismaClient } from '@prisma/client';
import {
  BusinessCategory,
  AnalysisStatus,
  Confidence,
  Gender,
  SocialCategory,
} from '@prisma/client';
import { MarketService } from '../market/market.service.js';
import { AiClient } from '../ai/ai.client.js';
import {
  calculateProjectCost,
  calculateEmi,
  calculateCashflow,
  calculateBreakEven,
  calculateWorkingCapital,
  runStressTest,
  type EmiOutput,
  type CashflowOutput,
  type BreakEvenOutput,
  type WorkingCapitalOutput,
  type StressTestOutput,
} from '../../engine/financial/index.js';
import { SchemeEvaluator, type MatchedSchemeResult } from '../../engine/scheme/index.js';
import type { AnalyzeFeasibilityBody } from './feasibility.schema.js';
import { NotFoundError } from '../../lib/errors.js';

export interface FeasibilityScoreBreakdown {
  marketDemandScore: number; // 0-20
  competitionScore: number; // 0-20
  financialViabilityScore: number; // 0-20
  capitalAdequacyScore: number; // 0-20
  riskResilienceScore: number; // 0-20
  totalScore: number; // 0-100
  grade: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
}

export interface FeasibilityAnalysisResult {
  id?: string;
  businessCategory: BusinessCategory;
  businessIdea: string;
  catchment: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  marketIntelligence: Record<string, unknown>;
  competitorAnalysis: Record<string, unknown>;
  opportunityAnalysis: Record<string, unknown>;
  financialPlan: {
    projectCost: number;
    availableCapital: number;
    loanRequired: number;
    marginPercentage: number;
    matchedSchemeName: string;
    interestRate: number;
    tenureMonths: number;
    subsidyAmount: number;
    netLoanAmount: number;
    emi: EmiOutput;
    workingCapital: WorkingCapitalOutput;
    cashflow: CashflowOutput;
    breakEven: BreakEvenOutput;
    stressTest: StressTestOutput;
  };
  localSuppliers: Record<string, unknown>[];
  schemeMatches: MatchedSchemeResult[];
  riskAssessment: Record<string, unknown>;
  feasibilityScore: FeasibilityScoreBreakdown;
  actionPlan: Record<string, unknown>;
  aiRecommendation: Record<string, unknown>;
  status: AnalysisStatus;
  confidence: Confidence;
  createdAt: string;
}

export class FeasibilityService {
  private marketService: MarketService;
  private aiClient: AiClient;
  private schemeEvaluator: SchemeEvaluator;

  constructor(private prisma: PrismaClient) {
    this.marketService = new MarketService(prisma);
    this.aiClient = new AiClient();
    this.schemeEvaluator = new SchemeEvaluator();
  }

  /**
   * Run the complete end-to-end feasibility analysis workflow.
   */
  async analyze(body: AnalyzeFeasibilityBody, userId?: string): Promise<FeasibilityAnalysisResult> {
    const lat = body.latitude;
    const lng = body.longitude;
    const radiusKm = body.catchmentRadiusKm ?? 10;

    // 1. Business Category Inference (if not explicitly chosen)
    let category = body.businessCategory;
    if (!category) {
      const classification = await this.aiClient.classifyBusiness({ idea: body.businessIdea });
      category = classification.category;
    }

    // 2. Query Market Intelligence, Competitors, and Suppliers in parallel
    const [marketIntel, competitorIntel, localSuppliers] = await Promise.all([
      this.marketService.getMarketIntelligence(lat, lng, radiusKm, category),
      this.marketService.getCompetitorAnalysis(lat, lng, radiusKm, category),
      this.marketService.getLocalSuppliers(lat, lng, radiusKm, category),
    ]);

    // 3. Skip individual AI opportunity discovery and AI risk assessment.
    // The unified Python orchestrator handles this in a single pipeline pass.
    
    // We do still calculate base financial/scheme metrics locally since the backend
    // remains the source of truth for calculations. The AI just interprets them.

    // 4. Financial Calculations: Margin -> Project Cost -> Loan
    const baseProjectCost = calculateProjectCost({
      availableMargin: body.availableCapital,
      marginPercentage: 10,
    });

    // 5. Scheme Auto-Selection
    const schemeMatches = this.schemeEvaluator.evaluateSchemes({
      age: body.age ?? 30,
      gender: body.gender ?? Gender.MALE,
      category: body.category ?? SocialCategory.GENERAL,
      isMinority: body.isMinority ?? false,
      businessCategory: category,
      projectCost: baseProjectCost.projectCost,
      availableMargin: body.availableCapital,
      state: 'West Bengal',
      district: 'Nadia',
    });

    const topScheme = schemeMatches[0];
    const interestRate = topScheme?.interestRate ?? 10.5;
    const tenureMonths = topScheme?.tenureMonths ?? 60;
    const moratoriumMonths = topScheme?.moratoriumMonths ?? 3;
    const subsidyAmount = topScheme?.subsidyAmount ?? 0;
    const netLoanAmount = topScheme?.netLoanAmount ?? baseProjectCost.loanAmount;

    // 6. EMI, Cashflow, Working Capital & Break-even
    const emiResult = calculateEmi({
      principal: netLoanAmount,
      annualRate: interestRate,
      tenureMonths,
      moratoriumMonths,
      moratoriumType: 'INTEREST_ONLY',
    });

    // Estimate realistic monthly revenue based on project scale
    // In rural micro-enterprises, monthly revenue is typically 12% - 20% of total project cost
    const estimatedMonthlyRevenue = Math.round(baseProjectCost.projectCost * 0.16);
    const estimatedMonthlyRawMaterials = Math.round(estimatedMonthlyRevenue * 0.5);
    const estimatedMonthlyOperatingCosts = Math.round(estimatedMonthlyRevenue * 0.22);
    const totalMonthlyOperating = estimatedMonthlyRawMaterials + estimatedMonthlyOperatingCosts;

    const cashflowResult = calculateCashflow({
      monthlyRevenue: estimatedMonthlyRevenue,
      monthlyOperatingCosts: totalMonthlyOperating,
      monthlyEmi: emiResult.emi,
      annualGrowthRate: 5,
      projectionMonths: 12,
    });

    const workingCapitalResult = calculateWorkingCapital({
      monthlyOperatingExpenses: totalMonthlyOperating,
      inventoryDays: 15,
      receivableDays: 15,
      payableDays: 10,
      bufferPercentage: 10,
    });

    // Representative unit economics
    const unitPrice = category === BusinessCategory.DAIRY ? 50 : 100;
    const variablePerUnit = unitPrice * 0.65;
    const fixedCostsMonthly = estimatedMonthlyOperatingCosts + emiResult.emi;

    const breakEvenResult = calculateBreakEven({
      monthlyFixedCosts: fixedCostsMonthly,
      variableCostPerUnit: variablePerUnit,
      sellingPricePerUnit: unitPrice,
      expectedMonthlyUnits: Math.round(estimatedMonthlyRevenue / unitPrice),
      initialProjectCost: baseProjectCost.projectCost,
    });

    // 7. Stress Testing (Adverse scenario simulation)
    const stressTestResult = runStressTest({
      monthlyRevenue: estimatedMonthlyRevenue,
      monthlyOperatingCosts: totalMonthlyOperating,
      monthlyEmi: emiResult.emi,
    });

    // 8. Run Unified AI Assessment Pipeline
    // Assemble all deterministic data into the AssessmentInput structure
    const assessmentResult = await this.aiClient.runUnifiedAssessment({
      location: {
        village: 'Unknown Village', // In a real app, query village details from DB
        block: 'Unknown Block',
        district: 'Nadia',
        state: 'West Bengal',
        latitude: lat,
        longitude: lng,
      },
      business_category: category,
      business_idea: body.businessIdea,
      market: {
        population: marketIntel.demographics.totalPopulation,
        households: marketIntel.demographics.totalHouseholds,
        estimated_demand: competitorIntel.totalEstimatedMin * 20,
        estimated_supply: competitorIntel.totalEstimatedMin * 10, // heuristic
      },
      competition: {
        verified: competitorIntel.totalObserved,
        reported: competitorIntel.totalReported,
        density_per_sq_km: competitorIntel.densityPerSqKm,
      },
      financial: {
        margin: body.availableCapital,
        project_cost: baseProjectCost.projectCost,
        loan: netLoanAmount,
        interest_rate: interestRate,
        tenure_months: tenureMonths,
        monthly_emi: emiResult.emi,
        monthly_revenue_estimate: estimatedMonthlyRevenue,
        monthly_operating_cost: totalMonthlyOperating,
        subsidy_amount: subsidyAmount,
        scheme_name: topScheme?.name,
      }
    });

    // 9. Multi-Dimensional Feasibility Scoring (0 to 100)
    // Dimension 1: Market Demand (0-20)
    let demandScore = Math.round(assessmentResult.market_score / 5);
    demandScore = Math.min(20, Math.max(0, demandScore));

    // Dimension 2: Competition Intensity (0-20)
    let compScore = 15;
    if (competitorIntel.densityPerSqKm > 0.5) compScore -= 5;
    else if (competitorIntel.densityPerSqKm > 0.2) compScore -= 2;
    compScore = Math.min(20, Math.max(5, compScore));

    // Dimension 3: Financial Viability (0-20)
    let finScore = 12;
    if (cashflowResult.isCashflowPositive) finScore += 4;
    if (breakEvenResult.isViable) finScore += 4;
    finScore = Math.min(20, finScore);

    // Dimension 4: Capital Adequacy (0-20)
    let capScore = 14;
    if (body.availableCapital >= workingCapitalResult.totalWorkingCapital) capScore += 4;
    else capScore += 1;
    capScore = Math.min(20, capScore);

    // Dimension 5: Risk Resilience (0-20)
    let riskResScore = 20 - Math.round(assessmentResult.risk_score / 5);
    riskResScore = Math.min(20, Math.max(0, riskResScore));

    // The AI orchestrator calculates the final viability score.
    // We will sync our total score with the AI's viability score to ensure consistency.
    const totalScore = assessmentResult.viability_score;
    const grade =
      totalScore >= 80 ? 'EXCELLENT' : totalScore >= 65 ? 'GOOD' : totalScore >= 50 ? 'MODERATE' : 'POOR';

    const feasibilityScore: FeasibilityScoreBreakdown = {
      marketDemandScore: demandScore,
      competitionScore: compScore,
      financialViabilityScore: finScore,
      capitalAdequacyScore: capScore,
      riskResilienceScore: riskResScore,
      totalScore,
      grade,
    };

    // 10. AI Recommendation & Action Plan (Generated by the unified assessment)
    // We map the unified output to the existing expected properties
    const aiRecommendation = {
      decision: assessmentResult.viability_score >= 65 ? 'PROCEED' : 'REVIEW',
      viabilityScore: assessmentResult.viability_score,
      summary: assessmentResult.reasoning.map(r => r.claim).join('. '),
      strengths: assessmentResult.swot.strengths,
      weaknesses: assessmentResult.swot.weaknesses,
      recommendedNextStep: `Review the recommended business model: ${assessmentResult.recommended_business_model.name}`,
    };
    
    // We will generate the action plan locally via fallback for now, or you could extend the unified AI for this.
    // To match the existing Node schema without making a second AI call, we use the fallback method natively.
    // @ts-expect-error accessing private method for fallback
    const actionPlan = this.aiClient.fallbackActionPlan({
      businessCategory: category,
      loanAmount: netLoanAmount,
      schemeName: topScheme?.name ?? 'Government Scheme',
    });

    const financialPlan = {
      projectCost: baseProjectCost.projectCost,
      availableCapital: body.availableCapital,
      loanRequired: baseProjectCost.loanAmount,
      marginPercentage: baseProjectCost.marginPercentage,
      matchedSchemeName: topScheme?.name ?? 'PMMY MUDRA Kishore',
      interestRate,
      tenureMonths,
      subsidyAmount,
      netLoanAmount,
      emi: emiResult,
      workingCapital: workingCapitalResult,
      cashflow: cashflowResult,
      breakEven: breakEvenResult,
      stressTest: stressTestResult,
    };

    const overallConfidence: Confidence =
      marketIntel.confidence === 'HIGH' ? Confidence.HIGH : Confidence.MEDIUM;

    const analysisData: FeasibilityAnalysisResult = {
      businessCategory: category,
      businessIdea: body.businessIdea,
      catchment: {
        latitude: lat,
        longitude: lng,
        radiusKm,
      },
      marketIntelligence: marketIntel as unknown as Record<string, unknown>,
      competitorAnalysis: competitorIntel as unknown as Record<string, unknown>,
      opportunityAnalysis: {
        marketGaps: assessmentResult.market_gaps.map(g => g.name),
        potentialNiches: assessmentResult.market_gaps.map(g => g.reason),
        recommendedModel: assessmentResult.recommended_business_model.name,
        opportunityScore: assessmentResult.opportunity_score
      } as unknown as Record<string, unknown>,
      localSuppliers: localSuppliers as unknown as Record<string, unknown>[],
      financialPlan,
      schemeMatches,
      riskAssessment: {
        riskFactors: assessmentResult.risks,
        overallRiskScore: assessmentResult.risk_score,
        riskRating: assessmentResult.risk_score > 65 ? 'HIGH' : 'LOW'
      } as unknown as Record<string, unknown>,
      feasibilityScore,
      actionPlan: actionPlan as unknown as Record<string, unknown>,
      aiRecommendation: aiRecommendation as unknown as Record<string, unknown>,
      status: AnalysisStatus.COMPLETED,
      confidence: overallConfidence,
      createdAt: new Date().toISOString(),
    };

    // 11. If user is logged in, persist to database
    if (userId) {
      const saved = await this.prisma.analysis.create({
        data: {
          userId,
          villageId: body.villageId,
          latitude: lat,
          longitude: lng,
          catchmentRadiusKm: radiusKm,
          businessCategory: category,
          businessIdea: body.businessIdea,
          availableCapital: body.availableCapital,
          businessExperience: body.businessExperience,
          availableLand: body.availableLand,
          availableEquipment: body.availableEquipment,
          expectedWorkingHours: body.expectedWorkingHours,
          marketIntelligence: marketIntel as never,
          competitorAnalysis: competitorIntel as never,
          opportunityAnalysis: {
            marketGaps: assessmentResult.market_gaps.map(g => g.name),
            potentialNiches: assessmentResult.market_gaps.map(g => g.reason),
            recommendedModel: assessmentResult.recommended_business_model.name,
            opportunityScore: assessmentResult.opportunity_score,
            localSuppliers: localSuppliers
          } as never,
          financialPlan: financialPlan as never,
          schemeMatch: schemeMatches as never,
          riskAssessment: {
            riskFactors: assessmentResult.risks,
            overallRiskScore: assessmentResult.risk_score,
            riskRating: assessmentResult.risk_score > 65 ? 'HIGH' : 'LOW'
          } as never,
          feasibilityScore: feasibilityScore as never,
          actionPlan: actionPlan as never,
          aiRecommendation: aiRecommendation as never,
          status: AnalysisStatus.COMPLETED,
          confidence: overallConfidence,
        },
      });

      analysisData.id = saved.id;
    }

    return analysisData;
  }

  /**
   * List past feasibility analyses for the user.
   */
  async listUserAnalyses(userId: string) {
    return this.prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        businessCategory: true,
        businessIdea: true,
        availableCapital: true,
        catchmentRadiusKm: true,
        latitude: true,
        longitude: true,
        status: true,
        confidence: true,
        feasibilityScore: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get complete details of a specific saved analysis.
   */
  async getAnalysisById(id: string, userId?: string) {
    const where: { id: string; userId?: string } = { id };
    if (userId) where.userId = userId;

    const analysis = await this.prisma.analysis.findFirst({ where });
    if (!analysis) {
      throw new NotFoundError(`Analysis with ID ${id} not found`);
    }
    return analysis;
  }
}
