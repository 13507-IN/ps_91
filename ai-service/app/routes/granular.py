"""
UdyamSetu AI — Granular Endpoint Routes.

Individual endpoints matching the existing Node.js AiClient contract:
  POST /ai/classify-business
  POST /ai/demand-estimate
  POST /ai/opportunity-discover
  POST /ai/risk-assess
  POST /ai/recommend
  POST /ai/action-plan
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
import structlog

from app.schemas.input import (
    BusinessCategory,
    ClassifyBusinessInput,
    DemandEstimateInput,
    OpportunityDiscoveryInput,
    RiskAssessmentInput,
    RecommendationInput,
    ActionPlanInput,
)
from app.schemas.output import (
    ClassifyBusinessOutput,
    DemandEstimateOutput,
    OpportunityDiscoveryOutput,
    RiskAssessmentOutput,
    RiskFactorGranular,
    RecommendationOutput,
    ActionPlanOutput,
    ActionMilestone,
)

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/ai", tags=["AI Granular Endpoints"])


# ── Keyword mapping for classify ───────────────────────────────────────

_KEYWORD_MAP = {
    "DAIRY": r"milk|cow|buffalo|dairy|paneer|ghee|butter|curd|chhana",
    "FOOD_PROCESSING": r"atta|flour|rice|paddy|mustard|oil|spice|pickle|snack|bakery|mill|food",
    "TEXTILES_TAILORING": r"tailor|cloth|garment|dress|boutique|sewing|stitch|fabric",
    "POULTRY": r"poultry|chicken|egg|broiler|duck|bird|meat",
    "RETAIL": r"kirana|grocery|store|shop|retail|stationery|fertilizer",
    "TRANSPORT": r"auto|rickshaw|transport|van|cargo|delivery|logistics",
    "HANDICRAFT": r"pottery|clay|jute|bamboo|handicraft|artisan|handloom",
    "SERVICES": r"mobile|repair|mechanic|computer|csc|cyber|salon|service",
    "AGRICULTURE": r"farm|seed|nursery|organic|crop|harvest|tractor|irrigation",
    "LIVESTOCK": r"goat|sheep|cattle|pig|animal|feed|veterinary",
}


@router.post("/classify-business", response_model=ClassifyBusinessOutput)
async def classify_business(body: ClassifyBusinessInput) -> ClassifyBusinessOutput:
    """Classify free-text business idea into category."""
    import re

    text = body.idea.lower()
    for cat, pattern in _KEYWORD_MAP.items():
        if re.search(pattern, text):
            subcategories = {
                "DAIRY": "Dairy & Milk Products",
                "FOOD_PROCESSING": "Agro & Food Processing",
                "TEXTILES_TAILORING": "Tailoring & Garments",
                "POULTRY": "Poultry Farming",
                "RETAIL": "Retail & Consumer Goods",
                "TRANSPORT": "Rural Logistics",
                "HANDICRAFT": "Artisan Handicrafts",
                "SERVICES": "Personal & Technical Services",
                "AGRICULTURE": "Agriculture & Farm Services",
                "LIVESTOCK": "Livestock & Animal Husbandry",
            }
            return ClassifyBusinessOutput(
                category=cat,
                subcategory=subcategories.get(cat, "General"),
                confidence=0.88,
                reasoning=f"Keywords in '{body.idea}' match {cat.lower().replace('_', ' ')} category.",
            )

    return ClassifyBusinessOutput(
        category="OTHER",
        subcategory="General Rural Enterprise",
        confidence=0.6,
        reasoning="No specific category keywords matched. Classified as general enterprise.",
    )


@router.post("/demand-estimate", response_model=DemandEstimateOutput)
async def demand_estimate(body: DemandEstimateInput) -> DemandEstimateOutput:
    """Estimate local demand for a business category."""
    hh = body.totalHouseholds or 1000

    # Per-household daily consumption benchmarks
    benchmarks: dict[str, tuple[float, str]] = {
        "DAIRY": (1.5, "Litres of Milk"),
        "FOOD_PROCESSING": (0.8, "Kg Processed Staples"),
        "RETAIL": (150.0, "₹ Daily Retail Volume"),
        "TEXTILES_TAILORING": (0.02, "Stitched Garments"),
        "POULTRY": (0.3, "Kg Dressed Chicken / Eggs"),
        "AGRICULTURE": (20.0, "₹ Agricultural Input"),
        "LIVESTOCK": (0.5, "Standard Units"),
        "TRANSPORT": (0.1, "Trips"),
        "HANDICRAFT": (0.01, "Craft Units"),
        "SERVICES": (0.05, "Service Calls"),
    }

    daily_per_hh, unit = benchmarks.get(body.businessCategory.value, (50.0, "Standard Units"))
    daily = round(hh * daily_per_hh)
    annual = daily * 365

    return DemandEstimateOutput(
        estimatedAnnualDemandUnits=annual,
        estimatedDailyDemandUnits=daily,
        unit=unit,
        confidence="MEDIUM",
        keyDrivers=[
            "Local household count in catchment area",
            "Standard rural daily consumption benchmarks",
            "Proximity to local panchayat hat/market centres",
        ],
    )


@router.post("/opportunity-discover", response_model=OpportunityDiscoveryOutput)
async def opportunity_discover(body: OpportunityDiscoveryInput) -> OpportunityDiscoveryOutput:
    """Identify market gaps and niches."""
    _GAPS: dict[str, list[str]] = {
        "DAIRY": [
            "Direct morning & evening doorstep fresh milk delivery",
            "Hygienic vacuum-packaged paneer and chhana production",
            "Supply tie-up with local tea stalls and sweet shops",
        ],
        "FOOD_PROCESSING": [
            "Custom mustard oil cold-pressing with customer grain",
            "Hygienic stone-ground turmeric and coriander packets",
            "Value-added puffed rice and roasted snacks packaging",
        ],
        "RETAIL": [
            "Phone/WhatsApp delivery service for elderly households",
            "Quality-certified seeds and organic pest repellent hub",
            "Bundled monthly household grocery kits at wholesale parity",
        ],
        "TEXTILES_TAILORING": [
            "Contract school uniform stitching for local schools",
            "Fast-turnaround boutique blouse and festive alterations",
            "Ready-to-wear local cotton nightwear and kids clothing",
        ],
        "POULTRY": [
            "Fresh farm-gate broiler supply to local weekly haats",
            "Free-range brown egg premium packaging",
            "Dry poultry litter packaging for local cultivators",
        ],
    }

    cat = body.businessCategory.value
    niches = _GAPS.get(cat, [
        "Quality standardization over informal vendors",
        "Timely door-to-door customer fulfillment",
        "Credit-linked bulk purchase discounts",
    ])

    comp_score = max(20, 100 - body.existingCompetitors * 8)
    demand_score = 80 if body.estimatedDemandUnits > 0 else 50
    opp_score = min(95, max(35, round(comp_score * 0.5 + demand_score * 0.5)))

    return OpportunityDiscoveryOutput(
        marketGaps=niches,
        potentialNiches=niches[:2],
        recommendedModel=f"Hybrid {cat.replace('_', ' ').title()} + Value-Add Service",
        opportunityScore=opp_score,
    )


@router.post("/risk-assess", response_model=RiskAssessmentOutput)
async def risk_assess(body: RiskAssessmentInput) -> RiskAssessmentOutput:
    """Risk evaluation and mitigation."""
    emi_ratio = (body.monthlyEmi * 12) / max(body.projectCost, 1)

    risk_factors = [
        RiskFactorGranular(
            name="Input Price Volatility",
            probability="MEDIUM",
            impact="HIGH",
            mitigation="Establish direct agreements with primary cultivators or wholesale mandis.",
        ),
        RiskFactorGranular(
            name="Seasonal Demand Variations",
            probability="HIGH",
            impact="MEDIUM",
            mitigation="Maintain 45 days working capital buffer during monsoon and post-harvest dips.",
        ),
        RiskFactorGranular(
            name="Informal Competitor Price Undercutting",
            probability="MEDIUM",
            impact="MEDIUM",
            mitigation="Focus on purity, accurate weight, and consistent availability over price alone.",
        ),
    ]

    score = 32
    if emi_ratio > 0.25:
        score += 20
    if body.loanAmount > 500000:
        score += 10

    rating = "HIGH" if score > 65 else ("MODERATE" if score > 40 else "LOW")

    return RiskAssessmentOutput(
        riskFactors=risk_factors,
        overallRiskScore=min(90, score),
        riskRating=rating,
    )


@router.post("/recommend", response_model=RecommendationOutput)
async def recommend(body: RecommendationInput) -> RecommendationOutput:
    """Generate business recommendation."""
    viability = round(
        0.35 * body.opportunityScore
        + 0.45 * body.financialViabilityScore
        + 0.20 * (100 - body.riskScore)
    )

    if viability >= 78:
        decision = "PROCEED"
    elif viability >= 62:
        decision = "PROCEED_WITH_MODIFICATIONS"
    elif viability >= 45:
        decision = "MODIFY"
    else:
        decision = "HIGH_RISK"

    cat_display = body.businessCategory.value.replace("_", " ").title()

    return RecommendationOutput(
        decision=decision,
        viabilityScore=min(100, max(0, viability)),
        summary=(
            f"Enterprise proposal for {cat_display} achieves a viability score of {viability}/100. "
            f"{f'Recommended funding route is {body.matchedScheme}.' if body.matchedScheme else 'Eligible for standard micro-credit schemes.'}"
        ),
        strengths=[
            "Strong localized demand base in catchment area",
            "Manageable debt-service commitment under eligible government scheme",
            "Viable margin contribution from entrepreneur own capital",
        ],
        weaknesses=[
            "Informal competitors present in nearby gram panchayat hats",
            "Seasonal raw material price spikes require strict working capital discipline",
        ],
        recommendedNextStep="Validate initial buyer demand with 15 local customers and obtain machinery quotation.",
    )


@router.post("/action-plan", response_model=ActionPlanOutput)
async def action_plan(body: ActionPlanInput) -> ActionPlanOutput:
    """Generate 30-day action plan."""
    scheme = body.schemeName or "eligible government scheme"

    return ActionPlanOutput(
        planDurationDays=30,
        milestones=[
            ActionMilestone(
                phase="Phase 1: Demand & Supplier Validation",
                dayRange="Days 1–7",
                tasks=[
                    "Visit 20 prospective local households / buyers to validate purchase intent",
                    "Identify at least two local raw material suppliers and compare prices",
                    "Select exact business premises / workshop location with reliable electricity",
                ],
            ),
            ActionMilestone(
                phase="Phase 2: Equipment Quotations & Working Capital",
                dayRange="Days 8–15",
                tasks=[
                    "Collect 2 written vendor quotations for essential machinery and tools",
                    "Finalize working capital buffer reserve in entrepreneur bank account",
                    "Complete Udyam registration online (free self-declaration)",
                ],
            ),
            ActionMilestone(
                phase="Phase 3: Scheme Application & Document Prep",
                dayRange="Days 16–23",
                tasks=[
                    f"Submit application dossier under {scheme}",
                    "Compile Aadhaar, PAN, Bank Statements (6 months), and Panchayat NOC",
                    "Meet local bank branch manager / CSC operator for preliminary document review",
                ],
            ),
            ActionMilestone(
                phase="Phase 4: Site Setup & Trial Production",
                dayRange="Days 24–30",
                tasks=[
                    "Install machinery and arrange trial batch run",
                    "Distribute free sample trial to first 10 seed customers for feedback",
                    "Open dedicated business current account for institutional transactions",
                ],
            ),
        ],
        fundingReadinessChecklist=[
            "Aadhaar card linked with active mobile number",
            "PAN card",
            "Bank passbook / 6 months bank statement",
            "Caste/Category certificate (if SC/ST/OBC/Minority concession claimed)",
            "Detailed Project Report (DPR) summary from UdyamSetu",
            "Equipment vendor quotations",
            "Udyam registration certificate",
        ],
    )
