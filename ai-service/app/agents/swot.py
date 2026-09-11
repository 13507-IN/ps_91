"""
ArthSetu — SWOT Analysis Agent.
"""

from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field

from app.agents.base import BaseAgent
from app.schemas.input import AssessmentInput, BusinessCategory


class SwotResult(BaseModel):
    strengths: list[str] = Field(..., min_length=1)
    weaknesses: list[str] = Field(..., min_length=1)
    opportunities: list[str] = Field(..., min_length=1)
    threats: list[str] = Field(..., min_length=1)


class SwotAgent(BaseAgent):
    prompt_file = "swot.txt"
    output_model = SwotResult
    system_prompt = (
        "You are a rural business SWOT analyst for India. "
        "Generate a structured SWOT analysis using only supplied evidence. "
        "Return ONLY valid JSON. Do not invent location-specific facts."
    )

    def fallback(self, **kwargs: Any) -> dict:
        data: AssessmentInput = kwargs.get("data")
        market_score: int = kwargs.get("market_score", 50)
        risk_score: int = kwargs.get("risk_score", 50)
        market_gaps: list = kwargs.get("market_gaps", [])
        risks: list = kwargs.get("risks", [])

        cat = data.business_category.value
        pop = data.market.population
        hh = data.market.households
        comp = data.competition.verified + data.competition.reported

        # Build dynamic SWOT
        strengths = []
        weaknesses = []
        opportunities = []
        threats = []

        # Strengths
        if pop > 5000:
            strengths.append(f"Large catchment population of {pop:,} provides a strong customer base.")
        elif pop > 1000:
            strengths.append(f"Adequate catchment population of {pop:,} for a micro-enterprise.")

        if data.financial.margin >= data.financial.project_cost * 0.10:
            strengths.append("Sufficient own-capital contribution reduces debt burden and demonstrates commitment.")

        if comp < 5:
            strengths.append(f"Low existing competition with only {comp} known businesses.")

        if data.financial.scheme_name:
            strengths.append(f"Eligible for government support under {data.financial.scheme_name}.")

        if not strengths:
            strengths.append("Potential to establish a structured business in an underserved market.")

        # Weaknesses
        if data.infrastructure and not data.infrastructure.has_cold_storage and cat in ("DAIRY", "FOOD_PROCESSING", "POULTRY"):
            weaknesses.append("No local cold storage facility increases perishability risk.")

        if data.financial.loan > data.financial.project_cost * 0.85:
            weaknesses.append(f"High leverage ({data.financial.loan / data.financial.project_cost:.0%} loan) increases financial pressure.")

        if data.infrastructure and not data.infrastructure.has_electricity:
            weaknesses.append("Unreliable or absent electricity supply limits operational capacity.")

        if not weaknesses:
            weaknesses.append("Limited local market data may affect initial business planning accuracy.")
            weaknesses.append("New entrant without established customer relationships.")

        # Opportunities (from market gaps)
        if market_gaps:
            for gap in market_gaps[:3]:
                name = gap.get("name", "") if isinstance(gap, dict) else str(gap)
                opportunities.append(f"Market gap identified: {name}.")
        if not opportunities:
            opportunities.append("Differentiation through quality, hygiene, and consistent availability.")
            opportunities.append("Potential for value-added products or services to increase margins.")

        # Threats (from risks)
        if risks:
            for r in risks[:3]:
                risk_name = r.get("risk", "") if isinstance(r, dict) else str(r)
                threats.append(f"{risk_name}.")
        if not threats:
            threats.append("Informal competitors may undercut on price.")
            threats.append("Seasonal demand and supply fluctuations may affect cash flow.")

        return {
            "strengths": strengths[:4],
            "weaknesses": weaknesses[:4],
            "opportunities": opportunities[:4],
            "threats": threats[:4],
        }
