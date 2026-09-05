import { getEnv } from '../../config/env.js';
import { httpRequest, HttpClientError } from '../../lib/httpClient.js';
import type {
  ClassifyBusinessInput,
  ClassifyBusinessOutput,
  DemandEstimateInput,
  DemandEstimateOutput,
  OpportunityDiscoveryInput,
  OpportunityDiscoveryOutput,
  RiskAssessmentInput,
  RiskAssessmentOutput,
  RecommendationInput,
  RecommendationOutput,
  ActionPlanInput,
  ActionPlanOutput,
} from './ai.schema.js';
import { BusinessCategory } from '@prisma/client';

export class AiClient {
  private baseUrl: string;
  private timeoutMs: number;

  constructor() {
    const env = getEnv();
    this.baseUrl = env.AI_SERVICE_URL;
    this.timeoutMs = env.AI_SERVICE_TIMEOUT_MS;
  }

  /**
   * Classify user free-text business idea into BusinessCategory and subcategory.
   */
  async classifyBusiness(input: ClassifyBusinessInput): Promise<ClassifyBusinessOutput> {
    try {
      return await httpRequest<ClassifyBusinessOutput>(`${this.baseUrl}/ai/classify-business`, {
        method: 'POST',
        body: input,
        timeoutMs: this.timeoutMs,
      });
    } catch (err) {
      // Graceful fallback: Keyword-based deterministic classification
      return this.fallbackClassify(input.idea);
    }
  }

  /**
   * Estimate local demand in the catchment area.
   */
  async estimateDemand(input: DemandEstimateInput): Promise<DemandEstimateOutput> {
    try {
      return await httpRequest<DemandEstimateOutput>(`${this.baseUrl}/ai/demand-estimate`, {
        method: 'POST',
        body: input,
        timeoutMs: this.timeoutMs,
      });
    } catch {
      return this.fallbackDemandEstimate(input);
    }
  }

  /**
   * Discover market gaps, niches, and recommended business models.
   */
  async discoverOpportunities(
    input: OpportunityDiscoveryInput,
  ): Promise<OpportunityDiscoveryOutput> {
    try {
      return await httpRequest<OpportunityDiscoveryOutput>(
        `${this.baseUrl}/ai/opportunity-discover`,
        {
          method: 'POST',
          body: input,
          timeoutMs: this.timeoutMs,
        },
      );
    } catch {
      return this.fallbackOpportunityDiscovery(input);
    }
  }

  /**
   * Assess business and financial risks.
   */
  async assessRisk(input: RiskAssessmentInput): Promise<RiskAssessmentOutput> {
    try {
      return await httpRequest<RiskAssessmentOutput>(`${this.baseUrl}/ai/risk-assess`, {
        method: 'POST',
        body: input,
        timeoutMs: this.timeoutMs,
      });
    } catch {
      return this.fallbackRiskAssess(input);
    }
  }

  /**
   * Generate final structured recommendation with explainable reasons.
   */
  async generateRecommendation(input: RecommendationInput): Promise<RecommendationOutput> {
    try {
      return await httpRequest<RecommendationOutput>(`${this.baseUrl}/ai/recommend`, {
        method: 'POST',
        body: input,
        timeoutMs: this.timeoutMs,
      });
    } catch {
      return this.fallbackRecommendation(input);
    }
  }

  /**
   * Generate 30-day funding readiness and execution roadmap.
   */
  async generateActionPlan(input: ActionPlanInput): Promise<ActionPlanOutput> {
    try {
      return await httpRequest<ActionPlanOutput>(`${this.baseUrl}/ai/action-plan`, {
        method: 'POST',
        body: input,
        timeoutMs: this.timeoutMs,
      });
    } catch {
      return this.fallbackActionPlan(input);
    }
  }

  // ============================================================
  // Deterministic Fallback Implementations
  // ============================================================

  private fallbackClassify(idea: string): ClassifyBusinessOutput {
    const text = idea.toLowerCase();

    if (/milk|cow|buffalo|dairy|paneer|ghee|butter|curd|chhana/.test(text)) {
      return {
        category: BusinessCategory.DAIRY,
        subcategory: 'Dairy & Milk Products',
        confidence: 0.9,
        reasoning: 'Keywords match dairy and livestock milk production.',
      };
    }
    if (/atta|flour|rice|paddy|mustard|oil|spice|pickle|snack|bakery|mill|food/.test(text)) {
      return {
        category: BusinessCategory.FOOD_PROCESSING,
        subcategory: 'Agro & Food Processing',
        confidence: 0.88,
        reasoning: 'Keywords relate to food transformation, milling, or packaging.',
      };
    }
    if (/tailor|cloth|garment|dress|boutique|sewing|stitch|fabric/.test(text)) {
      return {
        category: BusinessCategory.TEXTILES_TAILORING,
        subcategory: 'Tailoring & Garments',
        confidence: 0.92,
        reasoning: 'Keywords match garment manufacturing, stitching, or textile boutique.',
      };
    }
    if (/poultry|chicken|egg|broiler|duck|bird|meat/.test(text)) {
      return {
        category: BusinessCategory.POULTRY,
        subcategory: 'Poultry Farming',
        confidence: 0.9,
        reasoning: 'Keywords indicate poultry or avian livestock enterprise.',
      };
    }
    if (/kirana|grocery|store|shop|retail|stationery|fertilizer/.test(text)) {
      return {
        category: BusinessCategory.RETAIL,
        subcategory: 'Retail & Consumer Goods',
        confidence: 0.85,
        reasoning: 'Keywords indicate local retail or convenience merchant shop.',
      };
    }
    if (/auto|rickshaw|transport|van|cargo|delivery|logistics/.test(text)) {
      return {
        category: BusinessCategory.TRANSPORT,
        subcategory: 'Rural Logistics',
        confidence: 0.85,
        reasoning: 'Keywords indicate passenger or freight transport enterprise.',
      };
    }
    if (/pottery|clay|jute|bamboo|handicraft|artisan|handloom/.test(text)) {
      return {
        category: BusinessCategory.HANDICRAFT,
        subcategory: 'Artisan Handicrafts',
        confidence: 0.87,
        reasoning: 'Keywords match traditional rural crafts or cottage production.',
      };
    }
    if (/mobile|repair|mechanic|computer|csc|cyber|salon|service/.test(text)) {
      return {
        category: BusinessCategory.SERVICES,
        subcategory: 'Personal & Technical Services',
        confidence: 0.85,
        reasoning: 'Keywords indicate community service or technical maintenance.',
      };
    }

    return {
      category: BusinessCategory.OTHER,
      subcategory: 'General Rural Enterprise',
      confidence: 0.6,
      reasoning: 'General enterprise idea evaluated under standard rural criteria.',
    };
  }

  private fallbackDemandEstimate(input: DemandEstimateInput): DemandEstimateOutput {
    const hh = input.totalHouseholds || 1000;
    let dailyPerHh = 1.2;
    let unit = 'Litres';

    switch (input.businessCategory) {
      case BusinessCategory.DAIRY:
        dailyPerHh = 1.5;
        unit = 'Litres of Milk';
        break;
      case BusinessCategory.FOOD_PROCESSING:
        dailyPerHh = 0.8;
        unit = 'Kg Processed Staples';
        break;
      case BusinessCategory.RETAIL:
        dailyPerHh = 150;
        unit = '₹ Daily Retail Volume';
        break;
      case BusinessCategory.TEXTILES_TAILORING:
        dailyPerHh = 0.02;
        unit = 'Stitched Garments';
        break;
      case BusinessCategory.POULTRY:
        dailyPerHh = 0.3;
        unit = 'Kg Dressed Chicken / Eggs';
        break;
      default:
        dailyPerHh = 50;
        unit = 'Standard Units';
    }

    const dailyUnits = Math.round(hh * dailyPerHh);
    const annualUnits = dailyUnits * 365;

    return {
      estimatedAnnualDemandUnits: annualUnits,
      estimatedDailyDemandUnits: dailyUnits,
      unit,
      confidence: 'MEDIUM',
      keyDrivers: [
        'Local household count in catchment area',
        'Standard rural daily consumption benchmarks',
        'Proximity to local panchayat hat/market centres',
      ],
    };
  }

  private fallbackOpportunityDiscovery(
    input: OpportunityDiscoveryInput,
  ): OpportunityDiscoveryOutput {
    const gaps: Record<string, string[]> = {
      DAIRY: [
        'Direct morning & evening doorstep fresh milk delivery',
        'Hygienic vacuum-packaged paneer and chhana production',
        'Supply tie-up with local tea stalls and sweet shops (misti dokan)',
      ],
      FOOD_PROCESSING: [
        'Custom mustard oil cold-pressing with customer grain',
        'Hygienic stone-ground turmeric and coriander packets',
        'Value-added puffed rice (muri) and roasted snacks packaging',
      ],
      RETAIL: [
        'Phone/WhatsApp delivery service for elderly and busy households',
        'Quality-certified seeds, micro-nutrients and organic pest repellent hub',
        'Bundled monthly household grocery kits at wholesale parity',
      ],
      TEXTILES_TAILORING: [
        'Contract school uniform stitching for local primary and high schools',
        'Fast-turnaround boutique blouse and festive saree alterations',
        'Ready-to-wear local cotton nightwear and kids clothing',
      ],
      POULTRY: [
        'Fresh farm-gate broiler supply to local weekly haats',
        'Free-range brown egg (desi anda) premium packaging',
        'Dry poultry litter packaging for local vegetable cultivators',
      ],
    };

    const niches = gaps[input.businessCategory] ?? [
      'Quality standardization over informal vendors',
      'Timely door-to-door customer fulfillment',
      'Credit-linked bulk purchase discounts',
    ];

    const compScore = Math.max(20, 100 - input.existingCompetitors * 8);
    const demandScore = input.estimatedDemandUnits > 0 ? 80 : 50;
    const oppScore = Math.round(compScore * 0.5 + demandScore * 0.5);

    return {
      marketGaps: niches,
      potentialNiches: niches.slice(0, 2),
      recommendedModel: `Hybrid ${input.businessCategory.replace('_', ' ')} + Value-Add Service`,
      opportunityScore: Math.min(95, Math.max(35, oppScore)),
    };
  }

  private fallbackRiskAssess(input: RiskAssessmentInput): RiskAssessmentOutput {
    const emiRatio = input.projectCost > 0 ? (input.monthlyEmi * 12) / input.projectCost : 0.15;

    const riskFactors = [
      {
        name: 'Input Price Volatility',
        probability: 'MEDIUM' as const,
        impact: 'HIGH' as const,
        mitigation: 'Establish direct agreements with primary cultivators or wholesale mandis.',
      },
      {
        name: 'Seasonal Demand Variations',
        probability: 'HIGH' as const,
        impact: 'MEDIUM' as const,
        mitigation: 'Maintain 45 days working capital buffer during monsoon and post-harvest dips.',
      },
      {
        name: 'Informal Competitor Price Undercutting',
        probability: 'MEDIUM' as const,
        impact: 'MEDIUM' as const,
        mitigation: 'Focus on purity, accurate weight, and consistent availability over price alone.',
      },
    ];

    let overallRiskScore = 32;
    if (emiRatio > 0.25) overallRiskScore += 20;
    if (input.loanAmount > 500000) overallRiskScore += 10;

    return {
      riskFactors,
      overallRiskScore: Math.min(90, overallRiskScore),
      riskRating: overallRiskScore > 65 ? 'HIGH' : overallRiskScore > 40 ? 'MODERATE' : 'LOW',
    };
  }

  private fallbackRecommendation(input: RecommendationInput): RecommendationOutput {
    // Viability Score = (0.35 * Opportunity) + (0.45 * Financial) + (0.20 * (100 - Risk))
    const viability = Math.round(
      0.35 * input.opportunityScore +
        0.45 * input.financialViabilityScore +
        0.2 * (100 - input.riskScore),
    );

    let decision: 'PROCEED' | 'PROCEED_WITH_MODIFICATIONS' | 'MODIFY' | 'HIGH_RISK' =
      'PROCEED_WITH_MODIFICATIONS';
    if (viability >= 78) decision = 'PROCEED';
    else if (viability >= 62) decision = 'PROCEED_WITH_MODIFICATIONS';
    else if (viability >= 45) decision = 'MODIFY';
    else decision = 'HIGH_RISK';

    return {
      decision,
      viabilityScore: viability,
      summary: `Enterprise proposal for ${input.businessCategory.replace('_', ' ')} achieves a viability score of ${viability}/100. ${input.matchedScheme ? `Recommended funding route is ${input.matchedScheme}.` : 'Eligible for standard micro-credit schemes.'}`,
      strengths: [
        'Strong localized demand base in catchment area',
        'Manageable debt-service commitment under eligible government scheme',
        'Viable margin contribution from entrepreneur own capital',
      ],
      weaknesses: [
        'Informal competitors present in nearby gram panchayat hats',
        'Seasonal raw material price spikes require strict working capital discipline',
      ],
      recommendedNextStep:
        'Validate initial buyer demand with 15 local customers and obtain machinery quotation.',
    };
  }

  private fallbackActionPlan(input: ActionPlanInput): ActionPlanOutput {
    return {
      planDurationDays: 30,
      milestones: [
        {
          phase: 'Phase 1: Demand & Supplier Validation',
          dayRange: 'Days 1–7',
          tasks: [
            'Visit 20 prospective local households / buyers to validate purchase intent',
            'Identify at least two local raw material suppliers and compare prices',
            'Select exact business premises / workshop location with reliable electricity',
          ],
        },
        {
          phase: 'Phase 2: Equipment Quotations & Working Capital',
          dayRange: 'Days 8–15',
          tasks: [
            'Collect 2 written vendor quotations for essential machinery and tools',
            'Finalize working capital buffer reserve in entrepreneur bank account',
            'Complete Udyam registration online (free self-declaration)',
          ],
        },
        {
          phase: 'Phase 3: Scheme Application & Document Prep',
          dayRange: 'Days 16–23',
          tasks: [
            `Submit application dossier under ${input.schemeName ?? 'eligible government scheme'}`,
            'Compile Aadhaar, PAN, Bank Statements (6 months), and Panchayat NOC',
            'Meet local bank branch manager / CSC operator for preliminary document review',
          ],
        },
        {
          phase: 'Phase 4: Site Setup & Trial Production',
          dayRange: 'Days 24–30',
          tasks: [
            'Install machinery and arrange trial batch run',
            'Distribute free sample trial to first 10 seed customers for feedback',
            'Open dedicated business current account for institutional transactions',
          ],
        },
      ],
      fundingReadinessChecklist: [
        'Aadhaar card linked with active mobile number',
        'PAN card',
        'Bank passbook / 6 months bank statement',
        'Caste/Category certificate (if SC/ST/OBC/Minority concession claimed)',
        'Detailed Project Report (DPR) summary from UdyamSetu',
        'Equipment vendor quotations',
        'Udyam registration certificate',
      ],
    };
  }
}
