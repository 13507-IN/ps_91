from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parents[1]; sys.path.insert(0, str(ROOT)); sys.path.insert(0, str(ROOT / "src"))
from config import OUTPUTS_DIR
from src.commodity_forecasting.forecast import forecast_next_month
from src.commodity_forecasting.signals import buying_window, selling_window, price_alert
if __name__ == "__main__":
    commodity = sys.argv[sys.argv.index("--commodity") + 1]
    forecast = forecast_next_month(ROOT, commodity); output = OUTPUTS_DIR / "commodity" / f"{commodity}_forecast.csv"; forecast.to_csv(output, index=False)
    print(buying_window(forecast)); print(selling_window(forecast)); print(price_alert(forecast, forecast.predicted_price.iloc[0])); print(f"Saved {output}")
