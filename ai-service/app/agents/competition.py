"""
ArthSetu — Competition Analysis Agent.
"""

from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field

from app.agents.base import BaseAgent
from app.schemas.input import AssessmentInput
from app.engines.informal_estimator import InformalEstimateResult


class CompetitionAnalysisResultModel(BaseModel):
    competition_level: str
    verified_businesses: int
    reported_businesses: int
    estimated_informal: dict
    informal_interpretation: str
    confidence: str


class CompetitionAgent(BaseAgent):
    prompt_file = "competitor_analysis.txt"
    output_model = CompetitionAnalysisResultModel
    system_prompt = (
        "You are a rural business competition analyst for India. "
        "Interpret competition data including informal businesses. "
        "Return ONLY valid JSON. Do not change the informal estimate numbers."
    )

    def fallback(self, **kwargs: Any) -> dict:
        data: AssessmentInput = kwargs.get("data")
        informal: InformalEstimateResult = kwargs.get("informal_estimate")

        verified = data.competition.verified
        reported = data.competition.reported
        total_known = verified + reported
        total_with_informal = total_known + (informal.min + informal.max) // 2

        hh = max(data.market.households, 1)
        per_1000 = (total_with_informal / hh) * 1000

        if per_1000 <= 2:
            level = "low"
            interp = f"With an estimated {total_with_informal} total competitors (including informal) for {hh:,} households, competition is low. There is significant room for a new entrant."
        elif per_1000 <= 5:
            level = "moderate"
            interp = f"An estimated {total_with_informal} competitors for {hh:,} households indicates moderate competition. Differentiation through quality or service will be important."
        elif per_1000 <= 10:
            level = "high"
            interp = f"With approximately {total_with_informal} competitors (many informal) for {hh:,} households, competition is significant. A clear value proposition is essential."
        else:
            level = "very_high"
            interp = f"The market appears heavily served with ~{total_with_informal} estimated competitors for {hh:,} households. Entering requires a strong differentiation strategy."

        return {
            "competition_level": level,
            "verified_businesses": verified,
            "reported_businesses": reported,
            "estimated_informal": {"min": informal.min, "max": informal.max},
            "informal_interpretation": interp,
            "confidence": "medium" if informal.confidence >= 0.5 else "low",
        }
