from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parents[1]; sys.path.insert(0, str(ROOT)); sys.path.insert(0, str(ROOT / "src"))
from src.commodity_forecasting.data_loader import load_prices
from src.commodity_forecasting.preprocessing import clean_prices
from src.commodity_forecasting.train import train_commodity
if __name__ == "__main__":
    data = clean_prices(load_prices(ROOT / "data/sample/commodity_prices_sample.csv")); train_commodity(data, ROOT, data.commodity.iloc[0]); print("Commodity smoke test passed")
