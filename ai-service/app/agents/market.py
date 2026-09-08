"""
UdyamSetu AI — Market Analysis Agent.
"""

from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field

from app.agents.base import BaseAgent
from app.schemas.input import AssessmentInput


class MarketAnalysisResult(BaseModel):
    demand_level: str
    market_condition: str
    reasoning: list[str] = Field(..., min_length=1)
    confidence: str


class MarketAgent(BaseAgent):
    prompt_file = "market_analysis.txt"
    output_model = MarketAnalysisResult
    system_prompt = (
        "You are a rural market intelligence analyst for India. "
        "Analyse the provided market data and return a structured JSON assessment. "
        "Never invent statistics. Use only supplied data."
    )

    def fallback(self, **kwargs: Any) -> dict:
        data: AssessmentInput = kwargs.get("data")
        market_score: int = kwargs.get("market_score", 50)

        demand = data.market.estimated_demand or 0
        supply = data.market.estimated_supply or 0
        pop = data.market.population

        # Determine demand level
        if demand > 0 and supply > 0:
            gap = (demand - supply) / demand
            demand_level = "high" if gap > 0.15 else ("medium" if gap > -0.1 else "low")
        elif pop > 5000:
            demand_level = "high"
        elif pop > 2000:
            demand_level = "medium"
        else:
            demand_level = "low"

        # Market condition from score
        if market_score >= 75:
            condition = "promising"
        elif market_score >= 55:
            condition = "moderate"
        elif market_score >= 35:
            condition = "challenging"
        else:
            condition = "saturated"

        reasoning = []
        if demand > supply:
            reasoning.append(f"Estimated demand ({demand:.0f}) exceeds known supply ({supply:.0f}), indicating unmet market need.")
        elif demand > 0:
            reasoning.append(f"Supply ({supply:.0f}) appears to meet or exceed demand ({demand:.0f}).")

        total_comp = data.competition.verified + data.competition.reported
        if total_comp < 5:
            reasoning.append(f"Low competition with only {total_comp} known businesses in the catchment area.")
        elif total_comp < 15:
            reasoning.append(f"Moderate competition with {total_comp} known businesses in the catchment area.")
        else:
            reasoning.append(f"Significant competition with {total_comp} known businesses in the catchment area.")

        if pop > 5000:
            reasoning.append(f"Large catchment population of {pop:,} provides a sufficient customer base.")
        elif pop > 1000:
            reasoning.append(f"Moderate catchment population of {pop:,} supports local enterprise.")
        else:
            reasoning.append(f"Small catchment population of {pop:,} may limit market size.")

        if not reasoning:
            reasoning.append("Insufficient data for detailed market reasoning.")

        return {
            "demand_level": demand_level,
            "market_condition": condition,
            "reasoning": reasoning,
            "confidence": "medium" if demand > 0 else "low",
        }
