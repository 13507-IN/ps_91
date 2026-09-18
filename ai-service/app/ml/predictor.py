"""
ArthSetu — ML Model Predictors.

Loads the joblib bundles written by the ML/ pipeline:

  ML/models/demand/demand_model.joblib        → district-level demand regressor
  ML/models/commodity/<commodity>.joblib       → 30-day commodity price forecaster

Models are loaded lazily and cached.  Predictions never raise: every helper
returns a result object with an ``available`` flag and a human-readable
``reason`` when the model cannot be used, so callers can fall back to
deterministic heuristics.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import structlog

from app.config import settings

logger = structlog.get_logger(__name__)


# ── Shared ──────────────────────────────────────────────────────────────

def _models_dir() -> Path:
    return settings.ML_MODELS_DIR


# ── Demand prediction ───────────────────────────────────────────────────

_DEMAND_BUNDLE = "demand/demand_model.joblib"

# The 14 features the trained demand model expects (single district-level row).
_DEMAND_FEATURES = (
    "district",
    "business_category",
    "population",
    "households",
    "literacy_rate",
    "workers",
    "livestock_count",
    "crop_area",
    "road_connectivity",
    "electricity_access",
    "water_access",
    "market_distance",
    "nearest_town_distance",
    "internet_access",
)

_demand_bundle = None
_demand_unavailable: str | None = None


@dataclass
class DemandMLResult:
    """Outcome of a demand-model prediction."""

    available: bool = False
    daily_demand: float | None = None
    model: str | None = None
    reason: str | None = None
    confidence: str | None = None
    is_synthetic: bool = False
    notes: str | None = None

def _load_demand_bundle():
    """Load (and cache) the demand model bundle once."""
    global _demand_bundle, _demand_unavailable
    if _demand_bundle is not None or _demand_unavailable is not None:
        return _demand_bundle

    path = _models_dir() / _DEMAND_BUNDLE
    if not path.exists():
        _demand_unavailable = f"model missing: {path}"
        return None
    try:
        import joblib

        _demand_bundle = joblib.load(path)
        return _demand_bundle
    except Exception as exc:
        _demand_unavailable = f"load failed: {exc}"
        logger.warning("demand_model_unavailable", error=_demand_unavailable)
        return None


def predict_demand(
    *,
    business_category: str,
    population: int,
    households: int,
    literacy_rate: float | None = None,
    workers: int | None = None,
    livestock_count: float = 0.0,
    crop_area: float | None = None,
    road_connectivity: float = 1.0,
    electricity_access: float = 1.0,
    water_access: float = 1.0,
    market_distance: float = 5.0,
    nearest_town_distance: float = 10.0,
    internet_access: float = 0.5,
    district: str = "Unknown",
    state: str = "West Bengal",
) -> DemandMLResult:
    """
    Predict daily demand (units/day) for a catchment using the trained model.

    Returns ``DemandMLResult(available=False, reason=...)`` if the model is
    missing, corrupt, or inference fails — never raises.
    """
    bundle = _load_demand_bundle()
    if bundle is None:
        return DemandMLResult(available=False, reason=_demand_unavailable or "demand model unavailable")

    try:
        import pandas as pd

        hh = max(households, 100)
        pop = max(population, hh)
        features = list(bundle.get("features", _DEMAND_FEATURES))
        market_distance = 5.0 if market_distance is None else float(market_distance)
        nearest_town_distance = 10.0 if nearest_town_distance is None else float(nearest_town_distance)
        row = {
            "state": state,
            "district": district,
            "business_category": business_category.upper(),
            "population": pop,
            "households": hh,
            "literacy_rate": min(float(literacy_rate or 60.0), 100.0),
            "workers": float(workers) if workers else round(hh * 0.35),
            "livestock_count": float(livestock_count or 0.0),
            "crop_area": float(crop_area) if crop_area else pop / 400.0,
            "road_connectivity": float(road_connectivity or 1.0),
            "electricity_access": float(electricity_access or 1.0),
            "water_access": float(water_access or 1.0),
            "market_distance": market_distance,
            "nearest_town_distance": nearest_town_distance,
            "internet_access": float(internet_access or 0.5),
        }
        frame = pd.DataFrame([[row.get(f, 0) for f in features]], columns=features)
        daily = float(bundle["pipeline"].predict(frame)[0])
        return DemandMLResult(
            available=True,
            daily_demand=max(daily, 0.0),
            model=bundle["pipeline"].named_steps["model"].__class__.__name__,
            confidence="LOW",
            is_synthetic=True,
            notes="WARNING: Demand prediction is driven by a synthetic-trained proxy model and is not calibrated to real-world ground truth.",
        )
    except Exception as exc:
        logger.warning("demand_prediction_failed", error=str(exc))
        return DemandMLResult(available=False, reason=f"prediction failed: {exc}")


# ── Commodity price forecasting ─────────────────────────────────────────

# Mirrors ML/config.py SPIKE_THRESHOLDS
_SPIKE_THRESHOLDS = {"watch": 0.08, "spike": 0.15}


@dataclass
class CommodityForecastResult:
    """Outcome of a commodity price forecast."""

    available: bool = False
    commodity: str | None = None
    last_observed_date: str | None = None
    horizon_days: int | None = None
    daily: list[dict] | None = None
    window_buy: dict | None = None
    window_sell: dict | None = None
    alert: dict | None = None
    reason: str | None = None


def _commodity_bundle_path(commodity: str) -> Path:
    return _models_dir() / "commodity" / f"{commodity}.joblib"


def forecast_commodity(commodity: str, horizon_days: int = 30) -> CommodityForecastResult:
    """
    Forecast the next ``horizon_days`` prices for a single commodity.

    Supports the model kinds written by ML/: ``prophet``, ``arima`` and the
    statistical fallback.  Never raises — returns ``available=False`` with a
    reason when the model cannot be used.
    """
    model_path = _commodity_bundle_path(commodity)
    if not model_path.exists():
        return CommodityForecastResult(
            available=False,
            commodity=commodity,
            reason=f"no trained model for commodity '{commodity}'",
        )

    try:
        import numpy as np
        import pandas as pd
        import joblib

        bundle = joblib.load(model_path)
    except Exception as exc:
        return CommodityForecastResult(
            available=False,
            commodity=commodity,
            reason=f"model load failed: {exc}",
        )

    last_date = pd.Timestamp(bundle.get("last_date"))
    dates = pd.date_range(last_date + pd.Timedelta(days=1), periods=horizon_days, freq="D")

    try:
        kind = bundle.get("kind", "fallback")
        if kind == "prophet":
            output = bundle["model"].predict(pd.DataFrame({"ds": dates}))
            predicted = output.yhat.to_numpy(dtype=float)
            lower = output.yhat_lower.to_numpy(dtype=float)
            upper = output.yhat_upper.to_numpy(dtype=float)
        elif kind == "arima":
            output = bundle["model"].get_forecast(steps=horizon_days)
            predicted = np.asarray(output.predicted_mean, dtype=float)
            interval = output.conf_int(alpha=0.05)
            lower = np.asarray(interval.iloc[:, 0], dtype=float)
            upper = np.asarray(interval.iloc[:, 1], dtype=float)
        else:
            values = np.asarray(bundle.get("values", []), dtype=float)
            predicted = np.resize(values[-min(7, len(values)):], horizon_days)
            spread = max(bundle.get("residual_std", 0.0), float(np.std(values) * 0.05))
            lower, upper = predicted - 1.96 * spread, predicted + 1.96 * spread

        lower = np.clip(lower, 0, None)
        upper = np.clip(upper, 0, None)
        predicted = np.asarray(predicted, dtype=float)

        daily = [
            {
                "date": d.date().isoformat(),
                "predicted_price": round(float(p), 2),
                "lower_bound": round(float(lo), 2),
                "upper_bound": round(float(hi), 2),
            }
            for d, p, lo, hi in zip(dates, predicted, lower, upper)
        ]

        buy_idx = int(np.argmin(predicted))
        sell_idx = int(np.argmax(predicted))
        first = float(predicted[0]) if len(predicted) else 0.0
        increase = (float(predicted.max()) - first) / first if first else 0.0
        alert_level = (
            "SPIKE"
            if increase >= _SPIKE_THRESHOLDS["spike"]
            else "WATCH"
            if increase >= _SPIKE_THRESHOLDS["watch"]
            else "NORMAL"
        )

        return CommodityForecastResult(
            available=True,
            commodity=commodity,
            last_observed_date=last_date.date().isoformat(),
            horizon_days=horizon_days,
            daily=daily,
            window_buy={
                "predicted_lowest_price": float(predicted[buy_idx]),
                "recommended_buying_window": dates[buy_idx].date().isoformat(),
            },
            window_sell={
                "predicted_highest_price": float(predicted[sell_idx]),
                "potential_selling_window": dates[sell_idx].date().isoformat(),
            },
            alert={
                "expected_price_increase_pct": round(increase * 100, 2),
                "alert_level": alert_level,
                "expected_period": [
                    dates[0].date().isoformat(),
                    dates[-1].date().isoformat(),
                ],
            },
        )
    except Exception as exc:
        return CommodityForecastResult(
            available=False,
            commodity=commodity,
            reason=f"prediction failed: {exc}",
        )