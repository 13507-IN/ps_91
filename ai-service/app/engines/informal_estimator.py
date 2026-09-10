"""
UdyamSetu AI — Informal Business Estimator (Deterministic).

Multi-signal weighted model that estimates the number of informal
(unregistered) businesses in a catchment area.  The LLM never
invents this number — it only interprets the result.

Score composition:
    informal_activity_score =
        livestock_signal     * w1  +
        demand_supply_gap    * w2  +
        community_reports    * w3  +
        population_density   * w4  +
        business_density     * w5

The score is then mapped to a min/max estimate with a confidence tag.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.schemas.input import AssessmentInput, BusinessCategory


@dataclass
class InformalEstimateResult:
    """Result of informal business estimation."""
    min: int
    max: int
    confidence: float       # 0.0 – 1.0
    activity_score: float   # raw composite score
    signals: dict           # individual signal values for transparency


# Category-specific weights: (livestock, gap, reports, pop_density, biz_density)
_CATEGORY_WEIGHTS: dict[str, tuple[float, float, float, float, float]] = {
    "DAIRY":              (0.35, 0.20, 0.20, 0.15, 0.10),
    "FOOD_PROCESSING":    (0.10, 0.25, 0.20, 0.25, 0.20),
    "RETAIL":             (0.05, 0.20, 0.15, 0.35, 0.25),
    "TEXTILES_TAILORING": (0.05, 0.20, 0.20, 0.30, 0.25),
    "POULTRY":            (0.30, 0.25, 0.20, 0.15, 0.10),
    "AGRICULTURE":        (0.20, 0.25, 0.15, 0.20, 0.20),
    "LIVESTOCK":          (0.40, 0.20, 0.20, 0.10, 0.10),
    "TRANSPORT":          (0.05, 0.20, 0.15, 0.30, 0.30),
    "HANDICRAFT":         (0.05, 0.15, 0.25, 0.25, 0.30),
    "SERVICES":           (0.05, 0.20, 0.15, 0.35, 0.25),
    "OTHER":              (0.10, 0.20, 0.20, 0.25, 0.25),
}

# Baseline informal-to-household ratio per category
_BASELINE_RATIO: dict[str, float] = {
    "DAIRY": 1 / 250,
    "FOOD_PROCESSING": 1 / 500,
    "RETAIL": 1 / 150,
    "TEXTILES_TAILORING": 1 / 350,
    "POULTRY": 1 / 800,
    "AGRICULTURE": 1 / 400,
    "LIVESTOCK": 1 / 300,
    "TRANSPORT": 1 / 600,
    "HANDICRAFT": 1 / 500,
    "SERVICES": 1 / 400,
    "OTHER": 1 / 400,
}


def estimate_informal(data: AssessmentInput) -> InformalEstimateResult:
    """
    Estimate informal business count using multi-signal scoring.

    Returns a min/max range with confidence.
    """
    cat = data.business_category.value
    w1, w2, w3, w4, w5 = _CATEGORY_WEIGHTS.get(cat, _CATEGORY_WEIGHTS["OTHER"])

    # Signal 1: Livestock signal (normalised 0–1)
    livestock_signal = _livestock_signal(data, cat)

    # Signal 2: Demand–supply gap (normalised 0–1)
    gap_signal = _demand_supply_gap_signal(data)

    # Signal 3: Community reports (normalised 0–1)
    reports_signal = _reports_signal(data)

    # Signal 4: Population density proxy (normalised 0–1)
    pop_signal = _population_density_signal(data)

    # Signal 5: Known business density (normalised 0–1)
    biz_signal = _business_density_signal(data)

    # Composite score
    activity_score = (
        livestock_signal * w1
        + gap_signal * w2
        + reports_signal * w3
        + pop_signal * w4
        + biz_signal * w5
    )

    # Map score to estimate
    hh = max(data.market.households, 100)
    ratio = _BASELINE_RATIO.get(cat, 1 / 400)
    baseline = hh * ratio

    # Scale baseline by activity score (0.5x at low, 2x at high)
    multiplier = 0.5 + (activity_score * 1.5)
    central = baseline * multiplier

    est_min = max(1, round(central * 0.7))
    est_max = max(est_min + 1, round(central * 1.3))

    # Confidence based on data availability
    data_points = sum([
        data.market.estimated_demand is not None,
        data.market.estimated_supply is not None,
        data.livestock is not None and len(data.livestock) > 0,
        data.competition.reported > 0,
        data.infrastructure is not None,
    ])
    confidence = min(0.90, 0.30 + data_points * 0.12)

    return InformalEstimateResult(
        min=est_min,
        max=est_max,
        confidence=round(confidence, 2),
        activity_score=round(activity_score, 3),
        signals={
            "livestock": round(livestock_signal, 3),
            "demand_supply_gap": round(gap_signal, 3),
            "community_reports": round(reports_signal, 3),
            "population_density": round(pop_signal, 3),
            "business_density": round(biz_signal, 3),
        },
    )


# ── Signal functions ───────────────────────────────────────────────────

def _livestock_signal(data: AssessmentInput, category: str) -> float:
    """Higher if livestock count suggests informal dairy/poultry activity."""
    if not data.livestock:
        return 0.3  # unknown → low-moderate

    total = sum(l.total_count for l in data.livestock)
    milk = sum(l.milk_producing_count or 0 for l in data.livestock)
    hh = max(data.market.households, 1)

    if category in ("DAIRY", "LIVESTOCK"):
        # Milk-producing animals per household
        ratio = milk / hh
        if ratio >= 0.8:
            return 0.95
        elif ratio >= 0.4:
            return 0.75
        elif ratio >= 0.2:
            return 0.55
        elif ratio > 0:
            return 0.35
        return 0.15
    elif category == "POULTRY":
        ratio = total / hh
        if ratio >= 2.0:
            return 0.90
        elif ratio >= 1.0:
            return 0.70
        elif ratio >= 0.3:
            return 0.50
        return 0.25
    else:
        # Livestock not strongly relevant for non-agri categories
        return 0.30


def _demand_supply_gap_signal(data: AssessmentInput) -> float:
    """Higher if demand significantly exceeds supply."""
    demand = data.market.estimated_demand or 0
    supply = data.market.estimated_supply or 0

    if demand <= 0:
        return 0.40  # unknown
    if supply <= 0:
        return 0.80  # all demand unmet → high informal activity likely

    gap_ratio = (demand - supply) / demand
    if gap_ratio >= 0.30:
        return 0.90
    elif gap_ratio >= 0.15:
        return 0.70
    elif gap_ratio >= 0.0:
        return 0.50
    else:
        return 0.30  # supply exceeds demand


def _reports_signal(data: AssessmentInput) -> float:
    """Higher if community has reported many unverified businesses."""
    reported = data.competition.reported
    verified = max(data.competition.verified, 1)

    ratio = reported / verified
    if ratio >= 1.5:
        return 0.90
    elif ratio >= 0.8:
        return 0.70
    elif ratio >= 0.3:
        return 0.50
    elif reported > 0:
        return 0.35
    return 0.20


def _population_density_signal(data: AssessmentInput) -> float:
    """Higher population → more informal economic activity."""
    hh = data.market.households
    if hh >= 5000:
        return 0.95
    elif hh >= 2000:
        return 0.80
    elif hh >= 1000:
        return 0.65
    elif hh >= 500:
        return 0.50
    elif hh >= 200:
        return 0.35
    return 0.20


def _business_density_signal(data: AssessmentInput) -> float:
    """More known businesses → likely more informal ones too."""
    known = data.competition.verified + data.competition.reported
    if known >= 15:
        return 0.90
    elif known >= 8:
        return 0.70
    elif known >= 4:
        return 0.50
    elif known >= 1:
        return 0.35
    return 0.20
