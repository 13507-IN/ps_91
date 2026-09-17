from __future__ import annotations
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from config import FORECAST_HORIZON_DAYS
from .utils import data_signature, model_path


def forecast_next_month(root: Path, commodity: str, horizon: int = FORECAST_HORIZON_DAYS) -> pd.DataFrame:
    bundle = joblib.load(model_path(root, commodity))
    processed_path = root / "data" / "processed" / "commodity_prices_processed.csv"
    if processed_path.exists():
        processed = pd.read_csv(processed_path, usecols=["commodity", "date"])
        processed["date"] = pd.to_datetime(processed["date"], errors="coerce")
        current_dates = processed.loc[processed["commodity"].eq(commodity), "date"].dropna()
        if current_dates.empty:
            raise ValueError(f"No processed records found for commodity '{commodity}'.")
        current_last_date = current_dates.max()
        model_last_date = pd.Timestamp(bundle["last_date"])
        if current_last_date != model_last_date:
            raise RuntimeError(
                f"Model for {commodity} is stale: it ends on {model_last_date.date()}, "
                f"but processed data ends on {current_last_date.date()}. "
                "Retrain the model before forecasting."
            )
        current_data = pd.read_csv(processed_path)
        current_data["date"] = pd.to_datetime(current_data["date"], errors="coerce")
        current_data = current_data[current_data["commodity"].eq(commodity)]
        if bundle.get("data_signature") != data_signature(current_data):
            raise RuntimeError(
                f"Model for {commodity} does not match the current processed data. "
                "Retrain the model before forecasting."
            )
    dates = pd.date_range(pd.Timestamp(bundle["last_date"]) + pd.Timedelta(days=1), periods=horizon, freq="D")
    if bundle["kind"] == "prophet":
        output = bundle["model"].predict(pd.DataFrame({"ds": dates}))
        predicted = output.yhat.to_numpy(); lower = output.yhat_lower.to_numpy(); upper = output.yhat_upper.to_numpy()
    elif bundle["kind"] == "arima":
        output = bundle["model"].get_forecast(steps=horizon)
        predicted = np.asarray(output.predicted_mean, dtype=float)
        interval = output.conf_int(alpha=0.05)
        lower = np.asarray(interval.iloc[:, 0], dtype=float)
        upper = np.asarray(interval.iloc[:, 1], dtype=float)
    else:
        predicted = np.resize(bundle["values"][-min(7, len(bundle["values"])):], horizon)
        spread = max(bundle.get("residual_std", 0.0), float(np.std(bundle["values"]) * 0.05))
        lower, upper = predicted - 1.96 * spread, predicted + 1.96 * spread
    return pd.DataFrame({"commodity": commodity, "forecast_date": dates, "predicted_price": predicted, "lower_bound": lower.clip(0), "upper_bound": upper})
