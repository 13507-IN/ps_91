"""
UdyamSetu AI — Risk Analysis Agent.
"""

from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field

from app.agents.base import BaseAgent
from app.schemas.input import AssessmentInput, BusinessCategory


class RiskItem(BaseModel):
    risk: str
    category: str
    probability: str
    impact: str
    severity: str
    evidence: str
    mitigation: str


class RiskAnalysisResult(BaseModel):
    risks: list[RiskItem] = Field(..., min_length=1)


# Category-specific default risks
_DEFAULT_RISKS: dict[str, list[dict]] = {
    "DAIRY": [
        {"risk": "Feed and fodder price volatility", "category": "supply_chain", "probability": "high", "impact": "high", "severity": "high", "evidence": "Feed constitutes 50-60% of dairy operating costs in rural India.", "mitigation": "Establish agreements with 2-3 local fodder suppliers and maintain a 30-day fodder buffer stock."},
        {"risk": "Milk perishability without cold chain", "category": "operational", "probability": "medium", "impact": "high", "severity": "high", "evidence": "Milk spoils within 2-4 hours without chilling in warm climates.", "mitigation": "Invest in a small milk chiller or plan twice-daily collection and immediate sale cycles."},
        {"risk": "Seasonal supply variation", "category": "seasonal", "probability": "high", "impact": "medium", "severity": "medium", "evidence": "Lean season (Apr-Jul) typically reduces milk supply by 20-30%.", "mitigation": "Build customer relationships during flush season; diversify into value-added products (paneer, curd) to absorb surplus."},
        {"risk": "Informal competitor price undercutting", "category": "competition", "probability": "medium", "impact": "medium", "severity": "medium", "evidence": "Informal milk sellers often have zero overhead and undercut formal pricing.", "mitigation": "Differentiate on quality, hygiene, and reliability rather than competing on price alone."},
    ],
    "FOOD_PROCESSING": [
        {"risk": "Raw material price linked to harvest cycles", "category": "supply_chain", "probability": "high", "impact": "high", "severity": "high", "evidence": "Crop prices fluctuate 30-50% between harvest and off-season.", "mitigation": "Procure raw materials in bulk during post-harvest period; maintain 45-day inventory buffer."},
        {"risk": "Power supply disruption", "category": "infrastructure", "probability": "medium", "impact": "high", "severity": "high", "evidence": "Rural power supply averages 16-18 hours daily with frequent outages.", "mitigation": "Budget for a backup generator or inverter setup for critical equipment."},
        {"risk": "Food safety compliance requirements", "category": "regulatory", "probability": "medium", "impact": "medium", "severity": "medium", "evidence": "FSSAI registration is mandatory for food processing businesses.", "mitigation": "Obtain basic FSSAI registration early; maintain hygiene records for audit readiness."},
        {"risk": "Competition from branded products", "category": "competition", "probability": "medium", "impact": "medium", "severity": "medium", "evidence": "Urban FMCG brands are expanding rural distribution.", "mitigation": "Focus on freshness, local taste preferences, and custom processing that brands cannot match."},
    ],
    "RETAIL": [
        {"risk": "Working capital strain from credit sales", "category": "financial", "probability": "high", "impact": "high", "severity": "high", "evidence": "Rural kirana stores typically extend 15-30 day credit to regular customers.", "mitigation": "Limit credit to 30% of sales; maintain a credit register and enforce 15-day collection cycles."},
        {"risk": "Inventory spoilage for perishable goods", "category": "operational", "probability": "medium", "impact": "medium", "severity": "medium", "evidence": "Fresh produce spoilage can reach 10-15% without proper storage.", "mitigation": "Start with non-perishable inventory; add perishables only after demand pattern is established."},
        {"risk": "Thin margins on MRP products", "category": "financial", "probability": "high", "impact": "medium", "severity": "medium", "evidence": "FMCG products have fixed MRP with 8-15% retailer margin.", "mitigation": "Diversify into higher-margin items (fresh produce, agricultural inputs) alongside FMCG staples."},
        {"risk": "Competition from nearby town markets", "category": "competition", "probability": "medium", "impact": "medium", "severity": "medium", "evidence": "Weekly haats and town markets offer wider selection.", "mitigation": "Offer convenience (proximity, delivery, credit) as key differentiators."},
    ],
    "TEXTILES_TAILORING": [
        {"risk": "Seasonal demand concentration", "category": "seasonal", "probability": "high", "impact": "high", "severity": "high", "evidence": "60-70% of tailoring revenue concentrates in wedding and festival seasons.", "mitigation": "Secure school uniform contracts for baseline revenue; offer alteration services year-round."},
        {"risk": "Single-person skill dependency", "category": "operational", "probability": "medium", "impact": "high", "severity": "high", "evidence": "Business depends entirely on the tailor's health and availability.", "mitigation": "Train a family member or assistant as backup; build a 2-week order buffer during peak season."},
        {"risk": "Competition from readymade garments", "category": "competition", "probability": "high", "impact": "medium", "severity": "medium", "evidence": "Readymade garment availability is increasing in rural markets.", "mitigation": "Focus on custom fit, alteration services, and traditional garments that readymade cannot match."},
    ],
    "POULTRY": [
        {"risk": "Disease outbreak (Bird flu, Newcastle)", "category": "operational", "probability": "medium", "impact": "high", "severity": "critical", "evidence": "Poultry diseases can cause 50-100% flock mortality in unvaccinated birds.", "mitigation": "Implement strict vaccination schedule, biosecurity measures, and maintain quarantine protocols."},
        {"risk": "Feed cost volatility", "category": "supply_chain", "probability": "high", "impact": "high", "severity": "high", "evidence": "Feed constitutes 60-70% of broiler production cost.", "mitigation": "Negotiate 3-month supply contracts with feed suppliers; explore local feed ingredient sourcing."},
        {"risk": "Heat stress mortality in summer", "category": "seasonal", "probability": "high", "impact": "high", "severity": "high", "evidence": "Summer temperatures above 35°C cause significant poultry mortality.", "mitigation": "Invest in ventilation, fogging systems, and adjust batch cycles to avoid peak summer months."},
        {"risk": "Consumer scare-driven demand drops", "category": "market", "probability": "low", "impact": "high", "severity": "medium", "evidence": "Media reports on bird flu can crash poultry demand overnight.", "mitigation": "Maintain hygiene certifications and diversify into eggs alongside broiler meat."},
    ],
}


class RiskAgent(BaseAgent):
    prompt_file = "risk_analysis.txt"
    output_model = RiskAnalysisResult
    system_prompt = (
        "You are a rural business risk analyst for India. "
        "Identify, categorize, and provide mitigation strategies for business risks. "
        "Return ONLY valid JSON. Every risk must include a mitigation."
    )

    def fallback(self, **kwargs: Any) -> dict:
        data: AssessmentInput = kwargs.get("data")
        cat = data.business_category.value

        risks = _DEFAULT_RISKS.get(cat, [
            {"risk": "Market demand uncertainty", "category": "market", "probability": "medium", "impact": "medium", "severity": "medium", "evidence": "Limited local market data available.", "mitigation": "Start with a small pilot to validate demand before full-scale investment."},
            {"risk": "Working capital shortage", "category": "financial", "probability": "medium", "impact": "high", "severity": "high", "evidence": "Micro-enterprises often underestimate working capital needs.", "mitigation": "Maintain a 45-day operating expense buffer in a separate account."},
            {"risk": "Informal competitor activity", "category": "competition", "probability": "medium", "impact": "medium", "severity": "medium", "evidence": "Informal operators are common in rural markets.", "mitigation": "Focus on quality, consistency, and reliability as key differentiators."},
            {"risk": "Infrastructure limitations", "category": "infrastructure", "probability": "medium", "impact": "medium", "severity": "medium", "evidence": "Rural infrastructure can be unreliable.", "mitigation": "Plan for backup power and alternative transport arrangements."},
        ])

        # Add financial risk if EMI ratio is high
        fin = data.financial
        if fin.monthly_emi and fin.monthly_revenue_estimate:
            emi_ratio = fin.monthly_emi / max(fin.monthly_revenue_estimate, 1)
            if emi_ratio > 0.25:
                risks.insert(0, {
                    "risk": "High EMI-to-revenue ratio",
                    "category": "financial",
                    "probability": "high",
                    "impact": "high",
                    "severity": "high",
                    "evidence": f"Monthly EMI of ₹{fin.monthly_emi:,.0f} represents {emi_ratio:.0%} of estimated revenue.",
                    "mitigation": "Explore longer tenure to reduce EMI, or start with a smaller project to improve cash flow ratios.",
                })

        return {"risks": risks[:6]}  # Cap at 6 risks
