"""
ArthSetu — ML Model Integration.

Lazy-loads trained model artifacts produced by the ML/ pipeline and exposes
prediction helpers to the API routes.  Heavy imports (pandas, numpy, joblib,
scikit-learn, xgboost, prophet) are deferred so the service starts fast and
degrades gracefully when a model or dependency is unavailable.
"""

from app.ml.predictor import (
    DemandMLResult,
    CommodityForecastResult,
    predict_demand,
    forecast_commodity,
)

__all__ = [
    "DemandMLResult",
    "CommodityForecastResult",
    "predict_demand",
    "forecast_commodity",
]