from __future__ import annotations
import pandas as pd
from config import SPIKE_THRESHOLDS


def buying_window(forecast: pd.DataFrame) -> dict:
    row = forecast.loc[forecast.predicted_price.idxmin()]
    return {"predicted_lowest_price": float(row.predicted_price), "recommended_buying_window": str(row.forecast_date.date()), "reason": "Forecasted price is the lowest in the next-month horizon."}


def selling_window(forecast: pd.DataFrame) -> dict:
    row = forecast.loc[forecast.predicted_price.idxmax()]
    return {"predicted_highest_price": float(row.predicted_price), "potential_selling_window": str(row.forecast_date.date()), "reason": "Forecasted price is the highest in the next-month horizon."}


def price_alert(forecast: pd.DataFrame, recent_average: float) -> dict:
    increase = (forecast.predicted_price.max() - recent_average) / recent_average if recent_average else 0.0
    level = "SPIKE" if increase >= SPIKE_THRESHOLDS["spike"] else "WATCH" if increase >= SPIKE_THRESHOLDS["watch"] else "NORMAL"
    return {"expected_price_increase": float(increase * 100), "alert_level": level, "expected_period": [str(forecast.forecast_date.min().date()), str(forecast.forecast_date.max().date())]}
