from __future__ import annotations
from pathlib import Path
import pandas as pd
from config import DEMAND_TARGET
from .utils import logger
LOG = logger(__name__)

def load_demand(path: str | Path, target: str = DEMAND_TARGET) -> pd.DataFrame:
    data = pd.read_csv(path)
    aliases = {"category": "business_category", "target": target, "estimated_demand": target}
    data = data.rename(columns={c: aliases.get(c, c) for c in data.columns})
    if target not in data:
        raise ValueError(f"Demand data must include target column '{target}'")
    if "business_category" not in data:
        data["business_category"] = "general"
    if "district" not in data:
        data["district"] = "unknown"
    LOG.info("Loaded %d demand rows and %d columns", len(data), len(data.columns))
    return data
