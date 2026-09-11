"""
ArthSetu — Risk Scorer (Deterministic).

Computes a risk_score (0-100) from structured financial and market
inputs.  Higher score = higher risk.
"""

from __future__ import annotations

from app.schemas.input import AssessmentInput


def compute_risk_score(data: AssessmentInput) -> int:
    """Return an integer risk score 0–100 (higher = riskier)."""

    financial_risk = _financial_risk(data)
    competition_risk = _competition_risk(data)
    infrastructure_risk = _infrastructure_risk(data)
    market_risk = _market_risk(data)
    concentration_risk = _concentration_risk(data)

    raw = (
        financial_risk * 0.30
        + competition_risk * 0.20
        + infrastructure_risk * 0.15
        + market_risk * 0.20
        + concentration_risk * 0.15
    )

    return _clamp(round(raw * 100))


# ── Private helpers ────────────────────────────────────────────────────

def _financial_risk(data: AssessmentInput) -> float:
    """0.0 – 1.0 based on debt-to-capital and EMI burden."""
    fin = data.financial

    # Loan-to-project ratio
    if fin.project_cost <= 0:
        return 0.50
    leverage = fin.loan / fin.project_cost

    risk = 0.0

    # High leverage = high risk
    if leverage >= 0.95:
        risk += 0.40
    elif leverage >= 0.85:
        risk += 0.25
    elif leverage >= 0.70:
        risk += 0.15
    else:
        risk += 0.05

    # EMI burden relative to revenue
    if fin.monthly_emi and fin.monthly_revenue_estimate:
        emi_ratio = fin.monthly_emi / max(fin.monthly_revenue_estimate, 1)
        if emi_ratio >= 0.40:
            risk += 0.40
        elif emi_ratio >= 0.25:
            risk += 0.25
        elif emi_ratio >= 0.15:
            risk += 0.15
        else:
            risk += 0.05
    else:
        risk += 0.15  # unknown EMI burden

    # Capital adequacy
    if fin.margin < fin.project_cost * 0.10:
        risk += 0.20
    elif fin.margin < fin.project_cost * 0.15:
        risk += 0.10

    return min(1.0, risk)


def _competition_risk(data: AssessmentInput) -> float:
    """Higher competition = higher risk."""
    total = data.competition.verified + data.competition.reported
    if data.competition.estimated_informal:
        total += (data.competition.estimated_informal.min + data.competition.estimated_informal.max) // 2

    hh = max(data.market.households, 1)
    per_1000 = (total / hh) * 1000

    if per_1000 >= 15:
        return 0.90
    elif per_1000 >= 8:
        return 0.70
    elif per_1000 >= 4:
        return 0.50
    elif per_1000 >= 2:
        return 0.30
    return 0.15


def _infrastructure_risk(data: AssessmentInput) -> float:
    """Missing infrastructure = higher risk."""
    if not data.infrastructure:
        return 0.55

    infra = data.infrastructure
    problems = 0
    checks = 0

    for flag in [
        infra.has_electricity,
        infra.has_mobile_network,
        infra.has_bus_service,
        infra.has_bank_branch,
    ]:
        if flag is not None:
            checks += 1
            if not flag:
                problems += 1

    if infra.nearest_town_km is not None:
        checks += 1
        if infra.nearest_town_km > 20:
            problems += 1

    if checks == 0:
        return 0.50

    return min(1.0, problems / checks)


def _market_risk(data: AssessmentInput) -> float:
    """Risk from demand uncertainty or oversupply."""
    demand = data.market.estimated_demand
    supply = data.market.estimated_supply

    if demand is None or demand <= 0:
        return 0.60  # unknown demand → moderate-high risk

    if supply is None or supply <= 0:
        return 0.30  # demand exists, no known supply → lower risk

    ratio = supply / demand
    if ratio >= 1.3:
        return 0.85  # oversupply
    elif ratio >= 1.0:
        return 0.55
    elif ratio >= 0.7:
        return 0.30
    return 0.15  # significant unmet demand


def _concentration_risk(data: AssessmentInput) -> float:
    """Risk from small market size / customer concentration."""
    hh = data.market.households
    if hh < 200:
        return 0.85
    elif hh < 500:
        return 0.65
    elif hh < 1000:
        return 0.45
    elif hh < 3000:
        return 0.30
    return 0.15


def _clamp(value: int, lo: int = 0, hi: int = 100) -> int:
    return max(lo, min(hi, value))
