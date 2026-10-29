import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    resp = client.get("/ml/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "HEALTHY"
    assert "models_loaded" in data

def test_demurrage_predict():
    payload = {
        "port": "IN-BOM",
        "carrier": "Ground Priority Freight",
        "container_type": "40ft High Cube Dry",
        "eta": "2026-10-31T18:00:00",
        "dwell_days_so_far": 3.0,
        "weather_risk": 45.0,
        "congestion_index": 1.4,
        "customs_flags": False,
        "day_of_week": 3,
        "season": "AUTUMN",
        "cargo_value": 200000.0
    }
    resp = client.post("/ml/demurrage/predict", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "demurrage_probability" in data
    assert "risk_level" in data
    assert "expected_dwell_days" in data
    assert "estimated_cost" in data
    assert len(data["top_shap_contributions"]) > 0

def test_demurrage_metrics():
    resp = client.get("/ml/demurrage/metrics")
    assert resp.status_code == 200
    data = resp.json()
    assert "roc_auc" in data
    assert "rmse_days" in data
    assert "accuracy" in data

def test_weather_waypoints():
    payload = {
        "corridor_name": "NH-48 Corridor Test",
        "waypoints": [
            {
                "id": "WP-1",
                "location_name": "Bengaluru Logistics Park",
                "lat": 12.9716,
                "lng": 77.5946,
                "stage": "ORIGIN",
                "distance_km": 0.0
            },
            {
                "id": "WP-2",
                "location_name": "Khandala Ghat Mountain Pass",
                "lat": 18.7500,
                "lng": 73.3700,
                "stage": "GHAT PASS",
                "distance_km": 890.0
            }
        ]
    }
    resp = client.post("/ml/weather/waypoints", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["waypoints_count"] == 2
    assert "overall_corridor_risk_score" in data
    assert "attribution" in data
    assert "Open-Meteo" in data["attribution"]

def test_optimize_carriers_classical_fallback():
    payload = {
        "shipment_id": "CRG-TEST",
        "predicted_penalty": 9200.0,
        "delay_prob": 82.5,
        "base_order_value": 300000.0,
        "shots": 500
    }
    resp = client.post("/ml/optimize/carriers", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "OPTIMIZATION_SUCCESS"
    assert data["solver"] in ["qpiai", "classical-fallback"]
    assert "selected_carrier" in data
    assert data["selected_carrier"]["net_savings_vs_status_quo"] >= 0
    assert len(data["basis_states"]) == 3
    assert "qasm_circuit" in data

def test_corridor_kpis():
    resp = client.get("/ml/fleet/corridors")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_corridors"] >= 3
    assert data["active_fleet_count"] >= 1
    assert "system_wide_delay_rate_pct" in data

def test_llm_insight_fallback():
    payload = {
        "shipment_id": "CRG-9999",
        "cargo": "Pharmaceutical Vaccine Cold Chain",
        "cargo_value": 500000.0,
        "corridor": "NH-48 Golden Quadrilateral",
        "shipping_mode": "Standard Reefer",
        "demurrage_probability": 88.0,
        "demurrage_risk_tier": "CRITICAL",
        "demurrage_cost_estimated": 28000.0,
        "top_contributing_factors": ["Ghat Pass flash monsoon", "Reefer plug dwell exceeded"],
        "quantum_carrier_selected": "Expedited Regional Express",
        "quantum_net_savings": 14200.0,
        "quantum_solver": "QpiAI-QSV-Local"
    }
    resp = client.post("/ml/llm/insight", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ["SUCCESS", "SUCCESS_FALLBACK"]
    assert "incident_assessment" in data
    assert "dispatch_rerouting_notice" in data
    assert len(data["badges"]) >= 2
