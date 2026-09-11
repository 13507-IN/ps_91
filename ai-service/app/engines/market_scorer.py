"""
ArthSetu — Market Scorer (Deterministic).

Computes a market_score (0-100) from structured inputs using a
weighted formula.  The LLM never decides this number.

Formula:
    market_score = (
        demand_factor     * 0.30  +
        population_factor * 0.20  +
        competition_factor* 0.25  +
        infra_factor      * 0.15  +
        pricing_factor    * 0.10
    ) * 100
"""

from __future__ import annotations

from app.schemas.input import AssessmentInput


def compute_market_score(data: AssessmentInput) -> int:
    """Return an integer market score 0–100."""

    demand_factor = _demand_factor(data)
    population_factor = _population_factor(data)
    competition_factor = _competition_factor(data)
    infra_factor = _infrastructure_factor(data)
    pricing_factor = _pricing_factor(data)

    raw = (
        demand_factor * 0.30
        + population_factor * 0.20
        + competition_factor * 0.25
        + infra_factor * 0.15
        + pricing_factor * 0.10
    )

    return _clamp(round(raw * 100))


# ── Private helpers ────────────────────────────────────────────────────

def _demand_factor(data: AssessmentInput) -> float:
    """0.0 – 1.0 based on demand vs supply gap."""
    demand = data.market.estimated_demand or 0
    supply = data.market.estimated_supply or 0

    if demand <= 0:
        # No demand data — default moderate
        return 0.5

    if supply <= 0:
        # Demand exists, no known supply → strong signal
        return 0.9

    gap_ratio = (demand - supply) / demand
    # gap_ratio > 0 means unmet demand
    if gap_ratio >= 0.3:
        return 0.95
    elif gap_ratio >= 0.15:
        return 0.80
    elif gap_ratio >= 0.0:
        return 0.65
    elif gap_ratio >= -0.15:
        return 0.45  # slight oversupply
    else:
        return 0.25  # significant oversupply


def _population_factor(data: AssessmentInput) -> float:
    """0.0 – 1.0 based on catchment population size."""
    pop = data.market.population
    hh = data.market.households

    if pop >= 20000:
        return 0.95
    elif pop >= 10000:
        return 0.85
    elif pop >= 5000:
        return 0.70
    elif pop >= 2000:
        return 0.55
    elif pop >= 500:
        return 0.40
    elif hh >= 100:
        return 0.35
    else:
        return 0.20


def _competition_factor(data: AssessmentInput) -> float:
    """0.0 – 1.0 (inverse: low competition → high factor)."""
    total_known = data.competition.verified + data.competition.reported
    informal_mid = 0
    if data.competition.estimated_informal:
        informal_mid = (
            data.competition.estimated_informal.min
            + data.competition.estimated_informal.max
        ) / 2

    total_estimated = total_known + informal_mid
    hh = max(data.market.households, 1)

    # Competitors per 1000 households
    density = (total_estimated / hh) * 1000

    if density <= 1:
        return 0.95  # very low competition
    elif density <= 3:
        return 0.80
    elif density <= 6:
        return 0.60
    elif density <= 10:
        return 0.40
    elif density <= 20:
        return 0.25
    else:
        return 0.15  # heavily saturated


def _infrastructure_factor(data: AssessmentInput) -> float:
    """0.0 – 1.0 based on available infrastructure."""
    if not data.infrastructure:
        return 0.50  # unknown → moderate default

    infra = data.infrastructure
    score = 0.0
    checks = 0

    for flag, weight in [
        (infra.has_electricity, 0.25),
        (infra.has_mobile_network, 0.15),
        (infra.has_bank_branch, 0.15),
        (infra.has_bus_service, 0.10),
        (infra.has_internet, 0.10),
        (infra.has_atm, 0.05),
        (infra.has_post_office, 0.05),
        (infra.has_cold_storage, 0.10),
        (infra.has_phc, 0.05),
    ]:
        if flag is not None:
            checks += 1
            if flag:
                score += weight

    # Road proximity bonus
    if infra.nearest_town_km is not None:
        checks += 1
        if infra.nearest_town_km <= 5:
            score += 0.10
        elif infra.nearest_town_km <= 15:
            score += 0.05

    if checks == 0:
        return 0.50

    # Normalise: max possible score is ~1.10, scale to 0-1
    return min(1.0, score / 0.95)


def _pricing_factor(data: AssessmentInput) -> float:
    """0.0 – 1.0 based on pricing margin headroom."""
    if not data.pricing or data.pricing.min is None or data.pricing.max is None:
        return 0.50  # no data → moderate

    spread = data.pricing.max - data.pricing.min
    mid = (data.pricing.max + data.pricing.min) / 2

    if mid <= 0:
        return 0.50

    spread_ratio = spread / mid

    # Wider spread means more pricing flexibility
    if spread_ratio >= 0.20:
        return 0.85
    elif spread_ratio >= 0.10:
        return 0.70
    elif spread_ratio >= 0.05:
        return 0.55
    else:
        return 0.40  # tight market, little flexibility


def _clamp(value: int, lo: int = 0, hi: int = 100) -> int:
    return max(lo, min(hi, value))
