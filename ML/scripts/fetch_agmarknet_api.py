"""Fetch historical commodity price data from the data.gov.in AGMARKNET API."""
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

BASE = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
DEFAULT_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"


def fetch_page(api_key: str, params: dict, offset: int, limit: int) -> dict:
    query = {
        "api-key": api_key,
        "format": "json",
        "offset": offset,
        "limit": limit,
    }
    query.update(params)
    url = f"{BASE}?{urllib.parse.urlencode(query)}"
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def fetch_all(api_key: str, params: dict, limit: int = 10000, max_records: int | None = None) -> list[dict]:
    records: list[dict] = []
    offset = 0
    while True:
        payload = fetch_page(api_key, params, offset, limit)
        page = payload.get("records", [])
        records.extend(page)
        total = int(payload.get("total", 0))
        offset += len(page)
        if not page or offset >= total:
            break
        if max_records is not None and len(records) >= max_records:
            records = records[:max_records]
            break
        time.sleep(0.5)
    return records


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--key", default=DEFAULT_KEY)
    parser.add_argument("--state", default="West Bengal")
    parser.add_argument("--commodity", default=None)
    parser.add_argument("--commodities", default=None, help="comma-separated list")
    parser.add_argument("--date-from", default=None, help="DD/MM/YYYY")
    parser.add_argument("--date-to", default=None, help="DD/MM/YYYY")
    parser.add_argument("--output", required=True)
    parser.add_argument("--limit", type=int, default=10000)
    parser.add_argument("--max-records", type=int, default=None)
    args = parser.parse_args()

    filters = {}
    if args.state:
        filters["state"] = args.state
    commodities = [args.commodity] if args.commodity else ([c.strip() for c in args.commodities.split(",") if c.strip()] if args.commodities else None)
    if args.date_from:
        filters["arrival_date"] = f">={args.date_from}"
    if args.date_to:
        filters["arrival_date"] = args.date_to

    if commodities:
        all_records: list[dict] = []
        for commodity in commodities:
            page_filters = dict(filters)
            page_filters["commodity"] = commodity
            sys.stderr.write(f"Fetching {commodity}...\n")
            records = fetch_all(args.key, page_filters, args.limit, args.max_records)
            all_records.extend(records)
            sys.stderr.write(f"  {commodity}: {len(records)} records\n")
    else:
        all_records = fetch_all(args.key, filters, args.limit, args.max_records)

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as handle:
        json.dump(all_records, handle)
    print(f"Saved {len(all_records)} records to {output}")


if __name__ == "__main__":
    main()