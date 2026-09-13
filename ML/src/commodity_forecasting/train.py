from __future__ import annotations

from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from .utils import data_signature, logger, metrics, model_path

LOG = logger(__name__)


def _build_model(history: pd.DataFrame):
    try:
        from prophet import Prophet
        model = Prophet(interval_width=0.8, daily_seasonality=False, weekly_seasonality=True, yearly_seasonality=len(history) >= 365)
        model.fit(history.rename(columns={"date": "ds", "modal_price": "y"})[["ds", "y"]])
        return {"kind": "prophet", "model": model}
    except Exception as error:
        LOG.warning("Prophet unavailable (%s); trying ARIMA", error)
        try:
            from statsmodels.tsa.arima.model import ARIMA
            values = history["modal_price"].to_numpy(float)
            return {"kind": "arima", "model": ARIMA(values, order=(1, 1, 0)).fit(), "values": values}
        except Exception as arima_error:
            LOG.warning("ARIMA unavailable (%s); using seasonal-naive fallback", arima_error)
            values = history["modal_price"].to_numpy(float)
            return {"kind": "seasonal_naive", "values": values, "dates": history["date"].tolist(), "residual_std": float(np.std(np.diff(values))) if len(values) > 1 else 0.0}


def _predict(bundle: dict, dates: pd.Series | list) -> np.ndarray:
    if bundle["kind"] == "prophet":
        forecast = bundle["model"].predict(pd.DataFrame({"ds": pd.to_datetime(dates)}))
        return forecast["yhat"].to_numpy()
    if bundle["kind"] == "arima":
        return bundle["model"].forecast(steps=len(dates))
    values = np.asarray(bundle["values"], dtype=float)
    horizon = len(dates)
    season = min(7, len(values))
    return np.resize(values[-season:], horizon)


def train_commodity(history: pd.DataFrame, root: Path, commodity: str) -> dict:
    data = history[history["commodity"].eq(commodity)].sort_values("date").reset_index(drop=True)
    if len(data) < 8:
        raise ValueError(f"{commodity} needs at least 8 records, found {len(data)}")
    first = int(len(data) * 0.70)
    second = int(len(data) * 0.85)
    splits = {"train": data.iloc[:first], "validation": data.iloc[first:second], "test": data.iloc[second:]}
    bundle = _build_model(splits["train"])
    validation_pred = _predict(bundle, splits["validation"]["date"])
    test_pred = _predict(bundle, splits["test"]["date"])
    result = {"commodity": commodity, "records": len(data), "model": bundle["kind"], "training_period": [str(splits["train"].date.min().date()), str(splits["train"].date.max().date())], "validation_period": [str(splits["validation"].date.min().date()), str(splits["validation"].date.max().date())], "testing_period": [str(splits["test"].date.min().date()), str(splits["test"].date.max().date())], "validation": metrics(splits["validation"].modal_price, validation_pred), "test": metrics(splits["test"].modal_price, test_pred)}
    bundle.update({"commodity": commodity, "last_date": data.date.max(), "history": data, "data_signature": data_signature(data)})
    path = model_path(root, commodity)
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, path)
    print("=" * 50 + "\nCOMMODITY MODEL TRAINING\n" + "=" * 50)
    print(f"Commodity: {commodity}\nRecords: {len(data)}\nTraining period: {result['training_period'][0]} -> {result['training_period'][1]}\nValidation period: {result['validation_period'][0]} -> {result['validation_period'][1]}\nTesting period: {result['testing_period'][0]} -> {result['testing_period'][1]}\nModel: {bundle['kind']}\nMAE: {result['test']['mae']:.2f}\nRMSE: {result['test']['rmse']:.2f}\nMAPE: {result['test']['mape']:.2f}%\nSTATUS: MODEL TRAINING COMPLETE\n" + "=" * 50)
    return result
