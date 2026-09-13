from __future__ import annotations

import pandas as pd
from config import COMMODITY_FREQUENCY, OUTLIER_ZSCORE
from .utils import logger

LOG = logger(__name__)


def clean_prices(frame: pd.DataFrame, frequency: str = COMMODITY_FREQUENCY) -> pd.DataFrame:
    data = frame.copy()
    before = len(data)
    data["date"] = pd.to_datetime(data["date"], errors="coerce", dayfirst=True)
    data["modal_price"] = pd.to_numeric(data["modal_price"], errors="coerce")
    data = data.dropna(subset=["commodity", "date", "modal_price"])
    data = data[data["modal_price"] > 0]
    data = data.drop_duplicates()
    LOG.info("Parsed dates, removed %d invalid/duplicate rows", before - len(data))
    data["commodity"] = data["commodity"].astype(str).str.strip().str.lower()
    data = data.sort_values(["commodity", "date"])
    grouped = []
    for commodity, group in data.groupby("commodity", sort=False):
        group = group.set_index("date").sort_index()
        numeric = group[["modal_price"]].resample(frequency).median()
        numeric["commodity"] = commodity
        for column in ("market", "district", "state"):
            numeric[column] = group[column].resample(frequency).last().ffill().bfill() if column in group else ""
        numeric["modal_price"] = numeric["modal_price"].interpolate(limit_direction="both")
        rolling_median = numeric["modal_price"].rolling(7, center=True, min_periods=1).median()
        deviation = (numeric["modal_price"] - rolling_median).abs()
        mad = deviation.median()
        if mad > 0:
            outliers = deviation > OUTLIER_ZSCORE * mad
            numeric.loc[outliers, "modal_price"] = rolling_median[outliers]
            LOG.info("%s: replaced %d robust outliers", commodity, int(outliers.sum()))
        grouped.append(numeric.reset_index())
    if not grouped:
        return pd.DataFrame(columns=["date", "commodity", "modal_price"])
    return pd.concat(grouped, ignore_index=True).sort_values(["commodity", "date"])
