from __future__ import annotations
import logging
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def logger(name):
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    return logging.getLogger(name)

def metrics(actual, predicted):
    actual = np.asarray(actual, dtype=float)
    predicted = np.asarray(predicted, dtype=float)
    denominator = (np.abs(actual) + np.abs(predicted)) / 2
    valid = denominator > 1e-9
    return {"mae": float(mean_absolute_error(actual, predicted)), "rmse": float(np.sqrt(mean_squared_error(actual, predicted))), "r2": float(r2_score(actual, predicted)) if len(set(actual)) > 1 else 0.0, "smape": float(np.mean(np.abs(actual[valid] - predicted[valid]) / denominator[valid]) * 100) if valid.any() else 0.0}
