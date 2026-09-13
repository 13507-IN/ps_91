from __future__ import annotations

import hashlib
import logging
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error


def logger(name: str) -> logging.Logger:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    return logging.getLogger(name)


def metrics(actual, predicted) -> dict[str, float]:
    actual = np.asarray(actual, dtype=float)
    predicted = np.asarray(predicted, dtype=float)
    nonzero = np.abs(actual) > 1e-9
    return {
        "mae": float(mean_absolute_error(actual, predicted)),
        "rmse": float(np.sqrt(mean_squared_error(actual, predicted))),
        "mape": float(np.mean(np.abs((actual[nonzero] - predicted[nonzero]) / actual[nonzero])) * 100) if nonzero.any() else 0.0,
    }


def model_path(root: Path, commodity: str) -> Path:
    safe = "".join(c if c.isalnum() or c in "-_" else "_" for c in commodity.lower())
    return root / "models" / "commodity" / f"{safe}.joblib"


def data_signature(data: pd.DataFrame) -> str:
    columns = ["date", "modal_price", "market", "district", "state"]
    available = [column for column in columns if column in data]
    stable = data[available].sort_values(available).reset_index(drop=True)
    return hashlib.sha256(pd.util.hash_pandas_object(stable, index=False).values.tobytes()).hexdigest()
