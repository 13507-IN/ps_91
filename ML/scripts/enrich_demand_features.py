from pathlib import Path
import sys
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
GOVT = ROOT / "data/raw/govt"


def livestock_key(d: str) -> str:
    return {
        "Barddhaman": "Bardhaman",
        "Dakshin Dinajpur": "Dinajpur Dakshin",
        "Darjiling": "Darjeeling",
        "Haora": "Howrah",
        "Hugli": "Hooghly",
        "Koch Bihar": "Coochbehar",
        "Maldah": "Maldah",
        "North Twenty Four Parganas": "24 Paraganas North",
        "Paschim Medinipur": "Medinipur West",
        "Purba Medinipur": "Medinipur East",
        "Puruliya": "Purulia",
        "South Twenty Four Parganas": "24 Paraganas South",
        "Uttar Dinajpur": "Dinajpur Uttar",
    }.get(d, d)


def crop_key(d: str) -> list[str]:
    if d == "Barddhaman":
        return ["Purba Bardhaman", "Paschim Bardhaman"]
    return [{
        "Darjiling": "Darjeeling",
        "Haora": "Howrah",
        "Hugli": "Hooghly",
        "Koch Bihar": "Cooch Behar",
        "Maldah": "Malda",
        "North Twenty Four Parganas": "North 24 Parganas",
        "Puruliya": "Purulia",
        "South Twenty Four Parganas": "South 24 Parganas",
    }.get(d, d)]


def build_enriched(input_csv: Path, output_csv: Path) -> None:
    demand = pd.read_csv(input_csv)

    livestock = pd.read_csv(GOVT / "wb_livestock_census_2019.csv")
    lv_keep = ["district_name", "livestock_count", "cattle", "buffalo",
               "goat", "sheep", "poultry_count"]
    lv = livestock[lv_keep].rename(
        columns={"district_name": "lv_key", "cattle": "cattle_count",
                 "buffalo": "buffalo_count", "goat": "goat_count", "sheep": "sheep_count"})
    lv_map = {r["lv_key"]: r for _, r in lv.iterrows()}
    demand["lv_key"] = demand["district"].map(livestock_key)
    for col in ["livestock_count", "cattle_count", "buffalo_count", "goat_count",
                "sheep_count", "poultry_count"]:
        demand[col] = demand["lv_key"].map(lambda k: lv_map.get(k, {}).get(col, pd.NA))

    crop = pd.read_csv(GOVT / "wb_crop_area_by_district.csv")
    crop_records = {}
    for _, r in crop.iterrows():
        for key in [str(r["crop_district"])]:
            crop_records[key] = r
    for d, row in demand.iterrows():
        keys = crop_key(row["district"])
        c_rows = [crop_records[k] for k in keys if k in crop_records]
        if not c_rows:
            continue
        paddy = sum(r["paddy_area"] for r in c_rows if pd.notna(r["paddy_area"]))
        jute = sum(r["jute_area"] for r in c_rows if pd.notna(r["jute_area"]))
        total = sum(r["crop_area"] for r in c_rows if pd.notna(r["crop_area"]))
        demand.at[d, "paddy_area"] = paddy
        demand.at[d, "jute_area"] = jute
        demand.at[d, "crop_area"] = total

    demand = demand.drop(columns=["lv_key"])
    demand.to_csv(output_csv, index=False)
    print(f"Wrote {output_csv} ({len(demand)} rows)")
    print("Coverage by feature:")
    for col in ["livestock_count", "cattle_count", "buffalo_count", "goat_count",
                "sheep_count", "poultry_count", "paddy_area", "jute_area", "crop_area"]:
        print(f"  {col}: {demand[col].notna().sum()} / {len(demand)}")


if __name__ == "__main__":
    src = Path(sys.argv[sys.argv.index("--input") + 1]) if "--input" in sys.argv else ROOT / "data/raw/wb_demand_training_data.csv"
    out = Path(sys.argv[sys.argv.index("--output") + 1]) if "--output" in sys.argv else ROOT / "data/raw/wb_demand_training_data_enriched.csv"
    build_enriched(src, out)