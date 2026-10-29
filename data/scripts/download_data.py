"""
FREIGHTIQ - Data Acquisition Script
Downloads open-access maritime, port weather, and supply chain sample datasets.
Supports Kaggle API if credentials exist (~/.kaggle/kaggle.json or KAGGLE_USERNAME / KAGGLE_KEY).
Also fetches open historical weather samples from Open-Meteo Historical Archive.
"""

import os
import json
import logging
import urllib.request
import pandas as pd
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("data_download")

RAW_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "raw")
os.makedirs(RAW_DIR, exist_ok=True)

# Reference maritime ports for historical weather benchmarking
MAJOR_PORTS = [
    {"name": "INNSA_JNPT", "lat": 18.9499, "lon": 72.9515},
    {"name": "INMAA_Chennai", "lat": 13.0827, "lon": 80.2707},
    {"name": "INMUN_Mundra", "lat": 22.8395, "lon": 69.7042},
    {"name": "NLRTM_Rotterdam", "lat": 51.9244, "lon": 4.4777},
    {"name": "SGSIN_Singapore", "lat": 1.3521, "lon": 103.8198},
    {"name": "USSAV_Savannah", "lat": 32.0809, "lon": -81.0912},
]


def download_open_meteo_historical():
    """Download historical weather baseline from Open-Meteo Archive API (Open-Meteo is free & open access)."""
    logger.info("Downloading historical weather baseline from Open-Meteo Archive API...")
    end_date = (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")
    start_date = (datetime.utcnow() - timedelta(days=37)).strftime("%Y-%m-%d")

    weather_records = []
    for port in MAJOR_PORTS:
        url = (
            f"https://archive-api.open-meteo.com/v1/archive?"
            f"latitude={port['lat']}&longitude={port['lon']}&"
            f"start_date={start_date}&end_date={end_date}&"
            f"hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_gusts_10m,surface_pressure&"
            f"timezone=UTC"
        )
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "FreightIQ-DataAcquisition/1.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                hourly = data.get("hourly", {})
                times = hourly.get("time", [])
                temps = hourly.get("temperature_2m", [])
                precips = hourly.get("precipitation", [])
                winds = hourly.get("wind_speed_10m", [])
                gusts = hourly.get("wind_gusts_10m", [])
                pressures = hourly.get("surface_pressure", [])

                for i, t in enumerate(times):
                    weather_records.append({
                        "port_id": port["name"],
                        "latitude": port["lat"],
                        "longitude": port["lon"],
                        "timestamp": t,
                        "temperature_c": temps[i] if i < len(temps) else None,
                        "precipitation_mm": precips[i] if i < len(precips) else 0.0,
                        "wind_speed_kmh": winds[i] if i < len(winds) else 0.0,
                        "wind_gusts_kmh": gusts[i] if i < len(gusts) else 0.0,
                        "pressure_hpa": pressures[i] if i < len(pressures) else 1013.25
                    })
            logger.info(f"Downloaded {len(times)} weather hourly records for {port['name']}")
        except Exception as e:
            logger.warning(f"Could not download weather for {port['name']}: {e}")

    if weather_records:
        df = pd.DataFrame(weather_records)
        out_csv = os.path.join(RAW_DIR, "port_weather_historical_openmeteo.csv")
        df.to_csv(out_csv, index=False)
        logger.info(f"Saved {len(df)} historical weather records to {out_csv}")
        return out_csv
    return None


def check_kaggle_dataset():
    """Attempt Kaggle download if credentials are present, else log instructions."""
    kaggle_json = os.path.expanduser("~/.kaggle/kaggle.json")
    has_creds = os.path.exists(kaggle_json) or (
        os.getenv("KAGGLE_USERNAME") and os.getenv("KAGGLE_KEY")
    )

    if has_creds:
        try:
            logger.info("Found Kaggle credentials. Attempting to download supply chain dataset...")
            import kaggle  # type: ignore
            kaggle.api.dataset_download_files(
                "shashwatwork/dataco-smart-supply-chain-for-big-data-analysis",
                path=RAW_DIR,
                unzip=True,
            )
            logger.info("Successfully fetched Kaggle DataCo supply chain dataset.")
            return True
        except Exception as err:
            logger.warning(f"Kaggle download failed: {err}")
    else:
        logger.info(
            "No Kaggle credentials configured (KAGGLE_USERNAME/KEY or ~/.kaggle/kaggle.json). "
            "Proceeding with reproducible high-fidelity synthetic supply-chain generation."
        )
    return False


if __name__ == "__main__":
    download_open_meteo_historical()
    check_kaggle_dataset()
    logger.info("Data download script completed.")
