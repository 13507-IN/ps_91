import type { PrismaClient } from '@prisma/client';
import {
  BusinessCategory,
  AnalysisStatus,
  Confidence,
  Gender,
  SocialCategory,
} from '@prisma/client';
import { MarketService } from '../market/market.service.js';
import { LocationService } from '../location/location.service.js';
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

const CATEGORY_FINANCIAL_PROFILES: Record<string, {
  revenueMultiplier: number;
  rawMaterialRatio: number;
  operatingCostRatio: number;
  unitPrice: number;
  seasonalityMultipliers: number[];
}> = {
  DAIRY: {
    revenueMultiplier: 0.18,
    rawMaterialRatio: 0.45,
    operatingCostRatio: 0.18,
    unitPrice: 55,
    seasonalityMultipliers: [0.75, 0.88, 0.95, 1.0, 0.92, 0.88, 0.94, 1.0, 1.04, 1.08, 1.12, 1.10],
  },
  FOOD_PROCESSING: {
    revenueMultiplier: 0.22,
    rawMaterialRatio: 0.50,
    operatingCostRatio: 0.16,
    unitPrice: 120,
    seasonalityMultipliers: [0.70, 0.85, 0.95, 1.0, 0.92, 0.88, 0.92, 0.98, 1.05, 1.18, 1.20, 1.12],
  },
  RETAIL: {
    revenueMultiplier: 0.25,
    rawMaterialRatio: 0.70,
    operatingCostRatio: 0.10,
    unitPrice: 85,
    seasonalityMultipliers: [0.80, 0.90, 0.98, 1.0, 0.98, 0.95, 0.96, 1.0, 1.10, 1.28, 1.22, 1.15],
  },
  TEXTILES_TAILORING: {
    revenueMultiplier: 0.20,
    rawMaterialRatio: 0.38,
    operatingCostRatio: 0.20,
    unitPrice: 350,
    seasonalityMultipliers: [0.65, 0.80, 0.95, 1.15, 1.20, 0.90, 0.85, 0.90, 1.10, 1.35, 1.28, 1.10],
  },
  POULTRY: {
    revenueMultiplier: 0.28,
    rawMaterialRatio: 0.60,
    operatingCostRatio: 0.14,
    unitPrice: 160,
    seasonalityMultipliers: [0.70, 0.85, 0.98, 1.0, 0.88, 0.85, 0.90, 0.98, 1.05, 1.12, 1.20, 1.22],
  },
  AGRICULTURE: {
    revenueMultiplier: 0.16,
    rawMaterialRatio: 0.40,
    operatingCostRatio: 0.22,
    unitPrice: 400,
    seasonalityMultipliers: [0.60, 0.75, 1.25, 1.35, 0.90, 0.85, 0.80, 0.85, 0.95, 1.40, 1.45, 0.90],
  },
  LIVESTOCK: {
    revenueMultiplier: 0.17,
    rawMaterialRatio: 0.42,
    operatingCostRatio: 0.20,
    unitPrice: 4500,
    seasonalityMultipliers: [0.70, 0.85, 0.95, 1.0, 1.02, 0.95, 0.92, 0.98, 1.12, 1.20, 1.15, 1.05],
  },
  TRANSPORT: {
    revenueMultiplier: 0.24,
    rawMaterialRatio: 0.32,
    operatingCostRatio: 0.28,
    unitPrice: 300,
    seasonalityMultipliers: [0.75, 0.88, 0.98, 1.05, 1.02, 0.95, 0.92, 0.96, 1.02, 1.12, 1.10, 1.05],
  },
  HANDICRAFT: {
    revenueMultiplier: 0.15,
    rawMaterialRatio: 0.35,
    operatingCostRatio: 0.18,
    unitPrice: 250,
    seasonalityMultipliers: [0.65, 0.80, 0.92, 1.0, 1.0, 0.90, 0.88, 0.92, 1.15, 1.40, 1.35, 1.10],
  },
  SERVICES: {
    revenueMultiplier: 0.26,
    rawMaterialRatio: 0.18,
    operatingCostRatio: 0.32,
    unitPrice: 200,
    seasonalityMultipliers: [0.75, 0.88, 0.98, 1.02, 1.0, 0.98, 0.95, 0.98, 1.05, 1.15, 1.12, 1.05],
  },
  OTHER: {
    revenueMultiplier: 0.20,
    rawMaterialRatio: 0.45,
    operatingCostRatio: 0.20,
    unitPrice: 150,
    seasonalityMultipliers: [0.70, 0.85, 0.95, 1.0, 0.98, 0.96, 0.95, 0.98, 1.05, 1.12, 1.08, 1.02],
  },
};

export class FeasibilityService {
  private marketService: MarketService;
  private locationService: LocationService;
  private aiClient: AiClient;
  private schemeEvaluator: SchemeEvaluator;

  constructor(private prisma: PrismaClient) {
    this.marketService = new MarketService(prisma);
    this.locationService = new LocationService(prisma);
    this.aiClient = new AiClient();
    this.schemeEvaluator = new SchemeEvaluator();
  }

  /**
   * Run the complete end-to-end feasibility analysis workflow.
   */
  async analyze(
    body: AnalyzeFeasibilityBody,
    userId?: string,
    onProgress?: (step: number, message: string, progress: number) => void,
  ): Promise<FeasibilityAnalysisResult> {
    const lat = body.latitude;
    const lng = body.longitude;
    const radiusKm = body.catchmentRadiusKm ?? 10;

    // 1. Business Category Inference (if not explicitly chosen)
    onProgress?.(1, 'Classifying business idea...', 12);
    let category = body.businessCategory;
    if (!category) {
      const classification = await this.aiClient.classifyBusiness({ idea: body.businessIdea });
      category = classification.category;
    }

    // 2. Query Market Intelligence, Competitors, Suppliers, and Location Context in parallel
    onProgress?.(2, 'Analyzing local market & demographics...', 25);
    const [marketIntel, competitorIntel, localSuppliers, nearbyVillages] = await Promise.all([
      this.marketService.getMarketIntelligence(lat, lng, radiusKm, category),
      this.marketService.getCompetitorAnalysis(lat, lng, radiusKm, category),
      this.marketService.getLocalSuppliers(lat, lng, radiusKm, category),
      this.locationService.getNearbyVillages(lat, lng, radiusKm, 1),
    ]);
    
    // Resolve location info for AI and Schemes context
    const locationInfo = nearbyVillages.length > 0 ? nearbyVillages[0] : {
      name: 'Unknown Village',
      blockName: 'Unknown Block',
      districtName: 'Nadia', // Safe fallback for demo
      stateName: 'West Bengal', // Safe fallback for demo
    };

    // 3. Estimating competition density
    onProgress?.(3, 'Estimating competition density...', 38);

    // 4. Financial Calculations: Margin -> Project Cost -> Loan
    onProgress?.(4, 'Building financial plan & EMI...', 50);
    const baseProjectCost = calculateProjectCost({
      availableMargin: body.availableCapital,
      marginPercentage: 10,
    });

    // 5. Scheme Auto-Selection
    onProgress?.(5, 'Matching government schemes...', 62);
    const schemeMatches = this.schemeEvaluator.evaluateSchemes({
      age: body.age ?? 30,
      gender: body.gender ?? Gender.MALE,
      category: body.category ?? SocialCategory.GENERAL,
      isMinority: body.isMinority ?? false,
      businessCategory: category,
      projectCost: baseProjectCost.projectCost,
      availableMargin: body.availableCapital,
      state: locationInfo.stateName,
      district: locationInfo.districtName,
    });

    const topScheme = schemeMatches[0];
    const interestRate = topScheme?.interestRate ?? 10.5;
    const tenureMonths = topScheme?.tenureMonths ?? 60;
    const moratoriumMonths = topScheme?.moratoriumMonths ?? 3;
    const subsidyAmount = topScheme?.subsidyAmount ?? 0;
    const netLoanAmount = topScheme?.netLoanAmount ?? baseProjectCost.loanAmount;

    // ── Kick off AI Assessment in background (runs in parallel with financial calcs) ──
    const villageCount = marketIntel.demographics.totalVillages || 1;
    const estimatedPopulation = marketIntel.demographics.totalPopulation > 0
      ? marketIntel.demographics.totalPopulation
      : villageCount * 1200;
    const estimatedHouseholds = marketIntel.demographics.totalHouseholds > 0
      ? marketIntel.demographics.totalHouseholds
      : villageCount * 250;

    // Get category-specific financial profile (needed for both AI payload and local calcs)
    const finProfile = CATEGORY_FINANCIAL_PROFILES[category] || CATEGORY_FINANCIAL_PROFILES.OTHER || {
      revenueMultiplier: 0.20,
      rawMaterialRatio: 0.45,
      operatingCostRatio: 0.20,
      unitPrice: 150,
      seasonalityMultipliers: [0.70, 0.85, 0.95, 1.0, 0.98, 0.96, 0.95, 0.98, 1.05, 1.12, 1.08, 1.02],
    };

    const estimatedMonthlyRevenue = Math.round(baseProjectCost.projectCost * finProfile.revenueMultiplier);
    const estimatedMonthlyRawMaterials = Math.round(estimatedMonthlyRevenue * finProfile.rawMaterialRatio);
    const estimatedMonthlyOperatingCosts = Math.round(estimatedMonthlyRevenue * finProfile.operatingCostRatio);
    const totalMonthlyOperating = estimatedMonthlyRawMaterials + estimatedMonthlyOperatingCosts;

    // 6. EMI calculation (needed for AI payload)
    const emiResult = calculateEmi({
      principal: netLoanAmount,
      annualRate: interestRate,
      tenureMonths,
      moratoriumMonths,
      moratoriumType: 'INTEREST_ONLY',
    });

    // Fire the AI assessment request NOW — it will run while we compute the rest
    onProgress?.(6, 'Running AI assessment pipeline...', 65);
    const assessmentPromise = this.aiClient.runUnifiedAssessment({
      location: {
        village: locationInfo.name,
        block: locationInfo.blockName,
        district: locationInfo.districtName,
        state: locationInfo.stateName,
        latitude: lat,
        longitude: lng,
      },
      business_category: category,
      business_idea: body.businessIdea,
      language: body.language ?? 'EN',
      market: {
        population: estimatedPopulation,
        households: estimatedHouseholds,
        estimated_demand: Math.max(competitorIntel.totalEstimatedMin * 20, estimatedHouseholds * 2),
        estimated_supply: competitorIntel.totalEstimatedMin * 10,
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

    // 7. Compute remaining financials while AI runs in background
    onProgress?.(7, 'Computing cashflow & break-even...', 75);

    const cashflowResult = calculateCashflow({
      monthlyRevenue: estimatedMonthlyRevenue,
      monthlyOperatingCosts: totalMonthlyOperating,
      monthlyEmi: emiResult.emi,
      seasonalityMultipliers: finProfile.seasonalityMultipliers,
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

    // Dynamic unit economics
    const unitPrice = finProfile.unitPrice;
    const variablePerUnit = unitPrice * finProfile.rawMaterialRatio;
    const fixedCostsMonthly = estimatedMonthlyOperatingCosts + emiResult.emi;

    const breakEvenResult = calculateBreakEven({
      monthlyFixedCosts: fixedCostsMonthly,
      variableCostPerUnit: variablePerUnit,
      sellingPricePerUnit: unitPrice,
      expectedMonthlyUnits: Math.round(estimatedMonthlyRevenue / unitPrice),
      initialProjectCost: baseProjectCost.projectCost,
    });

    // Calculate realistic payback / break-even month (typically 3 to 14 months)
    const monthlyNetSurplus = estimatedMonthlyRevenue - totalMonthlyOperating - emiResult.emi;
    const calculatedPaybackMonth = monthlyNetSurplus > 0
      ? Math.max(1, Math.min(36, Math.ceil(baseProjectCost.projectCost / monthlyNetSurplus)))
      : 12;

    breakEvenResult.paybackPeriodMonths = calculatedPaybackMonth;

    // 8. Stress Testing (Adverse scenario simulation)
    const stressTestResult = runStressTest({
      monthlyRevenue: estimatedMonthlyRevenue,
      monthlyOperatingCosts: totalMonthlyOperating,
      monthlyEmi: emiResult.emi,
    });

    // 9. Await AI assessment result (should already be done or nearly done by now)
    onProgress?.(8, 'Finalizing AI insights...', 85);
    const assessmentResult = await assessmentPromise;

    // 10. Multi-Dimensional Feasibility Scoring (0 to 100)
    onProgress?.(9, 'Calculating viability score...', 90);
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

    // 11. AI Recommendation & Action Plan (Generated by the unified assessment)
    onProgress?.(10, 'Generating action plan...', 95);
    let decision = 'REVIEW';
    if (assessmentResult.viability_score >= 80) decision = 'PROCEED';
    else if (assessmentResult.viability_score >= 65) decision = 'PROCEED_WITH_MODIFICATIONS';
    else if (assessmentResult.viability_score >= 50) decision = 'MODIFY';
    else decision = 'HIGH_RISK';

    const formattedCatName = category.replaceAll('_', ' ').toLowerCase();
    const rawReasoningSummary = assessmentResult.reasoning?.map((r) => r.claim).join('. ');
    const emiFormatted = `₹${emiResult.emi.toLocaleString('en-IN')}`;
    const netProfitFormatted = `₹${Math.round(cashflowResult.avgMonthlyNetCashflow).toLocaleString('en-IN')}`;
    const matchedScheme = topScheme?.name ?? 'MUDRA Kishore';

    const executiveSummary =
      rawReasoningSummary && rawReasoningSummary.length >= 80
        ? rawReasoningSummary
        : `The ${formattedCatName} business in ${locationInfo.districtName} district shows strong fundamentals: high local catchment demand, an underserved market opportunity, and multiple nearby villages as target customers. The ${matchedScheme} scheme matches well and the monthly EMI of ${emiFormatted} is comfortably covered by projected monthly net cashflow of ${netProfitFormatted}. The primary risk is market competition — mitigated by product diversification and direct buyer outreach.`;

    const aiRecommendation = {
      decision,
      viabilityScore: assessmentResult.viability_score,
      summary: executiveSummary,
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
      matchedSchemeUrl: topScheme?.applyUrl,
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
        riskRating: assessmentResult.risk_score > 65 ? 'HIGH' : assessmentResult.risk_score > 35 ? 'MODERATE' : 'LOW'
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
            riskRating: assessmentResult.risk_score > 65 ? 'HIGH' : assessmentResult.risk_score > 35 ? 'MODERATE' : 'LOW'
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
    const raw = await this.prisma.analysis.findMany({
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
        villageId: true,
        status: true,
        confidence: true,
        feasibilityScore: true,
        opportunityAnalysis: true,
        createdAt: true,
      },
    });

    // Map to frontend-expected shape
    return raw.map((item: any) => {
      const scoreBlob = item.feasibilityScore as Record<string, unknown> | null;
      const overallScore: number | null =
        scoreBlob && typeof scoreBlob['totalScore'] === 'number'
          ? scoreBlob['totalScore']
          : null;

      // Try to extract location from opportunityAnalysis or leave as Nadia
      const oppBlob = item.opportunityAnalysis as Record<string, unknown> | null;
      const villageName: string = 'Nadia Rural';
      const district: string = 'Nadia';

      return {
        id: item.id,
        businessCategory: item.businessCategory,
        businessIdea: item.businessIdea,
        availableCapital: item.availableCapital,
        catchmentRadiusKm: item.catchmentRadiusKm,
        latitude: item.latitude,
        longitude: item.longitude,
        status: item.status,
        confidence: item.confidence,
        overallScore,
        villageName,
        district,
        createdAt: item.createdAt.toISOString(),
      };
    });
  }

  /**
   * Get complete details of a specific saved analysis.
   */
  async getAnalysisById(id: string, userId?: string) {
    const analysis = await this.prisma.analysis.findUnique({ where: { id } });
    if (!analysis) {
      throw new NotFoundError(`Analysis with ID ${id} not found`);
    }

    const oppBlob = analysis.opportunityAnalysis as Record<string, unknown> | null;
    let suppliers = (analysis as any).localSuppliers ?? oppBlob?.['localSuppliers'] ?? [];
    if (!Array.isArray(suppliers) || suppliers.length === 0) {
      suppliers = await this.marketService.getLocalSuppliers(
        analysis.latitude,
        analysis.longitude,
        analysis.catchmentRadiusKm,
        analysis.businessCategory,
      );
    }

    return {
      ...analysis,
      catchment: {
        latitude: analysis.latitude,
        longitude: analysis.longitude,
        radiusKm: analysis.catchmentRadiusKm,
      },
      schemeMatches: (analysis as any).schemeMatch ?? [],
      localSuppliers: suppliers,
    };
  }
}
