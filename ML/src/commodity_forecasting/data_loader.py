from __future__ import annotations

from pathlib import Path
import pandas as pd
from config import COMMODITY_COLUMNS
from .utils import logger

LOG = logger(__name__)


def load_prices(path: str | Path) -> pd.DataFrame:
    frame = pd.read_csv(path)
    aliases = {
        "commodity_name": "commodity", "commodity": "commodity",
        "state": "state", "district": "district", "market": "market",
        "arrival_date": "date", "arrival date": "date", "date": "date",
        "modal": "modal_price", "modal_price": "modal_price",
        "modal_x0020_price": "modal_price",
        "min": "min_price", "min_price": "min_price",
        "min_x0020_price": "min_price",
        "max": "max_price", "max_price": "max_price",
        "max_x0020_price": "max_price",
    }
    frame = frame.rename(columns={
        column: aliases.get(str(column).strip().lower(), column)
        for column in frame.columns
    })
    required = {"commodity", "date", "modal_price"}
    missing = required - set(frame.columns)
    if missing:
        raise ValueError(f"Commodity data is missing required columns: {sorted(missing)}")
    for column in COMMODITY_COLUMNS:
        if column not in frame:
            frame[column] = pd.NA
    return frame[list(COMMODITY_COLUMNS)]
