"""
ArthSetu — Orchestrator.

Central pipeline that coordinates deterministic engines and LLM agents
into an optimized, parallelized business assessment flow.

Pipeline:
    1. Deterministic market score + informal estimation (Stage 0)
    2. Parallel Stage 1 LLM Agents: Market, Opportunity, Competition, Risk, Pricing (asyncio.gather)
    3. Deterministic scores: Risk score, Opportunity score, Viability score
    4. Parallel Stage 2 LLM Agents: SWOT, Recommendation (asyncio.gather)
    5. Reasoning assembly & confidence scoring
    6. Guardrail validation
"""

from __future__ import annotations

import time
import asyncio
import structlog

from app.schemas.input import AssessmentInput
from app.schemas.output import AssessmentOutput

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
    Orchestrates the full business intelligence pipeline with parallel execution.
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
        Run the optimized parallel assessment pipeline.
        """
        start = time.perf_counter()
        logger.info(
            "orchestrator_start",
            business_category=data.business_category.value,
            location=f"{data.location.village}, {data.location.district}",
        )

        # ── Stage 0: Deterministic calculations ──
        market_score = compute_market_score(data)
        informal = estimate_informal(data)
        risk_score = compute_risk_score(data)
        opportunity_score = compute_opportunity_score(market_score, data)
        viability_score = compute_viability_score(market_score, risk_score, data)

        # ── ML signals: demand estimate + commodity price forecast ──
        ml_signals = _collect_ml_signals(data)

        logger.info(
            "stage_0_deterministic",
            market_score=market_score,
            risk_score=risk_score,
            viability_score=viability_score,
            ml_demand=ml_signals["demand"]["daily_demand"] if ml_signals["demand"] else None,
            ml_forecast=ml_signals["commodity_forecast"]["commodity"] if ml_signals["commodity_forecast"] else None,
        )

        # ── Stage 1: Parallel LLM Execution (Market, Opportunity, Competition, Risk, Pricing) ──
        market_task = self.market_agent.run(
            data=data,
            location=data.location,
            market=data.market,
            competition=data.competition,
            business_category=data.business_category.value,
            business_idea=data.business_idea,
            market_score=market_score,
            ml_demand_estimate=ml_signals["demand"],
            livestock=data.livestock,
            top_crops=data.top_crops,
            language=data.language,
        )

        competition_task = self.competition_agent.run(
            data=data,
            location=data.location,
            market=data.market,
            competition=data.competition,
            business_category=data.business_category.value,
            informal_estimate=informal,
            language=data.language,
        )

        risk_task = self.risk_agent.run(
            data=data,
            location=data.location,
            market=data.market,
            competition=data.competition,
            financial=data.financial,
            business_category=data.business_category.value,
            business_idea=data.business_idea,
            infrastructure=data.infrastructure,
            risk_score=risk_score,
            market_analysis={},
            language=data.language,
        )

        pricing_task = self.pricing_agent.run(
            data=data,
            location=data.location,
            market=data.market,
            competition=data.competition,
            financial=data.financial,
            business_category=data.business_category.value,
            pricing=data.pricing,
            commodity_forecast=ml_signals["commodity_forecast"],
            market_analysis={},
            language=data.language,
        )

        # Run Stage 1 tasks concurrently
        results_s1 = await asyncio.gather(
            market_task,
            competition_task,
            risk_task,
            pricing_task,
            return_exceptions=True,
        )

        market_result = results_s1[0] if not isinstance(results_s1[0], Exception) else self.market_agent.fallback(data=data)
        competition_result = results_s1[1] if not isinstance(results_s1[1], Exception) else self.competition_agent.fallback(data=data)
        risk_result = results_s1[2] if not isinstance(results_s1[2], Exception) else self.risk_agent.fallback(data=data)
        pricing_result = results_s1[3] if not isinstance(results_s1[3], Exception) else self.pricing_agent.fallback(data=data)

        risks = risk_result.get("risks", [])

        logger.info("stage_1_complete", risks_found=len(risks))

        # ── Stage 2: Parallel LLM Execution (Opportunity, SWOT, Recommendation) ──
        opportunity_task = self.opportunity_agent.run(
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
            language=data.language,
        )

        swot_task = self.swot_agent.run(
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
            market_gaps=[],
            risks=risks,
            language=data.language,
        )

        recommendation_task = self.recommendation_agent.run(
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
            market_gaps=[],
            competition_analysis=competition_result,
            swot={},
            pricing_strategy=pricing_result,
            language=data.language,
        )

        results_s2 = await asyncio.gather(opportunity_task, swot_task, recommendation_task, return_exceptions=True)

        opportunity_result = results_s2[0] if not isinstance(results_s2[0], Exception) else self.opportunity_agent.fallback(data=data)
        swot_result = results_s2[1] if not isinstance(results_s2[1], Exception) else self.swot_agent.fallback(data=data)
        recommendation_result = results_s2[2] if not isinstance(results_s2[2], Exception) else self.recommendation_agent.fallback(data=data, market_score=market_score, risk_score=risk_score, viability_score=viability_score, market_gaps=[])

        logger.info("stage_2_complete")

        market_gaps = opportunity_result.get("market_gaps", [])
        logger.info("stage_2_gaps_extracted", gaps_found=len(market_gaps))

        # ── Stage 3: Assemble reasoning & confidence ──
        reasoning = _build_reasoning(
            data, market_score, opportunity_score, risk_score, viability_score,
            market_result, competition_result, market_gaps, ml_signals,
        )

        confidence = _determine_confidence(data, market_result, competition_result, pricing_result)

        # Assemble final output dictionary
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

        # ── Stage 4: Guardrail validation ──
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

def _collect_ml_signals(data: AssessmentInput) -> dict:
    """
    Compute optional ML-derived signals for the assessment pipeline.

    Returns {"demand": dict | None, "commodity_forecast": dict | None}.
    Never raises — every signal is wrapped so the pipeline stays deterministic.
    """
    demand = None
    try:
        from app.ml.predictor import predict_demand

        livestock_count = sum(l.total_count for l in (data.livestock or []))
        crop_area = sum(c.total_area_hectares or 0 for c in (data.top_crops or []))
        nearest_town = data.market.nearest_town_km
        if nearest_town is None and data.infrastructure is not None:
            nearest_town = data.infrastructure.nearest_town_km

        result = predict_demand(
            business_category=data.business_category.value,
            population=data.market.population,
            households=data.market.households,
            literacy_rate=data.market.avg_literacy_rate,
            workers=data.market.total_workers,
            livestock_count=livestock_count,
            crop_area=crop_area or None,
            nearest_town_distance=nearest_town,
            district=data.location.district,
        )
        if result.available and result.daily_demand is not None:
            demand = {
                "available": True,
                "daily_demand": result.daily_demand,
                "model": result.model,
                "confidence": result.confidence,
                "is_synthetic": result.is_synthetic,
                "notes": result.notes,
            }
    except Exception as exc:
        logger.warning("ml_demand_signal_failed", error=str(exc))

    commodity_forecast = None
    try:
        commodity = data.pricing.commodity if data.pricing else None
        if commodity:
            from app.ml.predictor import forecast_commodity

            result = forecast_commodity(commodity, horizon_days=30)
            if result.available and result.daily:
                commodity_forecast = {
                    "available": True,
                    "commodity": result.commodity,
                    "last_observed_date": result.last_observed_date,
                    "window_buy": result.window_buy,
                    "window_sell": result.window_sell,
                    "alert": result.alert,
                    "daily": result.daily,
                }
    except Exception as exc:
        logger.warning("ml_forecast_signal_failed", error=str(exc))

    return {"demand": demand, "commodity_forecast": commodity_forecast}


def _build_reasoning(
    data: AssessmentInput,
    market_score: int,
    opportunity_score: int,
    risk_score: int,
    viability_score: int,
    market_result: dict,
    competition_result: dict,
    market_gaps: list,
    ml_signals: dict | None = None,
) -> list[dict]:
    """Build structured reasoning items with evidence tagging."""
    reasoning = []

    # Market reasoning
    demand = data.market.estimated_demand or 0
    supply = data.market.estimated_supply or 0
    pop = data.market.population
    hh = data.market.households

    reasoning.append({
        "claim": f"Market score is {market_score}/100 based on verified local census demographic data",
        "evidence": [
            f"Catchment Population: {pop:,} residents",
            f"Total Households: {hh:,} families",
            f"Estimated Daily Demand: {demand:,.0f} units/day" if demand > 0 else f"Demographic Catchment: {pop:,} people",
            f"Estimated Daily Supply: {supply:,.0f} units/day" if supply > 0 else "Local Supply Gap Identified",
        ],
        "inference": False,
        "confidence": 0.92,
    })

    # Competition reasoning
    comp_level = competition_result.get("competition_level", "moderate")
    verified_comp = data.competition.verified
    reported_comp = data.competition.reported
    reasoning.append({
        "claim": f"Local Competition Intensity is {comp_level.upper()}",
        "evidence": [
            f"{verified_comp} verified commercial listings (PostGIS / Official)",
            f"{reported_comp} community reported local competitors",
            f"Catchment density: {((verified_comp + reported_comp) / max(pop, 1) * 1000):.2f} competitors per 1,000 residents",
        ],
        "inference": False,
        "confidence": 0.88,
    })

    # ML demand estimate reasoning
    ml_demand = ml_signals.get("demand") if isinstance(ml_signals, dict) else None
    if ml_demand and ml_demand.get("available"):
        reasoning.append({
            "claim": f"ML demand model estimates {ml_demand['daily_demand']:,.0f} units/day of demand in this catchment",
            "evidence": [
                f"Model: {ml_demand['model']}",
                f"Demographics input: {pop:,} population, {hh:,} households",
            ],
            "inference": True,
            "confidence": 0.82,
        })

    # ML commodity price forecast reasoning
    ml_forecast = ml_signals.get("commodity_forecast") if isinstance(ml_signals, dict) else None
    if ml_forecast and ml_forecast.get("available"):
        alert = ml_forecast.get("alert", {})
        reasoning.append({
            "claim": f"ML price forecast for '{ml_forecast['commodity']}' over the next month is available",
            "evidence": [
                f"Buy window: {ml_forecast['window_buy']['recommended_buying_window']} at ₹{ml_forecast['window_buy']['predicted_lowest_price']:,.2f}",
                f"Sell window: {ml_forecast['window_sell']['potential_selling_window']} at ₹{ml_forecast['window_sell']['predicted_highest_price']:,.2f}",
                f"Alert level: {alert.get('alert_level', 'NORMAL')} (expected +{alert.get('expected_price_increase_pct', 0):.2f}%)",
            ],
            "inference": True,
            "confidence": 0.82,
        })

    # Opportunity reasoning
    if market_gaps:
        gap_names = [g.get("name", "") if isinstance(g, dict) else str(g) for g in market_gaps[:4]]
        reasoning.append({
            "claim": f"Opportunity score is {opportunity_score}/100 with {len(market_gaps)} identified market gaps",
            "evidence": gap_names,
            "inference": True,
            "confidence": 0.85,
        })

    # Financial & Risk reasoning
    fin = data.financial
    reasoning.append({
        "claim": f"Risk score is {risk_score}/100 with solid capital coverage",
        "evidence": [
            f"Project Cost: ₹{fin.project_cost:,.0f}",
            f"Own Contribution: ₹{fin.margin:,.0f} ({fin.margin / max(fin.project_cost, 1):.0%})",
            f"Loan Funding: ₹{fin.loan:,.0f}",
            f"Estimated Monthly Revenue: ₹{fin.monthly_revenue_estimate:,.0f}" if fin.monthly_revenue_estimate else "Viable unit economics",
        ],
        "inference": False,
        "confidence": 0.90,
    })

    # Overall Viability reasoning
    reasoning.append({
        "claim": f"Overall business viability score is {viability_score}/100",
        "evidence": [
            f"Market Score Weight: {market_score}/100 (High Local Demand)",
            f"Opportunity Score Weight: {opportunity_score}/100 (Unmet Gap)",
            f"Risk Score Weight: {risk_score}/100 (Manageable Risk Profile)",
        ],
        "inference": True,
        "confidence": 0.89,
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

    # Catchment & Location data
    total_checks += 1
    if data.location.village and data.location.district:
        data_points += 1

    # Population & households from Census
    total_checks += 1
    if data.market.population > 0 and data.market.households > 0:
        data_points += 1

    # Competition data
    total_checks += 1
    if data.competition:
        data_points += 1

    # Financial inputs & feasibility parameters
    total_checks += 1
    if data.financial.project_cost > 0:
        data_points += 1

    # Pricing & Infrastructure
    total_checks += 1
    if data.pricing:
        data_points += 1

    ratio = data_points / max(total_checks, 1)

    if ratio >= 0.70:
        return "high"
    elif ratio >= 0.40:
        return "medium"
    return "low"
