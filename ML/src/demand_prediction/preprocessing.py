from __future__ import annotations
import pandas as pd
from .utils import logger
LOG = logger(__name__)

def validate_and_clean(data: pd.DataFrame, target: str = "demand") -> pd.DataFrame:
    frame = data.copy()
    numeric_columns = [
        target, "population", "households", "literacy_rate", "workers",
        "livestock_count", "cattle_count", "buffalo_count", "goat_count",
        "sheep_count", "poultry_count", "crop_area", "paddy_area", "jute_area",
        "potato_area", "road_connectivity", "electricity_access", "water_access",
        "market_distance", "nearest_town_distance", "internet_access",
    ]
    for column in numeric_columns:
        if column in frame:
            frame[column] = pd.to_numeric(frame[column], errors="coerce")
    frame = frame.dropna(subset=[target]).drop_duplicates()
    frame = frame[frame[target] >= 0]
    numeric = frame.select_dtypes(include="number").columns
    frame[list(numeric)] = frame[list(numeric)].replace([float("inf"), float("-inf")], pd.NA)
    LOG.info("Validated demand data; %d rows remain", len(frame))
    return frame
