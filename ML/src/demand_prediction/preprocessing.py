from __future__ import annotations
import pandas as pd
from .utils import logger
LOG = logger(__name__)

def validate_and_clean(data: pd.DataFrame, target: str = "demand") -> pd.DataFrame:
    frame = data.copy()
    frame[target] = pd.to_numeric(frame[target], errors="coerce")
    frame = frame.dropna(subset=[target]).drop_duplicates()
    frame = frame[frame[target] >= 0]
    numeric = frame.select_dtypes(include="number").columns
    frame[list(numeric)] = frame[list(numeric)].replace([float("inf"), float("-inf")], pd.NA)
    LOG.info("Validated demand data; %d rows remain", len(frame))
    return frame
