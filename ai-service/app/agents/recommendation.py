"""
ArthSetu — Business Recommendation Agent.
"""

from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field

from app.agents.base import BaseAgent
from app.schemas.input import AssessmentInput, BusinessCategory


class RecommendationResult(BaseModel):
    name: str
    reasoning: list[str] = Field(..., min_length=1)
    capital_fit: str


# Category-specific default business model names
_DEFAULT_MODELS: dict[str, str] = {
    "DAIRY": "Dairy + Doorstep Delivery + Value-Added Products",
    "FOOD_PROCESSING": "Multi-Crop Processing Unit + Custom Milling",
    "RETAIL": "Kirana Store + Home Delivery + Agricultural Inputs",
    "TEXTILES_TAILORING": "Tailoring + School Uniform Contracts + Fabric Retail",
    "POULTRY": "Broiler Farm + Direct Haat Sales + Egg Production",
    "AGRICULTURE": "Agricultural Input Supply + Farm Advisory Services",
    "LIVESTOCK": "Livestock Rearing + Feed Supply + Veterinary First-Aid",
    "TRANSPORT": "E-Rickshaw Service + Agricultural Cargo Transport",
    "HANDICRAFT": "Artisan Production + Online Sales + Design Innovation",
    "SERVICES": "Multi-Service Centre (Mobile Repair + Digital Services)",
    "OTHER": "Hybrid Micro-Enterprise + Value-Added Services",
}


class RecommendationAgent(BaseAgent):
    prompt_file = "business_recommendation.txt"
    output_model = RecommendationResult
    system_prompt = (
        "You are a rural business strategy advisor for India. "
        "Recommend a specific, differentiated business model, not just a category. "
        "Return ONLY valid JSON. Tie each reasoning point to data."
    )

    def fallback(self, **kwargs: Any) -> dict:
        data: AssessmentInput = kwargs.get("data")
        market_score: int = kwargs.get("market_score", 50)
        risk_score: int = kwargs.get("risk_score", 50)
        viability_score: int = kwargs.get("viability_score", 50)
        market_gaps: list = kwargs.get("market_gaps", [])

        cat = data.business_category.value
        model_name = _DEFAULT_MODELS.get(cat, "Hybrid Micro-Enterprise")

        # Customize model name based on market gaps
        if market_gaps:
            gap_names = [g.get("name", "") if isinstance(g, dict) else str(g) for g in market_gaps[:2]]
            if gap_names:
                base = cat.replace("_", " ").title()
                model_name = f"{base} + {' + '.join(gap_names)}"

        # Build reasoning
        reasoning = []

        pop = data.market.population
        hh = data.market.households
        comp = data.competition.verified + data.competition.reported

        if market_score >= 65:
            reasoning.append(f"Strong market score ({market_score}/100) indicates favourable local demand conditions.")
        else:
            reasoning.append(f"Market score of {market_score}/100 suggests moderate demand — focused approach recommended.")

        if comp < 5:
            reasoning.append(f"Low competition ({comp} known businesses) provides room for market entry.")
        elif comp < 15:
            reasoning.append(f"Moderate competition ({comp} known businesses) — differentiation through value-addition is key.")
        else:
            reasoning.append(f"High competition ({comp} known businesses) — niche positioning is essential.")

        if market_gaps:
            gap_name = market_gaps[0].get("name", "identified market gap") if isinstance(market_gaps[0], dict) else str(market_gaps[0])
            reasoning.append(f"Identified market gap in '{gap_name}' provides a differentiation opportunity.")

        if risk_score < 40:
            reasoning.append("Low risk profile supports investment confidence.")
        elif risk_score < 60:
            reasoning.append("Moderate risk profile — mitigation measures should be implemented proactively.")
        else:
            reasoning.append("Elevated risk — start conservatively and scale based on initial performance.")

        # Capital fit analysis
        fin = data.financial
        if fin.margin >= fin.project_cost * 0.15:
            capital_fit = f"Strong capital adequacy — own contribution of ₹{fin.margin:,.0f} ({fin.margin / fin.project_cost:.0%} of project cost) provides a solid foundation. Total project cost of ₹{fin.project_cost:,.0f} is financeable under available schemes."
        elif fin.margin >= fin.project_cost * 0.10:
            capital_fit = f"Adequate capital fit — ₹{fin.margin:,.0f} margin covers the standard 10% contribution requirement for project cost of ₹{fin.project_cost:,.0f}."
        else:
            capital_fit = f"Tight capital position — ₹{fin.margin:,.0f} margin is {fin.margin / fin.project_cost:.0%} of project cost ₹{fin.project_cost:,.0f}. Consider starting with a smaller project or increasing own contribution."

        return {
            "name": model_name,
            "reasoning": reasoning,
            "capital_fit": capital_fit,
        }
