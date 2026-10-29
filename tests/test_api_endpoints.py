import os
import json
import requests
import pytest
from dotenv import load_dotenv

load_dotenv(".env")

BASE_GATEWAY = "http://localhost:3001"
BASE_FASTAPI = "http://localhost:8000"

def test_gateway_health():
    res = requests.get(f"{BASE_GATEWAY}/health", timeout=5)
    assert res.status_code == 200
    data = res.json()
    assert data.get("status") == "HEALTHY"

def test_fastapi_health():
    res = requests.get(f"{BASE_FASTAPI}/ml/health", timeout=5)
    assert res.status_code == 200
    data = res.json()
    assert data.get("status") == "healthy"
    assert "XGBoost 3.2" in data.get("models", [])

def test_admin_route_blocked_without_elevation():
    res = requests.get(f"{BASE_GATEWAY}/api/admin/audit-logs", timeout=5)
    assert res.status_code == 403
    data = res.json()
    assert data.get("code") == "FORBIDDEN_ELEVATION_REQUIRED"

def test_admin_elevate_wrong_password():
    res = requests.post(
        f"{BASE_GATEWAY}/api/auth/admin-elevate",
        json={"password": "intentionally-wrong-pw-999"},
        timeout=5
    )
    assert res.status_code == 401
    data = res.json()
    assert data.get("success") is False
    assert "remainingAttempts" in data

def test_admin_elevate_success_and_access():
    res = requests.post(
        f"{BASE_GATEWAY}/api/auth/admin-elevate",
        json={"password": "1234567890"},
        timeout=5
    )
    assert res.status_code == 200
    token = res.json().get("token")
    assert token is not None

    # Access protected admin audit logs with token
    admin_res = requests.get(
        f"{BASE_GATEWAY}/api/admin/audit-logs",
        headers={"x-admin-token": token},
        timeout=5
    )
    assert admin_res.status_code == 200
    logs = admin_res.json().get("logs")
    assert isinstance(logs, list)

def test_demurrage_predict_valid_and_shape():
    res = requests.post(
        f"{BASE_GATEWAY}/api/demurrage/predict",
        json={"consignmentId": "CRG-24551", "shipping_mode": "First Class", "order_item_total": 125000.0},
        timeout=5
    )
    assert res.status_code == 200
    data = res.json()
    assert "demurrage_probability" in data
    assert 0.0 <= data["demurrage_probability"] <= 100.0
    assert data.get("currency") == "INR"
    assert "risk_level" in data

def test_quantum_carrier_optimization():
    res = requests.post(
        f"{BASE_GATEWAY}/api/optimize/carriers",
        json={"shipment_id": "CRG-24551", "penalty": 14500.0},
        timeout=15
    )
    assert res.status_code == 200
    data = res.json()
    assert "selected_carrier" in data
    assert "net_financial_savings" in data
    assert data["net_financial_savings"] > 0

def test_copilot_chat_xss_sanitization():
    xss_payload = "<script>alert('xss')</script> SELECT * FROM users;"
    res = requests.post(
        f"{BASE_GATEWAY}/api/copilot/chat",
        json={"query": xss_payload},
        timeout=5
    )
    assert res.status_code == 200
    data = res.json()
    assert data.get("success") is True
    # Make sure server returns safely without executing or failing
    assert "reply" in data

def test_n8n_inbound_webhook_security():
    # Without secret -> 401 Unauthorized
    res_bad = requests.post(
        f"{BASE_GATEWAY}/api/webhooks/n8n",
        json={"event": "TEST_ALERT"},
        timeout=5
    )
    assert res_bad.status_code == 401

    # With valid secret -> 200 OK
    secret = os.getenv("N8N_WEBHOOK_SECRET", "freightiq-n8n-secure-token-2026")
    res_good = requests.post(
        f"{BASE_GATEWAY}/api/webhooks/n8n",
        headers={"X-FreightIQ-Secret": secret},
        json={"event": "TEST_ALERT", "details": "Verified test"},
        timeout=5
    )
    assert res_good.status_code == 200
    data = res_good.json()
    assert data.get("received") is True or data.get("status") == "PROCESSED"

def test_ml_model_metadata_sanity():
    res = requests.get(f"{BASE_FASTAPI}/ml/demurrage/metrics", timeout=5)
    assert res.status_code == 200
    meta = res.json()
    metrics = meta.get("classification_metrics") or meta
    assert metrics.get("accuracy", 0) > 0.70
    assert meta.get("dataset_rows", 0) > 10000 or meta.get("feature_count", 0) > 0

if __name__ == "__main__":
    import pytest
    pytest.main(["-v", "tests/test_api_endpoints.py"])
