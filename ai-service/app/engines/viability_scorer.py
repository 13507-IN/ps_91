"""
ArthSetu — Viability Scorer (Deterministic).

Computes an overall viability_score (0-100) using:

    Market       25%
    Competition  15%
    Capital      20%
    Profit       20%
    Risk         20%

The LLM then explains *why* the score is what it is.
"""

from __future__ import annotations

from app.schemas.input import AssessmentInput


def compute_viability_score(
    market_score: int,
    risk_score: int,
    data: AssessmentInput,
) -> int:
    """
    Return an integer viability score 0–100.

    Inputs:
        market_score:  pre-computed market score (0-100)
        risk_score:    pre-computed risk score (0-100, higher = riskier)
        data:          full assessment input for financial factors
    """

    market_component = (market_score / 100) * 0.25
    competition_component = _competition_component(data) * 0.15
    capital_component = _capital_component(data) * 0.20
    profit_component = _profit_component(data) * 0.20
    risk_component = ((100 - risk_score) / 100) * 0.20  # invert: low risk = high viability

    raw = (
        market_component
        + competition_component
        + capital_component
        + profit_component
        + risk_component
    )

    return _clamp(round(raw * 100))


def compute_opportunity_score(market_score: int, data: AssessmentInput) -> int:
    """
    Opportunity score (0-100) combines market attractiveness with
    competition gap and demand signals.
    """
    # Market attractiveness
    market_factor = market_score / 100

    # Competition gap (fewer competitors = more opportunity)
    total_comp = data.competition.verified + data.competition.reported
    hh = max(data.market.households, 1)
    comp_per_1000 = (total_comp / hh) * 1000

    if comp_per_1000 <= 1:
        comp_gap = 0.95
    elif comp_per_1000 <= 3:
        comp_gap = 0.80
    elif comp_per_1000 <= 6:
        comp_gap = 0.60
    elif comp_per_1000 <= 10:
        comp_gap = 0.40
    else:
        comp_gap = 0.20

    # Demand strength
    demand = data.market.estimated_demand or 0
    supply = data.market.estimated_supply or 0
    if demand > 0 and supply < demand:
        demand_strength = min(1.0, (demand - supply) / demand + 0.3)
    elif demand > 0:
        demand_strength = 0.35
    else:
        demand_strength = 0.50

    raw = market_factor * 0.40 + comp_gap * 0.35 + demand_strength * 0.25
    return _clamp(round(raw * 100))


# ── Private helpers ────────────────────────────────────────────────────

def _competition_component(data: AssessmentInput) -> float:
    """Lower competition → higher viability component (0–1)."""
    total = data.competition.verified + data.competition.reported
    hh = max(data.market.households, 1)
    per_1000 = (total / hh) * 1000

    if per_1000 <= 2:
        return 0.90
    elif per_1000 <= 5:
        return 0.70
    elif per_1000 <= 10:
        return 0.50
    elif per_1000 <= 15:
        return 0.30
    return 0.15


def _capital_component(data: AssessmentInput) -> float:
    """Better capital adequacy → higher viability (0–1)."""
    fin = data.financial
    if fin.project_cost <= 0:
        return 0.50

    margin_ratio = fin.margin / fin.project_cost

    if margin_ratio >= 0.20:
        return 0.95
    elif margin_ratio >= 0.15:
        return 0.80
    elif margin_ratio >= 0.10:
        return 0.65
    elif margin_ratio >= 0.05:
        return 0.40
    return 0.20


def _profit_component(data: AssessmentInput) -> float:
    """Better estimated profit → higher viability (0–1)."""
    fin = data.financial

    revenue = fin.monthly_revenue_estimate
    costs = fin.monthly_operating_cost
    emi = fin.monthly_emi

    if not revenue or revenue <= 0:
        return 0.50  # unknown → moderate

    total_costs = (costs or 0) + (emi or 0)
    if total_costs <= 0:
        return 0.70  # no cost data but revenue exists

    profit_margin = (revenue - total_costs) / revenue

    if profit_margin >= 0.30:
        return 0.95
    elif profit_margin >= 0.20:
        return 0.80
    elif profit_margin >= 0.10:
        return 0.60
    elif profit_margin >= 0.0:
        return 0.40
    return 0.15  # negative margin


def _clamp(value: int, lo: int = 0, hi: int = 100) -> int:
    return max(lo, min(hi, value))
