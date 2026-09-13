from __future__ import annotations
from pathlib import Path
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from .utils import logger, metrics
LOG = logger(__name__)


def _estimator():
    try:
        from xgboost import XGBRegressor
        return XGBRegressor(n_estimators=250, max_depth=5, learning_rate=0.05, objective="reg:squarederror", random_state=42)
    except Exception as error:
        LOG.warning("XGBoost unavailable (%s); trying LightGBM", error)
        try:
            from lightgbm import LGBMRegressor
            return LGBMRegressor(n_estimators=250, learning_rate=0.05, random_state=42, verbosity=-1)
        except Exception as lightgbm_error:
            LOG.warning("LightGBM unavailable (%s); using sklearn fallback", lightgbm_error)
            return HistGradientBoostingRegressor(max_iter=200, random_state=42)


def train_demand(data: pd.DataFrame, root: Path, target: str = "demand") -> dict:
    excluded = {target}
    features = [c for c in data.columns if c not in excluded]
    X, y = data[features], data[target]
    districts = data["district"].astype(str).drop_duplicates().tolist() if "district" in data else []
    if len(districts) >= 3:
        train_d, valid_d, test_d = districts[:-2], districts[-2:-1], districts[-1:]
        train_mask, valid_mask, test_mask = data.district.isin(train_d), data.district.isin(valid_d), data.district.isin(test_d)
        split = "district holdout"
    else:
        n = len(data); first, second = max(1, int(n * .7)), max(2, int(n * .85))
        train_mask = pd.Series(False, index=data.index); train_mask.iloc[:first] = True
        valid_mask = pd.Series(False, index=data.index); valid_mask.iloc[first:second] = True
        test_mask = ~(train_mask | valid_mask); split = "deterministic row fallback (fewer than 3 districts)"
    numeric = X.select_dtypes(include="number").columns.tolist(); categorical = [c for c in features if c not in numeric]
    transform = ColumnTransformer([("numeric", SimpleImputer(strategy="median"), numeric), ("categorical", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore"))]), categorical)])
    pipeline = Pipeline([("features", transform), ("model", _estimator())])
    pipeline.fit(X[train_mask], y[train_mask])
    valid_pred, test_pred = pipeline.predict(X[valid_mask]), pipeline.predict(X[test_mask])
    result = {"model": pipeline.named_steps["model"].__class__.__name__, "split": split, "training_samples": int(train_mask.sum()), "validation_samples": int(valid_mask.sum()), "testing_samples": int(test_mask.sum()), "validation": metrics(y[valid_mask], valid_pred) if valid_mask.any() else {}, "test": metrics(y[test_mask], test_pred) if test_mask.any() else {}}
    path = root / "models" / "demand" / "demand_model.joblib"; path.parent.mkdir(parents=True, exist_ok=True); joblib.dump({"pipeline": pipeline, "features": features, "target": target}, path)
    print("=" * 50 + "\nDEMAND MODEL TEST\n" + "=" * 50 + f"\nSplit: {split}\nModel: {result['model']}\nTraining samples: {result['training_samples']}\nValidation samples: {result['validation_samples']}\nTesting samples: {result['testing_samples']}\nMAE: {result['test'].get('mae', 0):.2f}\nRMSE: {result['test'].get('rmse', 0):.2f}\nR2: {result['test'].get('r2', 0):.3f}\nSTATUS: DEMAND MODEL TRAINING COMPLETE\n" + "=" * 50)
    return result
