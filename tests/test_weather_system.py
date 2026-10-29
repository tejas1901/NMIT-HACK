"""
Automated Test Suite for FreightIQ Automatic Weather Forecasting & Route Risk Intelligence System
Tests:
1. OpenMeteoProvider (WMO code mapping, geocoding fallback, corridor waypoints)
2. WeatherRiskEngine (Threshold classification: LOW, MODERATE, HIGH, SEVERE)
3. Database persistence & exception deduplication (shipment_weather_forecasts, shipment_incidents)
4. AutomaticWeatherService end-to-end integration
"""

import unittest
import os
import sys

# Ensure repo root is in python path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.weather_service import OpenMeteoProvider, WeatherRiskEngine, AutomaticWeatherService, WMO_CODE_MAP
from backend.database import (
    init_db,
    get_connection,
    save_weather_forecasts,
    get_shipment_weather_data,
    create_or_update_weather_incident,
    get_all_weather_alerts
)

class TestWeatherProviderAndEngine(unittest.TestCase):
    def setUp(self):
        self.provider = OpenMeteoProvider()
        self.engine = WeatherRiskEngine()

    def test_wmo_code_mapping(self):
        """Verify WMO weather codes map to readable text and descriptive icons."""
        clear = WMO_CODE_MAP.get(0)
        self.assertEqual(clear["condition"], "Clear Sky")
        self.assertEqual(clear["icon"], "☀️")

        heavy_rain = WMO_CODE_MAP.get(65)
        self.assertEqual(heavy_rain["condition"], "Heavy Rain")
        self.assertEqual(heavy_rain["icon"], "🌧️")
        self.assertTrue(heavy_rain["is_severe"])

        storm = WMO_CODE_MAP.get(95)
        self.assertEqual(storm["condition"], "Thunderstorm")
        self.assertEqual(storm["icon"], "⛈️")

    def test_risk_classification_low(self):
        """Verify nominal weather yields LOW risk tier."""
        waypoint_data = {
            "waypoint_name": "Bengaluru Hub",
            "temperature_c": 24.0,
            "precipitation_mm": 0.0,
            "precip_probability_pct": 10,
            "wind_speed_kmh": 12.0,
            "wind_gusts_kmh": 18.0,
            "visibility_m": 10000,
            "weather_code": 0
        }
        eval_result = self.engine.evaluate_waypoint(waypoint_data)
        self.assertEqual(eval_result["risk_tier"], "LOW")
        self.assertIn("Nominal", eval_result["reasons"][0])

    def test_risk_classification_moderate(self):
        """Verify moderate winds or showers trigger MODERATE risk."""
        waypoint_data = {
            "waypoint_name": "Hubballi Bypass",
            "temperature_c": 22.0,
            "precipitation_mm": 3.5,
            "precip_probability_pct": 65,
            "wind_speed_kmh": 28.0,
            "wind_gusts_kmh": 32.0,
            "visibility_m": 4500,
            "weather_code": 61
        }
        eval_result = self.engine.evaluate_waypoint(waypoint_data)
        self.assertEqual(eval_result["risk_tier"], "MODERATE")

    def test_risk_classification_high(self):
        """Verify heavy rainfall or strong crosswinds trigger HIGH risk."""
        waypoint_data = {
            "waypoint_name": "Khandala Ghat",
            "temperature_c": 19.0,
            "precipitation_mm": 12.0,
            "precip_probability_pct": 85,
            "wind_speed_kmh": 40.0,
            "wind_gusts_kmh": 48.0,
            "visibility_m": 1200,
            "weather_code": 63
        }
        eval_result = self.engine.evaluate_waypoint(waypoint_data)
        self.assertEqual(eval_result["risk_tier"], "HIGH")

    def test_risk_classification_severe(self):
        """Verify violent gusts or thunderstorms trigger SEVERE risk."""
        waypoint_data = {
            "waypoint_name": "Mumbai JNPT Port",
            "temperature_c": 28.0,
            "precipitation_mm": 28.0,
            "precip_probability_pct": 95,
            "wind_speed_kmh": 60.0,
            "wind_gusts_kmh": 72.0,
            "visibility_m": 400,
            "weather_code": 95
        }
        eval_result = self.engine.evaluate_waypoint(waypoint_data)
        self.assertEqual(eval_result["risk_tier"], "SEVERE")

    def test_route_synthesis(self):
        """Verify synthesize_route_risk picks worst tier and generates operational recommendations."""
        wp1 = {"waypoint_name": "Origin", "risk_tier": "LOW", "reasons": ["Nominal"]}
        wp2 = {"waypoint_name": "Ghat Pass", "risk_tier": "HIGH", "reasons": ["Strong highway crosswinds 48 km/h"]}
        wp3 = {"waypoint_name": "Destination", "risk_tier": "MODERATE", "reasons": ["Moderate showers"]}

        route_eval = self.engine.synthesize_route_risk([wp1, wp2, wp3])
        self.assertEqual(route_eval["overall_risk_tier"], "HIGH")
        self.assertEqual(route_eval["affected_segment"], "Ghat Pass")
        self.assertIn("ELEVATED RISK on Ghat Pass", route_eval["recommended_action"])

    def test_corridor_sampling(self):
        """Verify corridor waypoints return real highway road stops for Bengaluru -> Mumbai."""
        service = AutomaticWeatherService(provider=self.provider)
        waypoints = service.get_corridor_waypoints("Bengaluru Logistics Hub", "Mumbai JNPT Port")
        self.assertGreaterEqual(len(waypoints), 4)
        names = [w["name"] for w in waypoints]
        self.assertTrue(any("Hubballi" in n for n in names))
        self.assertTrue(any("Khandala" in n for n in names))


class TestDatabaseAndDeduplication(unittest.TestCase):
    def setUp(self):
        init_db()

    def test_save_and_retrieve_forecasts(self):
        """Test persisting waypoint forecasts and retrieving them."""
        test_shipment_id = "TEST-SHP-001"
        test_waypoints = [
            {
                "waypoint_name": "Bengaluru Electronics City",
                "latitude": 12.84,
                "longitude": 77.67,
                "forecast_valid_time": "2026-10-29T12:00:00",
                "provider": "Open-Meteo",
                "retrieval_time": "2026-10-29T06:00:00",
                "temperature_c": 25.5,
                "apparent_temp_c": 26.0,
                "precipitation_mm": 0.2,
                "precip_probability_pct": 20,
                "wind_speed_kmh": 14.0,
                "wind_gusts_kmh": 22.0,
                "visibility_m": 9000,
                "weather_code": 1,
                "condition_text": "Mainly Clear",
                "condition_icon": "🌤️",
                "is_stale": 0
            }
        ]
        test_eval = {
            "overall_risk_tier": "LOW",
            "affected_segment": "Origin to Hub",
            "explanation": "Clear conditions throughout segment.",
            "recommended_action": "Standard operating speed.",
            "all_triggering_factors": ["Clear skies"]
        }

        save_weather_forecasts(test_shipment_id, test_waypoints, test_eval)

        retrieved = get_shipment_weather_data(test_shipment_id)
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved["shipment_id"], test_shipment_id)
        self.assertEqual(len(retrieved["waypoints"]), 1)
        self.assertEqual(retrieved["waypoints"][0]["waypoint_name"], "Bengaluru Electronics City")
        self.assertEqual(retrieved["evaluation"]["risk_tier"], "LOW")

    def test_incident_deduplication(self):
        """Verify multiple poll cycles update the existing incident rather than duplicating rows."""
        shipment_id = "TEST-INC-999"
        eval_high = {
            "overall_risk_tier": "HIGH",
            "affected_segment": "Khandala Ghat Bypass",
            "explanation": "High crosswinds detected on mountain pass.",
            "recommended_action": "Reduce platoon speed to 50 km/h.",
            "evaluation_time": "2026-10-29T06:00:00"
        }

        # First alert creates incident
        create_or_update_weather_incident(shipment_id, eval_high)

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) as cnt FROM shipment_incidents WHERE shipment_id = ?", (shipment_id,))
        count_after_first = cur.fetchone()["cnt"]
        self.assertEqual(count_after_first, 1)

        # Second alert updates same incident without creating duplicate row
        eval_updated = {
            "overall_risk_tier": "HIGH",
            "affected_segment": "Khandala Ghat Bypass",
            "explanation": "Crosswinds increased to 60 km/h.",
            "recommended_action": "Engage driver alert protocol.",
            "evaluation_time": "2026-10-29T06:30:00"
        }
        create_or_update_weather_incident(shipment_id, eval_updated)

        cur.execute("SELECT COUNT(*) as cnt FROM shipment_incidents WHERE shipment_id = ?", (shipment_id,))
        count_after_second = cur.fetchone()["cnt"]
        self.assertEqual(count_after_second, 1)

        cur.execute("SELECT genai_briefing FROM shipment_incidents WHERE shipment_id = ?", (shipment_id,))
        row = cur.fetchone()
        self.assertIn("60 km/h", row["genai_briefing"])
        conn.close()


if __name__ == "__main__":
    unittest.main()
