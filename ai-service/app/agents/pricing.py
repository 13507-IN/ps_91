"""
ArthSetu — Pricing Analysis Agent.
"""

from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field

from app.agents.base import BaseAgent
from app.schemas.input import AssessmentInput, BusinessCategory


class PricingResult(BaseModel):
    recommended_price_range: dict
    strategy: str
    reasoning: str
    confidence: str


# Category-specific fallback pricing benchmarks
_BENCHMARKS: dict[str, dict] = {
    "DAIRY": {"min": 45, "max": 55, "unit": "per litre", "strategy": "competitive penetration"},
    "FOOD_PROCESSING": {"min": 4, "max": 8, "unit": "per kg processing", "strategy": "cost-plus"},
    "RETAIL": {"min": 8, "max": 15, "unit": "% margin on MRP", "strategy": "market matching"},
    "TEXTILES_TAILORING": {"min": 150, "max": 350, "unit": "per stitching job", "strategy": "value-based premium"},
    "POULTRY": {"min": 120, "max": 180, "unit": "per kg live weight", "strategy": "market matching"},
    "AGRICULTURE": {"min": 5, "max": 15, "unit": "% markup on inputs", "strategy": "cost-plus"},
    "LIVESTOCK": {"min": 200, "max": 400, "unit": "per kg live weight", "strategy": "market matching"},
    "TRANSPORT": {"min": 10, "max": 20, "unit": "per km", "strategy": "competitive penetration"},
    "HANDICRAFT": {"min": 100, "max": 500, "unit": "per piece", "strategy": "value-based premium"},
    "SERVICES": {"min": 100, "max": 500, "unit": "per service call", "strategy": "market matching"},
}


class PricingAgent(BaseAgent):
    prompt_file = "pricing.txt"
    output_model = PricingResult
    system_prompt = (
        "You are a rural business pricing analyst for India. "
        "Interpret pricing data and recommend a strategy. "
        "Return ONLY valid JSON. If data is insufficient, set confidence to low."
    )

    def fallback(self, **kwargs: Any) -> dict:
        data: AssessmentInput = kwargs.get("data")
        cat = data.business_category.value

        # Use actual pricing data if available
        if data.pricing and data.pricing.min is not None and data.pricing.max is not None:
            price_min = data.pricing.min
            price_max = data.pricing.max
            confidence = "medium"

            total_comp = data.competition.verified + data.competition.reported
            if total_comp > 10:
                strategy = "competitive penetration"
                reasoning = f"With {total_comp} known competitors, a competitive entry price between ₹{price_min:.0f}–₹{price_max:.0f} {data.pricing.unit} is recommended to gain initial market share."
            elif total_comp > 3:
                strategy = "market matching"
                reasoning = f"With moderate competition ({total_comp} known businesses), pricing at market rates of ₹{price_min:.0f}–₹{price_max:.0f} {data.pricing.unit} balances competitiveness with margin."
            else:
                strategy = "value-based premium"
                reasoning = f"Low competition ({total_comp} known businesses) allows pricing at the higher end of ₹{price_min:.0f}–₹{price_max:.0f} {data.pricing.unit} with quality differentiation."

            return {
                "recommended_price_range": {"min": price_min, "max": price_max},
                "strategy": strategy,
                "reasoning": reasoning,
                "confidence": confidence,
            }

        # Fall back to category benchmarks
        bench = _BENCHMARKS.get(cat, {"min": 50, "max": 150, "unit": "per unit", "strategy": "cost-plus"})
        return {
            "recommended_price_range": {"min": bench["min"], "max": bench["max"]},
            "strategy": bench["strategy"],
            "reasoning": f"No local pricing data available. Using general rural {cat.lower().replace('_', ' ')} benchmarks of ₹{bench['min']}–₹{bench['max']} {bench['unit']}. Actual pricing should be validated through local market survey.",
            "confidence": "low",
        }
