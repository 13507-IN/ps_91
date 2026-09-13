from __future__ import annotations
import pandas as pd
from .utils import logger
LOG = logger(__name__)


def engineer_features(data: pd.DataFrame) -> pd.DataFrame:
    frame = data.copy()
    numeric = frame.select_dtypes(include="number").columns
    missing = [c for c in ("population", "households", "workers", "livestock_count", "crop_area", "literacy_rate", "road_connectivity", "electricity_access", "water_access", "market_distance", "nearest_town_distance", "internet_access") if c not in frame]
    if missing:
        LOG.warning("Missing optional features: %s; imputation will handle them", ", ".join(missing))
    def ratio(name, numerator, denominator):
        if numerator in frame and denominator in frame:
            frame[name] = frame[numerator] / frame[denominator].replace(0, pd.NA)
    ratio("population_density", "population", "crop_area")
    ratio("households_per_person", "households", "population")
    ratio("livestock_per_household", "livestock_count", "households")
    ratio("workers_per_household", "workers", "households")
    ratio("crop_area_per_household", "crop_area", "households")
    ratio("livestock_density", "livestock_count", "population")
    if "literacy_rate" in frame: frame["literacy_ratio"] = frame["literacy_rate"] / 100 if frame["literacy_rate"].max() > 1 else frame["literacy_rate"]
    infrastructure = [c for c in ("road_connectivity", "electricity_access", "water_access", "internet_access") if c in frame]
    if infrastructure: frame["infrastructure_score"] = frame[infrastructure].mean(axis=1)
    access = [c for c in ("market_distance", "nearest_town_distance") if c in frame]
    if access: frame["market_access_score"] = 1 / (1 + frame[access].mean(axis=1).clip(lower=0))
    return frame
