"""
ArthSetu — Orchestrator.

Central pipeline that coordinates deterministic engines and LLM agents
into a sequential business assessment flow.

Pipeline:
    1. Deterministic market score
    2. Informal business estimation
    3. Market analysis (LLM)
    4. Opportunity detection (LLM)
    5. Competition analysis (LLM)
    6. Risk score (deterministic) + Risk analysis (LLM)
    7. Pricing analysis (LLM)
    8. SWOT (LLM)
    9. Business recommendation (LLM)
   10. Viability score (deterministic)
   11. Reasoning assembly
   12. Guardrail validation
"""

from __future__ import annotations

import time
import structlog

from app.schemas.input import AssessmentInput
from app.schemas.output import AssessmentOutput, ReasoningItem

from app.engines.market_scorer import compute_market_score
from app.engines.informal_estimator import estimate_informal
from app.engines.risk_scorer import compute_risk_score
from app.engines.viability_scorer import compute_viability_score, compute_opportunity_score

from app.agents.market import MarketAgent
from app.agents.opportunity import OpportunityAgent
from app.agents.competition import CompetitionAgent
from app.agents.risk import RiskAgent
from app.agents.pricing import PricingAgent
from app.agents.swot import SwotAgent
from app.agents.recommendation import RecommendationAgent

from app.guardrails.validator import validate_assessment
from app.llm.provider import LLMClient

logger = structlog.get_logger(__name__)


class Orchestrator:
    """
    Orchestrates the full business intelligence pipeline.

    Usage:
        orchestrator = Orchestrator()
        result = await orchestrator.generate_assessment(data)
    """

    def __init__(self, llm: LLMClient | None = None) -> None:
        self.llm = llm or LLMClient()

        # Initialize agents
        self.market_agent = MarketAgent(self.llm)
        self.opportunity_agent = OpportunityAgent(self.llm)
        self.competition_agent = CompetitionAgent(self.llm)
        self.risk_agent = RiskAgent(self.llm)
        self.pricing_agent = PricingAgent(self.llm)
        self.swot_agent = SwotAgent(self.llm)
        self.recommendation_agent = RecommendationAgent(self.llm)

    async def generate_assessment(self, data: AssessmentInput) -> AssessmentOutput:
        """
        Run the complete assessment pipeline.

        Returns a fully validated AssessmentOutput.
        """
        start = time.perf_counter()
        logger.info(
            "orchestrator_start",
            business_category=data.business_category.value,
            location=f"{data.location.village}, {data.location.district}",
        )

        # ── Step 1: Deterministic market score ──
        market_score = compute_market_score(data)
        logger.info("step_1_market_score", score=market_score)

        # ── Step 2: Informal business estimation ──
        informal = estimate_informal(data)
        logger.info(
            "step_2_informal_estimate",
            min=informal.min,
            max=informal.max,
            confidence=informal.confidence,
        )

        # ── Step 3: Market analysis (LLM) ──
        market_result = await self.market_agent.run(
            data=data,
            location=data.location,
            market=data.market,
            competition=data.competition,
            business_category=data.business_category.value,
            business_idea=data.business_idea,
            market_score=market_score,
            livestock=data.livestock,
            top_crops=data.top_crops,
        )
        logger.info("step_3_market_analysis", condition=market_result.get("market_condition"))

        # ── Step 4: Opportunity detection (LLM) ──
        opportunity_result = await self.opportunity_agent.run(
            data=data,
            location=data.location,
            market=data.market,
            competition=data.competition,
            business_category=data.business_category.value,
            business_idea=data.business_idea,
            market_score=market_score,
            market_analysis=market_result,
            infrastructure=data.infrastructure,
            livestock=data.livestock,
            top_crops=data.top_crops,
        )
        market_gaps = opportunity_result.get("market_gaps", [])
        logger.info("step_4_opportunity", gaps_found=len(market_gaps))

        # ── Step 5: Competition analysis (LLM) ──
        competition_result = await self.competition_agent.run(
            data=data,
            location=data.location,
            market=data.market,
            competition=data.competition,
            business_category=data.business_category.value,
            informal_estimate=informal,
        )
        logger.info("step_5_competition", level=competition_result.get("competition_level"))

        # ── Step 6: Risk score (deterministic) + Risk analysis (LLM) ──
        risk_score = compute_risk_score(data)

        risk_result = await self.risk_agent.run(
            data=data,
            location=data.location,
            market=data.market,
            competition=data.competition,
            financial=data.financial,
            business_category=data.business_category.value,
            business_idea=data.business_idea,
            infrastructure=data.infrastructure,
            risk_score=risk_score,
            market_analysis=market_result,
        )
        risks = risk_result.get("risks", [])
        logger.info("step_6_risk", score=risk_score, risks_found=len(risks))

        # ── Step 7: Pricing analysis (LLM) ──
        pricing_result = await self.pricing_agent.run(
            data=data,
            location=data.location,
            market=data.market,
            competition=data.competition,
            financial=data.financial,
            business_category=data.business_category.value,
            pricing=data.pricing,
            market_analysis=market_result,
        )
        logger.info("step_7_pricing", strategy=pricing_result.get("strategy"))

        # ── Step 8: SWOT (LLM) ──
        swot_result = await self.swot_agent.run(
            data=data,
            location=data.location,
            market=data.market,
            competition=data.competition,
            financial=data.financial,
            business_category=data.business_category.value,
            business_idea=data.business_idea,
            infrastructure=data.infrastructure,
            market_score=market_score,
            risk_score=risk_score,
            market_analysis=market_result,
            market_gaps=market_gaps,
            risks=risks,
        )
        logger.info("step_8_swot")

        # ── Step 9: Business recommendation (LLM) ──
        # Compute opportunity and viability scores before recommendation
        opportunity_score = compute_opportunity_score(market_score, data)
        viability_score = compute_viability_score(market_score, risk_score, data)

        recommendation_result = await self.recommendation_agent.run(
            data=data,
            location=data.location,
            market=data.market,
            competition=data.competition,
            financial=data.financial,
            business_category=data.business_category.value,
            business_idea=data.business_idea,
            infrastructure=data.infrastructure,
            market_score=market_score,
            risk_score=risk_score,
            viability_score=viability_score,
            market_analysis=market_result,
            market_gaps=market_gaps,
            competition_analysis=competition_result,
            swot=swot_result,
            pricing_strategy=pricing_result,
        )
        logger.info("step_9_recommendation", model=recommendation_result.get("name"))

        # ── Step 10: Assemble reasoning ──
        reasoning = _build_reasoning(
            data, market_score, opportunity_score, risk_score, viability_score,
            market_result, competition_result, market_gaps,
        )

        # ── Step 11: Determine overall confidence ──
        confidence = _determine_confidence(data, market_result, competition_result, pricing_result)

        # ── Step 12: Assemble output ──
        raw_output = {
            "market_score": market_score,
            "opportunity_score": opportunity_score,
            "risk_score": risk_score,
            "viability_score": viability_score,
            "market_analysis": market_result,
            "market_gaps": market_gaps,
            "competition_analysis": competition_result,
            "recommended_business_model": recommendation_result,
            "swot": swot_result,
            "risks": risks,
            "pricing_strategy": pricing_result,
            "reasoning": reasoning,
            "confidence": confidence,
        }

        # ── Step 13: Guardrail validation ──
        validated_output, validation = validate_assessment(raw_output)

        elapsed_ms = round((time.perf_counter() - start) * 1000)
        logger.info(
            "orchestrator_complete",
            elapsed_ms=elapsed_ms,
            viability_score=viability_score,
            confidence=confidence,
            guardrail_warnings=len(validation.warnings),
            guardrail_corrections=len(validation.corrections),
        )

        return AssessmentOutput.model_validate(validated_output)


# ── Helper functions ───────────────────────────────────────────────────

def _build_reasoning(
    data: AssessmentInput,
    market_score: int,
    opportunity_score: int,
    risk_score: int,
    viability_score: int,
    market_result: dict,
    competition_result: dict,
    market_gaps: list,
) -> list[dict]:
    """Build structured reasoning items with evidence tagging."""
    reasoning = []

    # Market reasoning
    demand = data.market.estimated_demand or 0
    supply = data.market.estimated_supply or 0
    if demand > 0 and supply > 0:
        reasoning.append({
            "claim": f"Market score is {market_score}/100",
            "evidence": [
                f"Estimated demand: {demand:.0f} units/day",
                f"Estimated supply: {supply:.0f} units/day",
                f"Population: {data.market.population:,}",
            ],
            "inference": False,
            "confidence": 0.8,
        })
    else:
        reasoning.append({
            "claim": f"Market score is {market_score}/100 (based on available indicators)",
            "evidence": [f"Population: {data.market.population:,}", f"Households: {data.market.households:,}"],
            "inference": True,
            "confidence": 0.5,
        })

    # Competition reasoning
    comp_level = competition_result.get("competition_level", "moderate")
    reasoning.append({
        "claim": f"Competition is {comp_level}",
        "evidence": [
            f"{data.competition.verified} verified businesses",
            f"{data.competition.reported} community reports",
        ],
        "inference": True,
        "confidence": 0.72,
    })

    # Opportunity reasoning
    if market_gaps:
        gap_names = [g.get("name", "") if isinstance(g, dict) else str(g) for g in market_gaps[:3]]
        reasoning.append({
            "claim": f"Opportunity score is {opportunity_score}/100 with {len(market_gaps)} identified market gaps",
            "evidence": gap_names,
            "inference": True,
            "confidence": 0.65,
        })

    # Risk reasoning
    reasoning.append({
        "claim": f"Risk score is {risk_score}/100",
        "evidence": [
            f"Loan: ₹{data.financial.loan:,.0f}",
            f"Project cost: ₹{data.financial.project_cost:,.0f}",
            f"Own capital: ₹{data.financial.margin:,.0f}",
        ],
        "inference": False,
        "confidence": 0.8,
    })

    # Viability reasoning
    reasoning.append({
        "claim": f"Overall viability score is {viability_score}/100",
        "evidence": [
            f"Market: {market_score}/100",
            f"Opportunity: {opportunity_score}/100",
            f"Risk: {risk_score}/100",
        ],
        "inference": True,
        "confidence": 0.75,
    })

    return reasoning


def _determine_confidence(
    data: AssessmentInput,
    market_result: dict,
    competition_result: dict,
    pricing_result: dict,
) -> str:
    """Determine overall confidence level based on data availability."""
    data_points = 0
    total_checks = 0

    # Demand/supply data available
    total_checks += 2
    if data.market.estimated_demand is not None:
        data_points += 1
    if data.market.estimated_supply is not None:
        data_points += 1

    # Competition data
    total_checks += 1
    if data.competition.verified > 0 or data.competition.reported > 0:
        data_points += 1

    # Pricing data
    total_checks += 1
    if data.pricing and data.pricing.min is not None:
        data_points += 1

    # Infrastructure data
    total_checks += 1
    if data.infrastructure:
        data_points += 1

    # Livestock/crop data
    total_checks += 1
    if data.livestock and len(data.livestock) > 0:
        data_points += 1

    # Financial data completeness
    total_checks += 1
    if data.financial.monthly_emi and data.financial.monthly_revenue_estimate:
        data_points += 1

    ratio = data_points / max(total_checks, 1)

    if ratio >= 0.75:
        return "high"
    elif ratio >= 0.45:
        return "medium"
    return "low"
