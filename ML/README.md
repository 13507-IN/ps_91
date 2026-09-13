# PS-91 ML Systems

This directory is intentionally self-contained and implements only:

1. Commodity price forecasting, including buy/sell windows and price-spike alerts.
2. Demand prediction for configurable rural business categories.

No existing application file is required or modified. Put database exports in `data/raw/`, or use the included sample data. Column aliases can be mapped in the loader functions or through `config.py`.

## Setup

```powershell
cd ML
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Prophet and XGBoost are preferred when installed. The commodity pipeline falls back to a seasonal-naive/statistical model, and demand falls back to scikit-learn's HistGradientBoostingRegressor.

## Commodity workflow

```powershell
python scripts/prepare_commodity_data.py --input data/sample/commodity_prices_sample.csv
python scripts/train_commodity_model.py --input data/processed/commodity_prices_processed.csv
python scripts/forecast_commodity.py --commodity potato
python scripts/test_commodity_model.py
```

## Demand workflow

```powershell
python scripts/prepare_demand_data.py --input data/sample/demand_sample.csv
python scripts/train_demand_model.py --input data/processed/demand_features_processed.csv
python scripts/predict_demand.py --input data/sample/demand_sample.csv
python scripts/test_demand_model.py
```

Training uses chronological splits for commodity data. Demand uses district holdout splits when at least three districts are available, otherwise a deterministic row split is reported. Generated models and outputs are stored under this directory.
