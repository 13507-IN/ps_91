# PS-91 ML Systems

This directory is intentionally self-contained and implements only:

1. Commodity price forecasting, including buy/sell windows and price-spike alerts.
2. Demand prediction for configurable rural business categories.

No existing application file is required or modified. Put database exports in `data/raw/`, or use the included sample data. Column aliases can be mapped in the loader functions or through `config.py`.

## Where to add real data

Place downloaded government files here before running the preparation commands:

```text
ML/data/raw/commodity_prices.csv
ML/data/raw/demand_training_data.csv
```

Commodity data must contain at least:

```text
commodity,date,market,district,state,min_price,max_price,modal_price
```

Demand data must contain at least:

```text
district,business_category,demand
```

Demand data can also include population, household, employment, livestock,
crop-area, infrastructure, and distance columns. The commodity loader accepts
common government aliases such as `arrival_date`, `modal`, `min`, and `max`.
Keep downloaded files in `data/raw/`; files under `data/processed/` are
generated and should not be edited manually.

Recommended sources are AGMARKNET for daily market prices and arrivals,
data.gov.in for government datasets, Census India and MoSPI for demographic
features, and IMD for weather features.

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

With real data, run:

```powershell
python scripts/prepare_commodity_data.py --input data/raw/commodity_prices.csv
python scripts/train_commodity_model.py --input data/processed/commodity_prices_processed.csv --commodity potato
python scripts/prepare_demand_data.py --input data/raw/demand_training_data.csv
python scripts/train_demand_model.py
```

Training uses chronological splits for commodity data. Demand uses district holdout splits when at least three districts are available, otherwise a deterministic row split is reported. Generated models and outputs are stored under this directory.
