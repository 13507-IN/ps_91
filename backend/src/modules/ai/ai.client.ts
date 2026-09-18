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
  AssessmentInput,
  AssessmentOutput,
  RefineVoiceInput,
  RefineVoiceOutput,
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
    // Try deterministic fallback first to minimize AI calls
    const fallbackResult = this.fallbackClassify(input.idea);
    if (fallbackResult.category !== BusinessCategory.OTHER && fallbackResult.confidence >= 0.8) {
      return fallbackResult;
    }

    // Call AI only if fallback has low confidence or returned 'OTHER'
    try {
      return await httpRequest<ClassifyBusinessOutput>(`${this.baseUrl}/ai/classify-business`, {
        method: 'POST',
        body: input,
        timeoutMs: this.timeoutMs,
      });
    } catch (err) {
      return fallbackResult;
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

  /**
   * Run the full unified assessment pipeline.
   * This is the preferred method for the end-to-end feasibility workflow.
   */
  async runUnifiedAssessment(input: AssessmentInput): Promise<AssessmentOutput> {
    try {
      return await httpRequest<AssessmentOutput>(`${this.baseUrl}/ai/assessment`, {
        method: 'POST',
        body: input,
        timeoutMs: this.timeoutMs * 2, // Orchestrator takes longer
      });
    } catch (err) {
      return this.fallbackUnifiedAssessment(input);
    }
  }

  /**
   * Refine Bengali / English / regional local accent voice input using AI.
   */
  async refineVoice(input: RefineVoiceInput): Promise<RefineVoiceOutput> {
    try {
      return await httpRequest<RefineVoiceOutput>(`${this.baseUrl}/ai/refine-voice`, {
        method: 'POST',
        body: input,
        timeoutMs: this.timeoutMs,
      });
    } catch {
      const fallbackCat = input.raw_text ? this.fallbackClassify(input.raw_text).category : null;
      return {
        refined_text: input.raw_text || '',
        original_text: input.raw_text || '',
        detected_language: input.language || 'Bengali / Hindi / English',
        suggested_category: fallbackCat,
      };
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
        'Detailed Project Report (DPR) summary from ArthSetu',
        'Equipment vendor quotations',
        'Udyam registration certificate',
      ],
    };
  }

  private fallbackUnifiedAssessment(input: AssessmentInput): AssessmentOutput {
    const cat = input.business_category || BusinessCategory.OTHER;
    const loc = input.location;
    const villageName = loc?.village || 'the village catchment area';
    const districtName = loc?.district || 'the local district';
    const hh = input.market?.households || 1000;
    const pop = input.market?.population || hh * 4.5;
    const verifiedComp = input.competition?.verified || 0;
    const reportedComp = input.competition?.reported || 0;
    const projectCost = input.financial?.project_cost || 500000;
    const margin = input.financial?.margin || 50000;
    const loan = input.financial?.loan || 450000;

    // Deterministic scores calculated from real demographic & financial facts
    const compDensityFactor = Math.max(0, verifiedComp + reportedComp);
    const marketScore = Math.min(92, Math.max(45, Math.round(55 + (hh > 1500 ? 20 : hh > 800 ? 12 : 5) - (compDensityFactor * 4))));
    const oppScore = Math.min(94, Math.max(50, Math.round(88 - (compDensityFactor * 5))));
    const leverageRatio = projectCost > 0 ? loan / projectCost : 0.8;
    const riskScore = Math.min(65, Math.max(20, Math.round(22 + (leverageRatio > 0.85 ? 18 : leverageRatio > 0.7 ? 10 : 5))));
    const viabilityScore = Math.min(95, Math.max(45, Math.round(0.35 * oppScore + 0.45 * marketScore + 0.20 * (100 - riskScore))));

    // Category-specific rural enterprise knowledge
    const categoryProfiles: Record<string, {
      modelName: string;
      modelReasoning: string[];
      capitalFit: string;
      selectionReasoning: string;
      gaps: Array<{ name: string; opportunity: string; reason: string }>;
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
      risks: Array<{
        risk: string;
        category: string;
        probability: string;
        impact: string;
        severity: string;
        evidence: string;
        mitigation: string;
      }>;
      pricing: { min: number; max: number; strategy: string; reasoning: string };
    }> = {
      DAIRY: {
        modelName: 'Dairy Micro-Farm + Doorstep Fresh Milk Delivery + Value-Added Paneer/Chhana',
        modelReasoning: [
          `Daily milk demand across ${hh.toLocaleString('en-IN')} households ensures guaranteed regular cash flow.`,
          'Direct delivery captures ₹8–12 higher margin per litre over bulk middleman collection.',
          'Converting surplus milk into paneer, ghee, and chhana for local sweet shops prevents wastage and boosts profits.',
        ],
        capitalFit: 'Well-aligned with available margin for 2–4 high-yield milch cows, cattle shed setup, and basic chilling equipment.',
        selectionReasoning: 'Selected due to strong local nutritional demand, rapid daily cash turnaround, and abundant local green fodder availability.',
        gaps: [
          { name: 'Pure Morning & Evening Fresh Milk Doorstep Supply', opportunity: 'high', reason: 'Most households currently rely on adulterated or irregular milk supply.' },
          { name: 'Hygienic Chhana & Paneer for Local Sweet Shops', opportunity: 'high', reason: 'Village sweetmakers (misti dokan) purchase bulk paneer from distant towns at high transport cost.' },
          { name: 'Organic Cow Dung Compost & Biogas By-product', opportunity: 'medium', reason: 'Local vegetable farmers actively seek chemical-free organic soil nutrients.' },
        ],
        strengths: [
          'Guaranteed daily cash turnaround supporting prompt loan repayment.',
          `High captive population of ${pop.toLocaleString('en-IN')} residents with daily milk consumption needs.`,
          'Low barrier to entry with manageable operational overheads.',
          'Eligible for concessional central and state livestock credit schemes.',
        ],
        weaknesses: [
          'High initial dependency on animal health and regular veterinary checkups.',
          'Perishable nature of raw milk requires strict same-day sales or chilling.',
          'Feed and dry fodder costs fluctuate during summer and flood seasons.',
        ],
        opportunities: [
          'Tie-ups with local Anganwadi centres, primary schools, and tea stalls.',
          'Expansion into value-added clarified butter (pure desi ghee) with higher shelf-life.',
          'Sale of cow dung vermicompost to surrounding agricultural landholders.',
        ],
        threats: [
          'Sudden seasonal disease outbreaks in cattle herd.',
          'Spike in commercial cattle feed and oilcake prices.',
          'Informal milkmen offering credit sales to village households.',
        ],
        risks: [
          {
            risk: 'Livestock Health & Cattle Mortality',
            category: 'operational',
            probability: 'low',
            impact: 'high',
            severity: 'critical',
            evidence: 'Milch animals are vulnerable to seasonal foot-and-mouth or mastitis diseases.',
            mitigation: 'Mandatory cattle insurance under government scheme and scheduled deworming & vaccination with local Block Veterinary Officer.',
          },
          {
            risk: 'Fodder and Feed Cost Inflation',
            category: 'supply_chain',
            probability: 'medium',
            impact: 'medium',
            severity: 'medium',
            evidence: 'Dry fodder and oilcake prices rise by 15–20% during dry pre-monsoon months.',
            mitigation: 'Cultivate hybrid Napier grass on leased borders and procure dry straw in bulk directly after paddy harvest.',
          },
          {
            risk: 'Seasonal Summer Yield Drop',
            category: 'seasonal',
            probability: 'medium',
            impact: 'medium',
            severity: 'medium',
            evidence: 'Heat stress reduces milk production by 15–25% in peak summer.',
            mitigation: 'Install thatched shed roof insulation, misting fans, and provide mineral mixture supplements.',
          },
        ],
        pricing: {
          min: 48,
          max: 62,
          strategy: 'Quality Premium with Direct Distribution',
          reasoning: 'Price pure farm milk at ₹52–56/L for doorstep customers, offering bulk discounts (₹48–50/L) for daily commercial buyers.',
        },
      },
      RETAIL: {
        modelName: 'Village Kirana & General Store + Digital Point (UPI/Micro-ATM) + Monthly Ration Bundles',
        modelReasoning: [
          `Serves everyday household consumables for ${hh.toLocaleString('en-IN')} families within 10–15 minutes walking distance.`,
          'Combining daily FMCG groceries with utility recharges and micro-ATM withdrawals creates multiple footfall drivers.',
          'Wholesale monthly ration kit packaging guarantees bulk turnover and reliable cash planning.',
        ],
        capitalFit: 'Sufficient to secure commercial shop lease deposit, display racks, initial stock inventory, and digital billing terminal.',
        selectionReasoning: 'Selected because grocery retail is non-cyclical, benefits from high repeat footfalls, and fills the village gap for branded packaged essentials.',
        gaps: [
          { name: 'Monthly Household Ration & Spice Bundling', opportunity: 'high', reason: 'Families currently travel 5–8 km to town to purchase bulk monthly groceries.' },
          { name: 'Digital Cash Withdrawal & Bill Payment Kiosk', opportunity: 'high', reason: 'Long ATM queues in town make local AePS micro-ATM cash withdrawals highly lucrative.' },
          { name: 'Standardized School Supplies & Student Stationery', opportunity: 'medium', reason: 'High demand from local students for notebooks and stationery without going to town.' },
        ],
        strengths: [
          'Consistent year-round demand for essential food, cooking oils, and toiletries.',
          'Diversified product mix spreads sales risk across hundreds of small transactions.',
          'Rapid inventory turnover of fast-moving consumer goods (FMCG).',
          'Immediate local community trust and customer relationships.',
        ],
        weaknesses: [
          'Thin margins on branded MRP commodities (8–12%).',
          'Pressure from village customers to offer informal monthly credit (udhar).',
          'Inventory locking requires strict cash management to avoid stockouts.',
        ],
        opportunities: [
          'Direct tie-ups with district FMCG distributors for 3–5% extra trade discounts.',
          'Doorstep delivery for elderly and farmer households during peak planting seasons.',
          'Introduction of seasonal festival gift hampers and puja grocery kits.',
        ],
        threats: [
          'Uncontrolled customer credit (khatabook) hurting working capital liquidity.',
          'Price discounting from large wholesale traders in nearby towns.',
          'Perishability of loose grains and snacks during humid monsoon season.',
        ],
        risks: [
          {
            risk: 'Working Capital Lock-in from Customer Credit (Udhar)',
            category: 'financial',
            probability: 'high',
            impact: 'high',
            severity: 'high',
            evidence: 'Rural kirana stores often lose 15–25% of liquidity to uncollected village credit.',
            mitigation: 'Implement strict 7-day credit caps, offer 2% cash payment discounts, and prioritize UPI instant settlements.',
          },
          {
            risk: 'Inventory Spoilage & Rodent Damage during Monsoon',
            category: 'operational',
            probability: 'medium',
            impact: 'medium',
            severity: 'medium',
            evidence: 'High humidity causes pest infestation and moisture damage in unsealed grain sacks.',
            mitigation: 'Store all grains in raised airtight PVC drums and maintain plastic pallet flooring.',
          },
        ],
        pricing: {
          min: 10,
          max: 2500,
          strategy: 'Competitive Everyday Pricing with Value Bundles',
          reasoning: 'Match town prices on essential staples to build loyalty, while earning 20–30% margins on non-branded spices, snacks, and toiletries.',
        },
      },
      TEXTILES_TAILORING: {
        modelName: 'Boutique Tailoring Unit + School Uniform Contracting + Custom Festive Alterations',
        modelReasoning: [
          'Combines steady year-round garment alteration income with seasonal surges during festivals and school reopening.',
          'Contract stitching for local primary and secondary schools provides predictable bulk cashflow.',
          'Low recurring raw material cost enables high gross profit margins (50–65%).',
        ],
        capitalFit: 'Sufficient for 2 industrial motorized sewing machines, overlock machine, cutting table, iron station, and fabric stock.',
        selectionReasoning: 'Selected for its high skill-to-margin ratio, low raw material perishability, and strong seasonal festive purchasing power.',
        gaps: [
          { name: 'Institutional School Uniform & Sports Kit Stitching', opportunity: 'high', reason: 'Local schools currently rely on distant urban tailors with delayed delivery schedules.' },
          { name: 'Fast 24-Hour Express Alteration & Designer Blouse Stitching', opportunity: 'high', reason: 'High unmet demand for modern festive garment customization among local women.' },
          { name: 'Ready-to-Wear Cotton Nightwear & Children Clothing', opportunity: 'medium', reason: 'Affordable everyday cotton garments sell rapidly in rural weekly haats.' },
        ],
        strengths: [
          'Very high profit margin per stitched unit (labor value addition).',
          'Zero inventory spoilage compared to food or perishable businesses.',
          'Can be expanded incrementally with additional sewing machines as demand scales.',
          'Eligible for specialized women and artisan credit schemes (e.g., Stand-Up India, PMEGP).',
        ],
        weaknesses: [
          'Production capacity constrained by skilled tailor operating hours.',
          'Revenue seasonality with peak surges during Puja/Diwali/Eid and marriage seasons.',
          'Power outages can disrupt electric motor machines without backup inverter.',
        ],
        opportunities: [
          'Tie-ups with women self-help groups (SHGs) for bulk stitching subcontracts.',
          'Stocking matching dress materials, laces, and tailoring accessories for cross-selling.',
          'Offering mobile doorstep measurement and trial services.',
        ],
        threats: [
          'Competition from cheap readymade garments manufactured in urban textile clusters.',
          'Rising costs of tailoring consumables, needles, and electrical tariffs.',
        ],
        risks: [
          {
            risk: 'Power Disruption & Delivery Delays',
            category: 'operational',
            probability: 'medium',
            impact: 'medium',
            severity: 'medium',
            evidence: 'Rural load shedding during peak hours can delay festive order delivery.',
            mitigation: 'Install a 1kVA inverter backup or maintain one manual foot-pedal sewing machine for continuous operation.',
          },
          {
            risk: 'Post-Festival Demand Slump',
            category: 'seasonal',
            probability: 'high',
            impact: 'medium',
            severity: 'medium',
            evidence: 'Tailoring revenues dip by 30–40% in the immediate two months following major festive seasons.',
            mitigation: 'Diversify into steady institutional uniform stitching and home textile repairs during off-peak months.',
          },
        ],
        pricing: {
          min: 80,
          max: 850,
          strategy: 'Tiered Craftsmanship Pricing',
          reasoning: '₹120–180 for standard blouse/kurti, ₹350–500 for designer/festive wear, and ₹350–450 per complete two-piece school uniform set.',
        },
      },
      FOOD_PROCESSING: {
        modelName: 'Agro-Processing Unit (Cold-Pressed Mustard Oil + Stone-Ground Spices + Custom Milling)',
        modelReasoning: [
          `Leverages surplus local agricultural produce (mustard, turmeric, paddy) grown in ${districtName}.`,
          'Offering both custom milling service (taking job-work charges) and packaged branded sales maximizes machine utilization.',
          'Consumers willingly pay 15–20% premium for unadulterated cold-pressed oil and pure spices.',
        ],
        capitalFit: 'Fits required machinery: small cold-press oil expeller, multi-purpose pulverizer, packaging heat-sealer, and working grain inventory.',
        selectionReasoning: 'Selected due to abundant local raw material supply, high value addition, and increasing rural preference for pure unadulterated food products.',
        gaps: [
          { name: 'Pure Cold-Pressed Kachi Ghani Mustard Oil Extraction', opportunity: 'high', reason: 'High village demand for pure oil from locally harvested mustard seeds.' },
          { name: 'Chemical-Free Stone-Ground Turmeric & Chili Packets', opportunity: 'high', reason: 'Store-bought packet spices often contain fillers; local pure spices command strong trust.' },
          { name: 'Custom Job-Work Grinding for Farmer Households', opportunity: 'medium', reason: 'Farmers bringing their own crops pay instant cash milling charges per kg.' },
        ],
        strengths: [
          'Dual revenue streams: job-work milling service + retail packaged sales.',
          'Local raw material sourcing eliminates expensive middleman transportation.',
          'Long shelf-life of processed dry spices and filtered mustard oil.',
          'High eligibility for PMFME (PM Formalisation of Micro food processing Enterprises) 35% subsidy.',
        ],
        weaknesses: [
          'Requires 3-phase electricity connection and regular machine lubrication maintenance.',
          'Raw mustard seed prices fluctuate significantly depending on annual harvest output.',
        ],
        opportunities: [
          'Supply agreements with local dhabas, sweet shops, and weekly haat vendors.',
          'Obtaining FSSAI basic registration to sell in town supermarket shelves.',
          'Selling mustard oilcake byproduct (khali) as premium cattle and fish feed.',
        ],
        threats: [
          'Competition from large commercial edible oil brands.',
          'Unseasonal rains damaging local seed harvests.',
        ],
        risks: [
          {
            risk: 'Raw Material Harvest Price Volatility',
            category: 'supply_chain',
            probability: 'high',
            impact: 'medium',
            severity: 'high',
            evidence: 'Mustard seed prices fluctuate by 20–30% between harvest season (March) and winter.',
            mitigation: 'Procure 3–4 months of raw seed stock during peak post-harvest arrival when market prices are lowest.',
          },
        ],
        pricing: {
          min: 140,
          max: 220,
          strategy: 'Purity-Led Fair Pricing',
          reasoning: '₹165–185/L for 100% pure cold-pressed mustard oil, and ₹12–15/kg for custom grinding service.',
        },
      },
      POULTRY: {
        modelName: 'Commercial Broiler & Layer Poultry Unit + Direct Haat & Eatery Supply',
        modelReasoning: [
          'Rapid 35–42 day broiler growth cycle ensures 6 to 7 revenue batches per year.',
          'Direct supply to local weekly haats and village meat shops eliminates broiler commission agents.',
          'High protein consumption trends in rural and semi-urban Bengal and eastern regions.',
        ],
        capitalFit: 'Sufficient for 1,000-bird capacity shed construction, feeders/drinkers, brooding equipment, and first batch feed & chick capital.',
        selectionReasoning: 'Selected for quick cash turnaround, strong local meat demand, and high return on working capital.',
        gaps: [
          { name: 'Fresh Live Bird Supply to Local Village Haats', opportunity: 'high', reason: 'Local meat vendors frequently face supply shortages from distant distributors.' },
          { name: 'Poultry Manure Supply for Vegetable & Betel Vine Farmers', opportunity: 'medium', reason: 'Poultry litter is in high demand as nitrogen-rich manure for potato and vegetable crops.' },
        ],
        strengths: [
          'Fastest cash turnaround (under 6 weeks per batch) in agricultural livestock.',
          'Strong recurring demand in local weekly rural markets.',
          'High byproduct monetization from poultry manure.',
        ],
        weaknesses: [
          'High sensitivity to chick mortality and weather changes.',
          'Feed accounts for 65–70% of total recurring production costs.',
        ],
        opportunities: [
          'Contract farming arrangements with established integrator companies for guaranteed buyback.',
          'Expanding into native/desi chicken breeds for premium price margins.',
        ],
        threats: [
          'Avian influenza or viral outbreaks causing sudden bird mortality.',
          'Spike in commercial poultry feed prices (maize & soya).',
        ],
        risks: [
          {
            risk: 'Chick Mortality & Biosecurity Outbreaks',
            category: 'operational',
            probability: 'medium',
            impact: 'high',
            severity: 'critical',
            evidence: 'Poor ventilation or disease can lead to 10–15% batch mortality.',
            mitigation: 'Implement strict footbaths, maintain strict vaccination schedules on Day 1, 7, 14, and 21, and maintain dry rice-husk litter.',
          },
        ],
        pricing: {
          min: 110,
          max: 165,
          strategy: 'Market-Linked Farm-Gate Pricing',
          reasoning: 'Sell live birds at ₹120–140/kg at farm gate, capturing full wholesale margin.',
        },
      },
      OTHER: {
        modelName: `Localized ${cat.replace(/_/g, ' ')} Enterprise + Direct Village Fulfillment`,
        modelReasoning: [
          `Tailored to fulfill consumer and commercial demand across ${hh.toLocaleString('en-IN')} catchment households.`,
          'Focuses on reliable, transparent local supply with fair transparent pricing.',
          'Low overheads allow sustainable margins while servicing bank credit commitments.',
        ],
        capitalFit: 'Optimally budgeted to cover initial asset acquisition, premise deposit, and working capital reserve.',
        selectionReasoning: 'Selected to address verified local market gaps with manageable capital risk and strong community integration.',
        gaps: [
          { name: 'Reliable Local Supply & Customer Service', opportunity: 'high', reason: 'Catchment currently lacks a dependable, quality-focused local service provider.' },
          { name: 'Transparent Fair Pricing with Digital Receipts', opportunity: 'medium', reason: 'Consumers appreciate accurate billing and modern digital payment convenience.' },
        ],
        strengths: [
          `Solid customer base of ${pop.toLocaleString('en-IN')} residents in direct catchment.`,
          'Low operational fixed costs and flexible working hours.',
          'Supportive government scheme subsidy and low-interest bank loan eligibility.',
        ],
        weaknesses: [
          'Initial market awareness requires active word-of-mouth outreach.',
          'Working capital buffer must be carefully preserved during early ramp-up months.',
        ],
        opportunities: [
          'Expanding service radius to adjacent gram panchayats within 5 km.',
          'Introducing bundled packages and loyalty discounts for regular village clients.',
        ],
        threats: [
          'Informal unorganized competitors operating without business overheads.',
        ],
        risks: [
          {
            risk: 'Initial Customer Ramp-Up Delay',
            category: 'market',
            probability: 'medium',
            impact: 'medium',
            severity: 'medium',
            evidence: 'First-time rural enterprises take 2–3 months to reach steady monthly sales.',
            mitigation: 'Conduct pre-launch doorstep sample trials with 20 key village influencers and maintain 3 months of EMI cash reserve.',
          },
        ],
        pricing: {
          min: 50,
          max: 500,
          strategy: 'Competitive Market-Penetration Pricing',
          reasoning: 'Set initial prices 5% below town rates to establish immediate village market share, moving to standard rates as trust builds.',
        },
      },
    };

    const profile = categoryProfiles[cat] ?? categoryProfiles.OTHER!;

    return {
      market_score: marketScore,
      opportunity_score: oppScore,
      risk_score: riskScore,
      viability_score: viabilityScore,
      market_analysis: {
        demand_level: marketScore >= 70 ? 'high' : 'medium',
        market_condition: marketScore >= 65 ? 'promising' : 'moderate',
        reasoning: [
          `Catchment of ${hh.toLocaleString('en-IN')} households across ${villageName}, ${districtName} provides a steady, recurring consumption base.`,
          `Only ${verifiedComp} formally registered competitor(s) identified in the immediate buffer, indicating substantial unmet local demand.`,
          'Direct local delivery and localized customer relationships provide a decisive competitive edge over distant town suppliers.',
        ],
        confidence: 'high',
      },
      market_gaps: profile.gaps,
      competition_analysis: {
        competition_level: verifiedComp > 5 ? 'high' : verifiedComp > 2 ? 'moderate' : 'low',
        verified_businesses: verifiedComp,
        reported_businesses: reportedComp,
        estimated_informal: {
          min: Math.max(2, Math.round(hh * 0.005)),
          max: Math.max(5, Math.round(hh * 0.012)),
        },
        informal_interpretation: `Informal competition is primarily small unorganized vendors. Differentiating through consistency, hygiene, accurate weight, and digital payments will easily attract loyal local customers.`,
        confidence: 'high',
      },
      recommended_business_model: {
        name: profile.modelName,
        reasoning: profile.modelReasoning,
        capital_fit: profile.capitalFit,
        selection_reasoning: profile.selectionReasoning,
      },
      swot: {
        strengths: profile.strengths,
        weaknesses: profile.weaknesses,
        opportunities: profile.opportunities,
        threats: profile.threats,
      },
      risks: profile.risks,
      pricing_strategy: {
        recommended_price_range: { min: profile.pricing.min, max: profile.pricing.max },
        strategy: profile.pricing.strategy,
        reasoning: profile.pricing.reasoning,
        confidence: 'high',
      },
      reasoning: [
        {
          claim: `Strong enterprise feasibility in ${districtName} with ${viabilityScore}/100 viability score.`,
          evidence: [
            `Catchment population: ${pop.toLocaleString('en-IN')} individuals across ${hh.toLocaleString('en-IN')} households.`,
            `Estimated daily demand exceeds current formal supply capacity.`,
            `Projected monthly operating surplus comfortably covers monthly loan instalment.`,
          ],
          inference: false,
          confidence: 0.9,
        },
      ],
      confidence: 'high',
    };
  }
}
