"""
FREIGHTIQ - Automated Weather Scheduler & Background Worker
Periodically queries live Open-Meteo forecasts for all active freight shipments,
evaluates route corridor risk, updates database state, and raises automated
exception alerts when severe/high thresholds are breached.
"""

import os
import sys
import time
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List

# Ensure src and backend are on path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

import database as db
from weather_service import weather_service, WEATHER_ATTRIBUTION

logger = logging.getLogger("freightiq.weather.scheduler")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

# Configurable Refresh Interval in minutes (default: 30 minutes)
REFRESH_INTERVAL_MINUTES = int(os.getenv("WEATHER_REFRESH_INTERVAL_MINUTES", "30"))


class WeatherScheduler:
    """
    Manages automated periodic and event-triggered weather forecast updates
    across active shipments.
    """

    def __init__(self):
        self.is_running = False
        self._lock = asyncio.Lock() if sys.version_info >= (3, 7) else None
        self.last_run_timestamp: str = "Never"
        self.total_runs_count: int = 0
        self.last_sync_results: Dict[str, Any] = {}

    def sync_single_shipment(self, booking: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synchronously fetch and persist weather intelligence for a single shipment.
        """
        ref = booking.get("booking_ref") or booking.get("id")
        origin = booking.get("origin", "Bengaluru Logistics Park")
        destination = booking.get("destination", "Mumbai JNPT Intermodal")

        logger.info(f"[*] Fetching live route weather for Shipment {ref}: {origin} -> {destination}")

        try:
            intel = weather_service.fetch_shipment_weather_intelligence(
                shipment_id=ref,
                origin=origin,
                destination=destination,
            )

            # Persist to SQLite
            db.save_weather_forecasts(
                shipment_id=ref,
                waypoints=intel.get("waypoints", []),
                evaluation=intel.get("evaluation", {}),
            )

            # Update exception incidents deduplicated
            db.create_or_update_weather_incident(
                shipment_id=ref,
                evaluation=intel.get("evaluation", {}),
                booking_info=booking,
            )

            return {
                "success": True,
                "shipment_id": ref,
                "risk_tier": intel.get("evaluation", {}).get("overall_risk_tier"),
                "affected_segment": intel.get("evaluation", {}).get("affected_segment"),
                "explanation": intel.get("evaluation", {}).get("explanation"),
                "attribution": WEATHER_ATTRIBUTION,
            }
        except Exception as e:
            logger.error(f"[!] Weather sync failed for shipment {ref}: {e}")
            return {"success": False, "shipment_id": ref, "error": str(e)}

    def sync_all_active_shipments(self) -> Dict[str, Any]:
        """
        Synchronize live weather for all active bookings in the system.
        """
        bookings = db.get_all_cargo_bookings()
        if not bookings:
            logger.info("[-] No shipments found in database to refresh.")
            return {"status": "NO_SHIPMENTS", "synced_count": 0}

        active = [b for b in bookings if b.get("status") in ("CONFIRMED", "DISPATCHED", "IN_TRANSIT")]
        if not active:
            active = bookings[:4]  # Fallback to recent 4 bookings

        logger.info(f"[*] Starting automated weather sync across {len(active)} active shipments...")
        results = []
        for b in active:
            res = self.sync_single_shipment(b)
            results.append(res)

        now_str = datetime.now(timezone.utc).isoformat()
        self.last_run_timestamp = now_str
        self.total_runs_count += 1
        self.last_sync_results = {
            "last_run": now_str,
            "total_runs": self.total_runs_count,
            "synced_count": len(results),
            "shipments_evaluated": results,
            "attribution": WEATHER_ATTRIBUTION,
            "provider": "Open-Meteo",
        }
        logger.info(f"[+] Automated weather sync completed for {len(results)} shipments.")
        return self.last_sync_results

    async def run_periodic_loop(self):
        """
        Continuous non-blocking background loop for FastAPI.
        """
        self.is_running = True
        logger.info(f"[+] Automated Weather Scheduler started (Refresh Interval: {REFRESH_INTERVAL_MINUTES} mins).")

        # Initial immediate sync on server start
        try:
            await asyncio.to_thread(self.sync_all_active_shipments)
        except Exception as err:
            logger.warning(f"Initial weather sync warning: {err}")

        while self.is_running:
            try:
                # Sleep in intervals of 10s to allow graceful cancellation
                sleep_seconds = REFRESH_INTERVAL_MINUTES * 60
                for _ in range(int(sleep_seconds // 10)):
                    if not self.is_running:
                        break
                    await asyncio.sleep(10)

                if self.is_running:
                    logger.info("[*] Scheduled interval elapsed. Triggering automated weather refresh...")
                    await asyncio.to_thread(self.sync_all_active_shipments)
            except asyncio.CancelledError:
                logger.info("[-] Weather Scheduler loop cancelled.")
                break
            except Exception as e:
                logger.error(f"[!] Unexpected error in weather scheduler loop: {e}")
                await asyncio.sleep(30)


# Global scheduler instance
scheduler = WeatherScheduler()

if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    print("=" * 60)
    print("   FREIGHTIQ AUTOMATED WEATHER SCHEDULER (STANDALONE)")
    print("=" * 60)
    print(f"Refresh Interval: {REFRESH_INTERVAL_MINUTES} minutes")
    print(f"Data Provider:    Open-Meteo API ({WEATHER_ATTRIBUTION})")
    print("[*] Performing immediate test sync on all active shipments...")
    out = scheduler.sync_all_active_shipments()
    print("\nSync Results Summary:")
    print(f"  • Synced Count: {out.get('synced_count')}")
    for s in out.get("shipments_evaluated", []):
        print(f"  • {s.get('shipment_id')}: Tier {s.get('risk_tier')} ({s.get('affected_segment')})")
    print("=" * 60 + "\n")
