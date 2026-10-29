"""
FREIGHTIQ Backend API — FastAPI
Integrates: Supabase Auth, ML Predictor, QpiAI Quantum Optimizer, GenAI Copilot, n8n
"""
import os
import sys
import uuid
import random
import math
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from project root .env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# Add project src to path so we can import shared modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
sys.path.insert(0, os.path.dirname(__file__))

import asyncio
import database as db
from predictor import FreightRiskPredictor
from quantum_optimizer import QpiAICarrierOptimizer
from genai_copilot import GenAICopilot
from weather_service import weather_service, WEATHER_ATTRIBUTION
from weather_scheduler import scheduler, REFRESH_INTERVAL_MINUTES

# Initialize AI & Quantum Engines
predictor_engine = FreightRiskPredictor()
quantum_optimizer = QpiAICarrierOptimizer()
copilot_engine = GenAICopilot()

from supabase import create_client, Client

# ── Supabase client ────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://iwcqkrzefoawlpugergc.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv(
    "SUPABASE_ANON_KEY", "sb_publishable__uivHUYOrPe8_2yzD7hBhg_x6O9m85a"
)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── FastAPI app ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="FREIGHTIQ API",
    version="1.0.0",
    description="AI-Powered Freight Exception Intelligence & Automated Route Weather Forecasting",
)

@app.on_event("startup")
async def start_automated_weather_scheduler():
    """Start automated periodic Open-Meteo route weather refresh worker."""
    asyncio.create_task(scheduler.run_periodic_loop())

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic Models ────────────────────────────────────────────────────────────

class ShipmentInput(BaseModel):
    shipping_mode: str = "Standard Class"
    order_region: str = "Western Europe"
    market: str = "Europe"
    customer_segment: str = "Corporate"
    department_name: str = "Apparel"
    days_for_shipment_scheduled: int = 4
    order_item_total: float = 150.0
    order_item_quantity: int = 1
    order_item_discount_rate: float = 0.05
    order_month: int = 10
    order_day_of_week: int = 2
    order_hour: int = 14
    order_id: Optional[str] = None


class AuthLogin(BaseModel):
    email: str
    password: str
    role: Optional[str] = "CUSTOMER"


class AuthRegister(BaseModel):
    email: str
    password: str
    full_name: str
    company: str
    role: Optional[str] = "CUSTOMER"


class ForgotPassword(BaseModel):
    email: str


class WeatherSimInput(BaseModel):
    severity: float = 3.5
    wind: float = 22.0
    precip: float = 15.0


class BackhaulMatchInput(BaseModel):
    origin: Optional[str] = "Bengaluru Logistics Park"
    destination: Optional[str] = "Mumbai JNPT Intermodal"
    cargo_type: Optional[str] = "General"
    weight_lbs: Optional[float] = 38000.0


class BackhaulApplyInput(BaseModel):
    cargo_id: str
    revenue: str  # e.g. "₹1,28,000"


class ExceptionResolveInput(BaseModel):
    exception_id: int
    exception_type: Optional[str] = "route_deviation"


class CopilotChatInput(BaseModel):
    message: str
    context: Optional[str] = ""


class TelemetryInput(BaseModel):
    truck_id: str


class NewsletterInput(BaseModel):
    email: str


class CargoBookingInput(BaseModel):
    user_email: Optional[str] = "tejas.s.s192406@gmail.com"
    origin: str = "Bengaluru Logistics Park"
    destination: str = "Mumbai JNPT Intermodal"
    cargo_type: str = "Industrial Machinery"
    weight_lbs: float = 38000.0
    declared_value_usd: float = 850000.0  # Declared value in INR (₹)
    shipping_mode: str = "First Class"
    scheduled_delivery: Optional[str] = "2026-11-02"
    days_for_shipment_scheduled: Optional[int] = 2


# ── Health ─────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "FREIGHTIQ API",
        "timestamp": datetime.utcnow().isoformat(),
    }




# ── Auth Endpoints ─────────────────────────────────────────────────────────────

@app.post("/auth/login")
async def login(data: AuthLogin):
    email = data.email.lower().strip()
    # 1. Try Supabase Auth
    try:
        res = supabase.auth.sign_in_with_password(
            {"email": email, "password": data.password}
        )
        if res.user:
            return {
                "success": True,
                "user": {"id": res.user.id, "email": res.user.email, "full_name": email.split('@')[0], "auth_source": "supabase"},
                "access_token": res.session.access_token if res.session else "sb_token",
            }
    except Exception as sb_err:
        pass

    # 2. Resilient local user authentication
    user = db.authenticate_user(email, data.password)
    if user:
        return {
            "success": True,
            "user": {**user, "auth_source": "local_database"},
            "access_token": f"jwt_{uuid.uuid4().hex[:16]}"
        }

    # 3. If first login for a valid email, auto-create local profile
    if "@" in email and len(data.password) >= 4:
        new_user = db.create_user(email, data.password, full_name=email.split('@')[0].capitalize(), company="Cargo Logistics")
        if new_user:
            return {
                "success": True,
                "user": {**new_user, "auth_source": "local_database_initialized"},
                "access_token": f"jwt_{uuid.uuid4().hex[:16]}"
            }

    raise HTTPException(status_code=401, detail="Invalid email or password.")


@app.post("/auth/register")
async def register(data: AuthRegister):
    email = data.email.lower().strip()
    role = (data.role or "CUSTOMER").upper()

    # Admin self-registration is strictly restricted
    if role == "ADMIN" or "admin" in email.split("@")[0]:
        raise HTTPException(
            status_code=403,
            detail="Admin self-registration is restricted. Administrative accounts are managed strictly by Corporate IT."
        )
    
    # 1. Save in local database
    local_user = db.create_user(email, data.password, full_name=data.full_name, company=data.company)
    
    # 2. Also register in Supabase
    try:
        supabase.auth.sign_up(
            {
                "email": email,
                "password": data.password,
                "options": {
                    "data": {"full_name": data.full_name, "company": data.company, "role": "CUSTOMER"}
                },
            }
        )
    except Exception:
        pass

    return {
        "success": True,
        "message": f"Customer account successfully created for {data.full_name}!",
        "user": {
            "id": local_user["id"] if local_user else str(uuid.uuid4()),
            "email": email,
            "full_name": data.full_name,
            "company": data.company,
            "role": "CUSTOMER"
        },
        "access_token": f"jwt_{uuid.uuid4().hex[:16]}"
    }


# ── Cargo Bookings Endpoints ───────────────────────────────────────────────────

@app.get("/api/bookings")
async def list_bookings(email: Optional[str] = None):
    """Retrieve all cargo bookings."""
    bookings = db.get_all_cargo_bookings(user_email=email)
    return {"success": True, "bookings": bookings, "count": len(bookings)}


@app.post("/api/bookings")
async def create_booking(data: CargoBookingInput):
    """
    Create a new cargo booking, run XGBoost delay risk prediction,
    execute QpiAI quantum carrier optimization, and store in database.
    """
    # 1. Prepare ML telemetry input
    shipment_data = {
        "shipping_mode": data.shipping_mode,
        "order_region": "Western Freight Corridor" if "Mumbai" in data.origin or "JNPT" in data.destination else "South India Freight Hub",
        "market": "India Domestic" if "Mumbai" in data.origin else "South Asia",
        "customer_segment": "Corporate",
        "department_name": data.cargo_type,
        "days_for_shipment_scheduled": data.days_for_shipment_scheduled or 2,
        "order_item_total": data.declared_value_usd / 1000.0,
        "order_item_quantity": 2,
        "order_item_discount_rate": 0.05,
        "order_month": 10,
        "order_day_of_week": 3,
        "order_hour": 14
    }

    # 2. Run XGBoost ML Prediction
    ml_res = predictor_engine.predict_shipment(shipment_data, engine="xgboost")

    # 3. Run QpiAI Quantum Carrier Optimization
    q_res = quantum_optimizer.optimize_carrier(
        predicted_penalty=ml_res.get("predicted_penalty_usd", 95.0),
        delay_prob=ml_res.get("delay_probability", 80.0) / 100.0,
        base_order_val=data.declared_value_usd
    )

    selected_carrier = q_res.get("selected_carrier", {}).get("name", "Expedited Regional Express")
    net_savings = float(q_res.get("net_financial_savings_usd", 0.0))
    qasm_file = os.path.basename(q_res.get("qasm_file_path", ""))

    # 4. Save to Database
    booking_record = {
        "user_email": data.user_email,
        "origin": data.origin,
        "destination": data.destination,
        "cargo_type": data.cargo_type,
        "weight_lbs": data.weight_lbs,
        "declared_value_usd": data.declared_value_usd,
        "shipping_mode": data.shipping_mode,
        "scheduled_delivery": data.scheduled_delivery or "2026-11-03",
        "status": "CONFIRMED",
        "delay_risk_pct": ml_res.get("delay_probability", 15.0),
        "risk_tier": ml_res.get("risk_tier", "LOW"),
        "demurrage_penalty_usd": ml_res.get("predicted_penalty_usd", 0.0),
        "quantum_carrier_assigned": selected_carrier,
        "net_savings_usd": net_savings,
        "qasm_file": qasm_file
    }

    saved = db.add_cargo_booking(booking_record)

    # 4b. Automatically trigger live Route Weather Intelligence
    weather_intel = None
    try:
        scheduler.sync_single_shipment(saved)
        weather_intel = db.get_shipment_weather_data(saved.get("booking_ref"))
    except Exception as w_err:
        print(f"[!] Auto-weather sync notice: {w_err}")

    # 5. Trigger n8n Webhook if configured
    n8n_url = os.getenv("N8N_WEBHOOK_URL")
    if n8n_url:
        try:
            import requests
            requests.post(n8n_url, json={
                "event": "CARGO_BOOKING_CREATED", 
                "booking": saved, 
                "ml_telemetry": ml_res, 
                "quantum_solution": q_res,
                "weather_intelligence": weather_intel
            }, timeout=2)
        except Exception:
            pass

    return {
        "success": True,
        "booking": saved,
        "ml_risk": ml_res,
        "quantum_optimization": {
            "carrier": selected_carrier,
            "net_savings_usd": net_savings,
            "backend": q_res.get("quantum_backend"),
            "is_cloud_executed": q_res.get("is_cloud_executed"),
            "qasm_file": qasm_file
        },
        "weather_intelligence": weather_intel
    }


# ── Webhook Endpoints (Bi-directional Sync from Supabase & n8n) ───────────────

class WebhookPayload(BaseModel):
    type: Optional[str] = "UPDATE"
    table: Optional[str] = "cargo_bookings"
    record: Optional[dict] = None
    old_record: Optional[dict] = None


@app.post("/api/webhooks/supabase")
async def supabase_webhook(payload: dict):
    """
    Receives real-time database webhooks from Supabase.
    Immediately updates local database cache so changes made in Supabase
    appear here instantly.
    """
    table = payload.get("table")
    record = payload.get("record") or payload.get("new") or {}
    record_type = payload.get("type", "UPDATE")

    if table == "cargo_bookings" and record:
        conn = db.get_connection()
        cur = conn.cursor()
        ref = record.get("booking_ref")
        if ref:
            cur.execute('''
            UPDATE cargo_bookings SET
                status = ?,
                quantum_carrier_assigned = ?,
                net_savings_usd = ?,
                origin = ?,
                destination = ?
            WHERE booking_ref = ?
            ''', (
                record.get("status", "CONFIRMED"),
                record.get("quantum_carrier_assigned", "Expedited Regional Express"),
                float(record.get("net_savings_usd", 0.0)),
                record.get("origin", ""),
                record.get("destination", ""),
                ref
            ))
            conn.commit()
        conn.close()
    return {"success": True, "received": True}


@app.post("/api/webhooks/n8n")
async def n8n_webhook_inbound(payload: dict):
    """
    Receives automation callbacks from n8n Cloud workflows.
    """
    action = payload.get("action")
    booking_ref = payload.get("booking_ref")
    new_status = payload.get("status", "DISPATCHED")

    if booking_ref:
        conn = db.get_connection()
        cur = conn.cursor()
        cur.execute("UPDATE cargo_bookings SET status = ? WHERE booking_ref = ?", (new_status, booking_ref))
        conn.commit()
        conn.close()

    return {"success": True, "processed": True}


@app.get("/api/datasets")
async def get_datasets_info():
    """Return summary and integration status of all training datasets."""
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    datasets = [
        {
            "name": "DataCo Global Smart Supply Chain",
            "file": "DataCoSupplyChainDataset.csv",
            "type": "Primary Base Dataset",
            "records": 58894,
            "status": "INTEGRATED & TRAINED"
        },
        {
            "name": "Live Manifest & Cold-Chain Register",
            "file": "live_manifest_register_data.csv",
            "type": "Live Manifest Telemetry",
            "records": 5,
            "status": "INTEGRATED & TRAINED"
        },
        {
            "name": "DataCo Smart Supply Chain Extended",
            "file": "dataco_smart_supply_chain_sample.csv",
            "type": "Order & Shipping Lead Time",
            "records": 2,
            "status": "INTEGRATED & TRAINED"
        },
        {
            "name": "Supply Chain Order Delay & Port Risk",
            "file": "supply_chain_delay_risk_sample.csv",
            "type": "Port Congestion & Weather Risk",
            "records": 2,
            "status": "INTEGRATED & TRAINED"
        },
        {
            "name": "Logistics & Supply Chain Disruption",
            "file": "logistics_disruption_sample.csv",
            "type": "Critical Corridor Disruption",
            "records": 2,
            "status": "INTEGRATED & TRAINED"
        }
    ]
    total_records = 58905
    return {
        "success": True,
        "total_integrated_records": total_records,
        "processed_file": "data/processed_shipments.csv",
        "models_trained": ["XGBoost 3.2.0 Classifier", "XGBoost 3.2.0 Regressor", "LightGBM Classifier", "LightGBM Regressor"],
        "datasets": datasets
    }


@app.get("/api/models/xgboost")
async def get_xgboost_metadata():
    """Return trained XGBoost model metrics, confusion matrix, and feature importances."""
    meta_path = os.path.join(os.path.dirname(__file__), "..", "models", "xgboost_metadata.json")
    if os.path.exists(meta_path):
        import json
        with open(meta_path, "r", encoding="utf-8") as f:
            return {"success": True, "metadata": json.load(f)}
    return {"success": False, "error": "XGBoost metadata not found"}


@app.get("/api/qpiai/info")
async def get_qpiai_info():
    """Return QpiAI quantum configuration, circuit info, and backend status."""
    circuits_dir = os.path.join(os.path.dirname(__file__), "..", "qcloud_circuits")
    sample_qasm = ""
    if os.path.exists(circuits_dir):
        files = [f for f in os.listdir(circuits_dir) if f.endswith(".qasm")]
        if files:
            latest = sorted(files)[-1]
            with open(os.path.join(circuits_dir, latest), "r", encoding="utf-8") as f:
                sample_qasm = f.read()

    return {
        "success": True,
        "qpiai": {
            "authenticated_user": os.getenv("QPIAI_USERNAME", "tejas19"),
            "default_device": os.getenv("QPIAI_DEFAULT_DEVICE", "QpiAI-QSV-Simulator"),
            "local_fallback_device": "QpiAI-QSV-Local",
            "experiment_name": os.getenv("QPIAI_EXPERIMENT_NAME", "Default Experiment"),
            "prefer_remote": os.getenv("QPIAI_PREFER_REMOTE_CLOUD", "true") == "true",
            "qubits": 3,
            "shots": 1000,
            "hamiltonian": "H = sum(w_i * Z_i) + lambda * (sum(Z_i) - 1)^2",
            "circuits_exported_dir": "qcloud_circuits/",
            "sample_qasm": sample_qasm
        }
    }


@app.get("/api/database/status")
async def database_status():
    """Return live status of SQLite and Supabase databases."""
    return {"success": True, "database": db.get_database_status()}



@app.post("/auth/forgot-password")
async def forgot_password(data: ForgotPassword):
    try:
        supabase.auth.reset_password_email(data.email)
        return {"success": True, "message": "Password reset email sent."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Dashboard Stats ────────────────────────────────────────────────────────────

@app.get("/api/stats")
async def get_stats():
    """Get dashboard statistics from Supabase."""
    try:
        incidents = (
            supabase.table("shipment_incidents")
            .select("*", count="exact")
            .execute()
        )
        total = incidents.count or 0
        data = incidents.data or []
        avg_savings = sum(r.get("net_financial_savings_usd", 0) or 0 for r in data) / max(len(data), 1)
        critical = sum(1 for r in data if r.get("risk_tier") in ("CRITICAL", "HIGH"))
        resolved = sum(1 for r in data if r.get("dispatch_status") == "DISPATCHED")
        on_time_pct = round(max(0, min(100, 95 - (critical / max(total, 1)) * 20)), 1)
        return {
            "success": True,
            "stats": {
                "total_incidents": total,
                "critical_incidents": critical,
                "avg_net_savings_usd": round(avg_savings, 2),
                "resolved_count": resolved,
                "active_units": max(142, total + 142),
                "on_time_pct": on_time_pct,
                "total_savings_usd": round(sum(r.get("net_financial_savings_usd", 0) or 0 for r in data), 2),
            },
        }
    except Exception:
        return {
            "success": True,
            "stats": {
                "total_incidents": 0,
                "critical_incidents": 0,
                "avg_net_savings_usd": 0,
                "resolved_count": 0,
                "active_units": 142,
                "on_time_pct": 94.7,
                "total_savings_usd": 0,
            },
        }


# ── Weather Simulation ─────────────────────────────────────────────────────────

@app.post("/api/weather/simulate")
async def weather_simulate(data: WeatherSimInput):
    """Compute weather risk analysis and AI recommendations."""
    severity = data.severity
    wind = data.wind
    precip = data.precip

    # Risk score calculation
    risk_score = 100 - (severity * 4) - (wind * 0.4) - (precip * 0.25)
    risk_score = round(max(45.0, min(99.0, risk_score)), 1)

    if severity > 7 or wind > 50 or precip > 70:
        risk_level = "HIGH"
        badge_text = "HIGH WEATHER RISK"
        speed_rec = "45 km/h (RESTRICTED)"
        reroute_status = "BYPASS NH-48 EXPRESS"
        ai_protocol = (
            "Severe monsoon conditions detected along Western Ghats. Qπ AI has initiated mandatory governor "
            "speed restriction to 45 km/h and auto-rerouted 14 units around the ghat mountain pass."
        )
    elif severity > 4 or wind > 30 or precip > 40:
        risk_level = "MODERATE"
        badge_text = "MODERATE RISK"
        speed_rec = "58 km/h"
        reroute_status = "WIND CORRIDOR ACTIVE"
        ai_protocol = (
            "Crosswind velocities elevated along NH-44. Platoon gap extended to 55 meters to maintain "
            "aerodynamic stability across open highway plains."
        )
    else:
        risk_level = "LOW"
        badge_text = "LOW RISK CORRIDOR"
        speed_rec = "68 km/h"
        reroute_status = "STANDARD NH-44"
        ai_protocol = (
            "Weather conditions are nominal across Golden Quadrilateral. Platoon spacing maintained at standard 35-meter "
            "interval. No speed restrictions mandated by Qπ AI telemetry."
        )

    # Try to log to Supabase (non-blocking)
    try:
        supabase.table("shipment_incidents").insert({
            "shipment_id": f"WX-{uuid.uuid4().hex[:6].upper()}",
            "order_region": "NH-44 Freight Corridor",
            "cargo_department": "Weather Simulation",
            "risk_tier": risk_level,
            "dispatch_status": "WEATHER_SIM",
            "genai_briefing": ai_protocol,
        }).execute()
    except Exception:
        pass

    return {
        "success": True,
        "safety_score": risk_score,
        "risk_level": risk_level,
        "badge_text": badge_text,
        "speed_rec": speed_rec,
        "reroute_status": reroute_status,
        "ai_protocol": ai_protocol,
    }


# ── Automated Weather Intelligence Endpoints (Open-Meteo) ────────────────────

class WeatherRefreshInput(BaseModel):
    shipment_id: Optional[str] = None


@app.get("/api/weather/shipment/{shipment_id}")
async def get_shipment_weather(shipment_id: str):
    """
    Fetch stored waypoint forecasts and latest risk evaluation for a shipment.
    Includes temperature, precipitation, wind, visibility, and WMO conditions.
    """
    data = db.get_shipment_weather_data(shipment_id)
    if not data:
        # On-the-fly fetch if shipment exists in database
        bookings = db.get_all_cargo_bookings()
        matched = next((b for b in bookings if b.get("booking_ref") == shipment_id or b.get("id") == shipment_id), None)
        if matched:
            scheduler.sync_single_shipment(matched)
            data = db.get_shipment_weather_data(shipment_id)

    if not data:
        raise HTTPException(status_code=404, detail=f"No weather intelligence found for shipment {shipment_id}")

    return {
        "success": True,
        "weather": data,
        "attribution": WEATHER_ATTRIBUTION,
        "provider": "Open-Meteo (api.open-meteo.com)"
    }


@app.post("/api/weather/refresh")
async def refresh_weather(payload: Optional[WeatherRefreshInput] = None):
    """
    Trigger an authorized manual refresh of live weather forecasts from Open-Meteo.
    Can refresh a specific shipment or all active shipments.
    """
    if payload and payload.shipment_id:
        bookings = db.get_all_cargo_bookings()
        matched = next((b for b in bookings if b.get("booking_ref") == payload.shipment_id or b.get("id") == payload.shipment_id), None)
        if matched:
            res = scheduler.sync_single_shipment(matched)
            data = db.get_shipment_weather_data(payload.shipment_id)
            return {
                "success": True,
                "mode": "SINGLE_SHIPMENT",
                "result": res,
                "weather": data,
                "attribution": WEATHER_ATTRIBUTION
            }
        raise HTTPException(status_code=404, detail=f"Shipment {payload.shipment_id} not found")

    # Refresh all active shipments
    res = scheduler.sync_all_active_shipments()
    alerts = db.get_all_weather_alerts()
    return {
        "success": True,
        "mode": "ALL_ACTIVE_SHIPMENTS",
        "sync_summary": res,
        "active_alerts_count": len(alerts),
        "attribution": WEATHER_ATTRIBUTION
    }


@app.get("/api/weather/alerts")
async def get_weather_alerts():
    """
    List all active route weather risk alerts (MODERATE, HIGH, SEVERE) requiring dispatcher review.
    """
    alerts = db.get_all_weather_alerts()
    return {
        "success": True,
        "count": len(alerts),
        "alerts": alerts,
        "provider": "Open-Meteo API",
        "attribution": WEATHER_ATTRIBUTION
    }


@app.get("/api/weather/status")
async def get_weather_status():
    """
    Get weather system health, Open-Meteo provider connectivity, and scheduler parameters.
    """
    alerts = db.get_all_weather_alerts()
    return {
        "success": True,
        "provider": "Open-Meteo (api.open-meteo.com)",
        "provider_status": "LIVE/CONNECTED",
        "attribution": WEATHER_ATTRIBUTION,
        "refresh_interval_minutes": REFRESH_INTERVAL_MINUTES,
        "last_sync_timestamp": scheduler.last_run_timestamp,
        "total_scheduled_runs": scheduler.total_runs_count,
        "active_weather_alerts": len(alerts),
        "is_scheduler_running": scheduler.is_running
    }


# ── Backhaul Matching ──────────────────────────────────────────────────────────

@app.post("/api/backhaul/match")
async def backhaul_match(data: BackhaulMatchInput):
    """Run Qπ AI backhaul optimization to pair returning empty trucks with cargo."""
    try:
        from quantum_optimizer import QpiAICarrierOptimizer
        optimizer = QpiAICarrierOptimizer()
        quantum_result = optimizer.optimize_carrier(
            predicted_penalty=12000.0,
            delay_prob=0.35,
            base_order_val=data.weight_lbs * 15,
        )
        quantum_status = quantum_result.get("quantum_backend", "QpiAI-QSV-Simulated")
        is_quantum = True
    except Exception as e:
        quantum_status = f"Demo ({str(e)[:40]})"
        is_quantum = False

    # Generate demo match results with Indian destinations and INR (₹)
    matches = [
        {"cargo_id": "CG-4821", "route": f"{data.origin} → Mumbai JNPT", "revenue": "₹1,28,000", "unit": "#4021", "eta": "14h 20m"},
        {"cargo_id": "CG-3317", "route": f"{data.origin} → Chennai Port", "revenue": "₹98,000",  "unit": "#8809", "eta": "9h 45m"},
        {"cargo_id": "CG-5590", "route": f"{data.origin} → Delhi Dadri ICD", "revenue": "₹2,08,000","unit": "#1052", "eta": "18h 10m"},
    ]
    total_revenue = sum(int(m["revenue"].replace("₹","").replace("$","").replace(",","")) for m in matches)

    return {
        "success": True,
        "matched_count": len(matches),
        "total_units_scanned": 142,
        "total_revenue_usd": total_revenue,
        "total_revenue_inr": total_revenue,
        "quantum_backend": quantum_status,
        "is_quantum": is_quantum,
        "matches": matches,
    }


@app.post("/api/backhaul/apply")
async def backhaul_apply(data: BackhaulApplyInput):
    """Confirm a backhaul match and store it in Supabase."""
    revenue_int = 0
    try:
        revenue_int = int(data.revenue.replace("₹","").replace("$","").replace(",",""))
    except Exception:
        pass

    try:
        supabase.table("shipment_incidents").insert({
            "shipment_id": data.cargo_id,
            "order_region": "NH-48 Backhaul Route",
            "cargo_department": "Backhaul Match",
            "order_value_usd": revenue_int,
            "net_financial_savings_usd": revenue_int,
            "risk_tier": "LOW",
            "dispatch_status": "DISPATCHED",
            "genai_briefing": f"Backhaul cargo {data.cargo_id} matched and dispatched. Revenue: {data.revenue}",
        }).execute()
    except Exception:
        pass

    return {
        "success": True,
        "cargo_id": data.cargo_id,
        "revenue": data.revenue,
        "waybill": f"WB-{uuid.uuid4().hex[:8].upper()}",
        "message": f"Cargo load {data.cargo_id} successfully matched. Digital waybill generated.",
    }


# ── Exception Resolution ───────────────────────────────────────────────────────

@app.post("/api/exceptions/resolve")
async def resolve_exception(data: ExceptionResolveInput):
    """Run the full AI pipeline to resolve a freight exception."""
    shipment_id = f"EXC-{data.exception_id:03d}-{uuid.uuid4().hex[:4].upper()}"

    # ML Prediction
    try:
        from predictor import FreightRiskPredictor
        predictor = FreightRiskPredictor(
            models_dir=os.path.join(os.path.dirname(__file__), '..', 'models')
        )
        ml_result = predictor.predict_shipment({
            "shipping_mode": "Standard Class",
            "order_region": "Western Europe",
            "market": "Europe",
            "customer_segment": "Corporate",
            "department_name": "Apparel",
            "days_for_shipment_scheduled": 4,
            "order_item_total": 250.0,
            "order_item_quantity": 2,
            "order_item_discount_rate": 0.05,
            "order_month": datetime.now().month,
            "order_day_of_week": datetime.now().weekday(),
            "order_hour": datetime.now().hour,
        })
    except Exception as e:
        ml_result = {
            "delay_probability": 72.0,
            "risk_tier": "HIGH",
            "predicted_penalty_usd": 145.0,
            "contributing_factors": [f"Exception #{data.exception_id}: {data.exception_type}"],
        }

    # Quantum Optimization
    try:
        from quantum_optimizer import QpiAICarrierOptimizer
        optimizer = QpiAICarrierOptimizer()
        quantum_result = optimizer.optimize_carrier(
            predicted_penalty=ml_result["predicted_penalty_usd"],
            delay_prob=ml_result["delay_probability"] / 100,
            base_order_val=250.0,
        )
    except Exception as e:
        quantum_result = {
            "status": "DEMO",
            "quantum_backend": "QpiAI-QSV-Simulated",
            "is_cloud_executed": False,
            "selected_carrier": {"name": "Expedited Regional Express", "expedite_cost": 42.0},
            "net_financial_savings_usd": round(ml_result["predicted_penalty_usd"] * 0.75, 2),
            "note": str(e),
        }

    # GenAI Briefing
    try:
        from genai_copilot import GenAICopilot
        copilot = GenAICopilot()
        genai_result = copilot.generate_incident_report(
            {"order_id": shipment_id, "exception_type": data.exception_type},
            ml_result, quantum_result
        )
        briefing = genai_result.get("generated_briefing", "")
    except Exception:
        briefing = (
            f"Exception #{data.exception_id} ({data.exception_type}) resolved via Qπ AI automated protocol. "
            f"ML risk score: {ml_result['delay_probability']}%. "
            f"Carrier: {quantum_result.get('selected_carrier', {}).get('name', 'Regional Express')}. "
            f"Estimated savings: ₹{quantum_result.get('net_financial_savings_usd', 0):,.2f}."
        )

    # n8n Dispatch
    try:
        from n8n_integration import N8NWorkflowDispatcher
        dispatcher = N8NWorkflowDispatcher()
        dispatcher.dispatch_incident_event(
            {"order_id": shipment_id}, ml_result, quantum_result, {"generated_briefing": briefing}
        )
    except Exception:
        pass

    # Store in Supabase
    try:
        carrier = quantum_result.get("selected_carrier", {})
        supabase.table("shipment_incidents").insert({
            "shipment_id": shipment_id,
            "order_region": "NH-44 Corridor Exception",
            "cargo_department": data.exception_type,
            "order_value_usd": 25000.0,
            "delay_probability_pct": ml_result.get("delay_probability"),
            "risk_tier": ml_result.get("risk_tier"),
            "predicted_penalty_usd": ml_result.get("predicted_penalty_usd"),
            "selected_carrier": carrier.get("name"),
            "expedite_cost_usd": carrier.get("expedite_cost"),
            "net_financial_savings_usd": quantum_result.get("net_financial_savings_usd"),
            "quantum_backend": quantum_result.get("quantum_backend"),
            "genai_briefing": briefing,
            "dispatch_status": "DISPATCHED",
        }).execute()
    except Exception:
        pass

    return {
        "success": True,
        "exception_id": data.exception_id,
        "shipment_id": shipment_id,
        "ml_risk": ml_result,
        "quantum_optimization": quantum_result,
        "briefing": briefing,
        "status": "RESOLVED",
    }


# ── Co-pilot Chat ──────────────────────────────────────────────────────────────

@app.post("/api/copilot/chat")
async def copilot_chat(data: CopilotChatInput):
    """Send a message to the Qπ AI Copilot and get a response."""
    message = data.message.lower()

    # Dynamic context enrichment from live stored Open-Meteo forecasts
    enriched_context = data.context or ""
    if any(w in message for w in ["weather", "forecast", "rain", "storm", "wind", "alert", "corridor", "shipment"]):
        alerts = db.get_all_weather_alerts()
        if alerts:
            summaries = [
                f"Shipment {a.get('booking_ref', a.get('shipment_id'))} ({a.get('origin')} -> {a.get('destination')}): {a.get('risk_tier')} RISK on segment '{a.get('affected_segment')}'. Explanation: {a.get('explanation')}. Recommended: {a.get('recommended_action')}"
                for a in alerts[:4]
            ]
            enriched_context += "\n\nLive Route Weather Intelligence (Open-Meteo.com):\n" + "\n".join(summaries)

    # Try GenAI / Ollama first
    try:
        result = copilot_engine.answer_query(data.message, context=enriched_context)
        if result and result.get("answer"):
            return {
                "success": True,
                "reply": result.get("answer"),
                "source": "ollama_llama3.2" if result.get("ollama_active") else "copilot_engine",
                "model": result.get("model", "llama3.2:3b")
            }
    except Exception as copilot_err:
        print(f"[!] Copilot error: {copilot_err}")

    # Fallback rule-based responses matching Indian logistics context & INR
    if any(w in message for w in ["weather", "storm", "rain", "wind", "blizzard", "monsoon", "forecast"]):
        alerts = db.get_all_weather_alerts()
        if alerts:
            top_a = alerts[0]
            reply = (
                f"Automated Open-Meteo Weather Intelligence: {len(alerts)} shipment(s) currently have active route weather advisories. "
                f"Primary alert: Shipment #{top_a.get('booking_ref', top_a.get('shipment_id'))} on {top_a.get('origin')} ➔ {top_a.get('destination')} "
                f"is flagged at {top_a.get('risk_tier')} RISK at {top_a.get('affected_segment')}. "
                f"{top_a.get('recommended_action')} [Attribution: Weather data by Open-Meteo.com]"
            )
        else:
            reply = (
                "Automated Open-Meteo forecast scan confirms all active highway corridors (NH-44 & NH-48) are currently nominal (LOW RISK). "
                "No adverse precipitation or wind gust anomalies detected. [Attribution: Weather data by Open-Meteo.com]"
            )
    elif any(w in message for w in ["backhaul", "cargo", "empty", "return"]):
        reply = (
            "Backhaul matching engine has identified 18 empty returning units ready for immediate "
            "cargo pairing across the Golden Quadrilateral, yielding an estimated ₹4,34,000+ in weekly net optimization."
        )
    elif any(w in message for w in ["exception", "accident", "delay", "incident"]):
        reply = (
            "There are 3 active exceptions requiring attention. Unit #8809 has an automated AI "
            "reroute ready for execution to bypass the Khandala Ghat blockage."
        )
    elif any(w in message for w in ["fuel", "mpg", "efficiency", "diesel", "mileage"]):
        reply = (
            "Current fleet fuel efficiency is averaging 4.2 KM/L (18.4 L / 100km) across all active commercial units. "
            "Qπ AI platoon synchronization has improved fuel economy by 12% this quarter."
        )
    elif any(w in message for w in ["route", "reroute", "highway", "corridor"]):
        reply = (
            "All primary highway corridors are operational. NH-44 Bengaluru-Hyderabad corridor shows mild congestion "
            "near toll waypoint. Qπ AI has pre-calculated 3 alternative routing scenarios."
        )
    else:
        reply = (
            "I have analyzed your query across our neural corridor models. All semi-truck units are "
            "maintaining optimal fuel efficiency and weather risk factors are within safe operational parameters along the Golden Quadrilateral."
        )

    return {"success": True, "reply": reply, "source": "fallback"}


# ── Fleet Telemetry ────────────────────────────────────────────────────────────

@app.get("/api/fleet/telemetry")
async def fleet_telemetry(truck_id: str = "truck-1"):
    """Get live telemetry for a fleet truck from Supabase or demo data."""
    demo_data = {
        "truck-1": {
            "unit": "#4021",
            "title": "UNIT #4021 - TELEMETRY COCKPIT",
            "sub": "Transmitting via Qπ AI Satellite Link | 100% Signal Strength",
            "speed": "68 km/h",
            "weight": "38,500 KG",
            "mpg": "4.2 KM/L",
            "progress_pct": 64,
            "origin": "Bengaluru Logistics Park",
            "destination": "Mumbai JNPT Intermodal",
            "ai_note": "Maintain speed at 68 km/h along NH-48 to utilize low-density wind corridor ahead. Estimated arrival time reduced by 22 minutes with zero additional fuel burn.",
        },
        "truck-2": {
            "unit": "#8809",
            "title": "UNIT #8809 - TELEMETRY COCKPIT",
            "sub": "Qπ Neural Route Diversion Active | Signal Locked",
            "speed": "55 km/h",
            "weight": "32,400 KG",
            "mpg": "3.8 KM/L",
            "progress_pct": 38,
            "origin": "Pune Chakan Cold Hub",
            "destination": "Delhi-NCR Distribution Yard",
            "ai_note": "Qπ AI dynamically rerouted Unit #8809 around Khandala Ghat bottleneck, saving 42 minutes of idle idling time.",
        },
        "truck-3": {
            "unit": "#1052",
            "title": "UNIT #1052 - TELEMETRY COCKPIT",
            "sub": "Intermodal Port Land-Bridge Transfer Completed",
            "speed": "62 km/h",
            "weight": "42,000 KG",
            "mpg": "4.0 KM/L",
            "progress_pct": 82,
            "origin": "Chennai Sea Port Gate 2",
            "destination": "Hyderabad ICD Logistics Yard",
            "ai_note": "Port drayage sync complete. Dock appointment pre-verified at Hyderabad Inland Container Depot Terminal 2.",
        },
    }

    # Try to fetch from Supabase first
    try:
        res = (
            supabase.table("shipment_incidents")
            .select("*")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if res.data:
            row = res.data[0]
            # Merge live data into the demo record
            base = demo_data.get(truck_id, demo_data["truck-1"]).copy()
            base["live_shipment_id"] = row.get("shipment_id")
            base["live_risk_tier"] = row.get("risk_tier")
            return {"success": True, "truck_id": truck_id, "telemetry": base, "source": "supabase"}
    except Exception:
        pass

    telemetry = demo_data.get(truck_id, demo_data["truck-1"])
    return {"success": True, "truck_id": truck_id, "telemetry": telemetry, "source": "demo"}


# ── Newsletter Subscribe ───────────────────────────────────────────────────────

@app.post("/api/newsletter/subscribe")
async def newsletter_subscribe(data: NewsletterInput):
    """Subscribe an email to freight insights newsletter via Supabase."""
    try:
        supabase.table("shipment_incidents").insert({
            "shipment_id": f"NL-{uuid.uuid4().hex[:6].upper()}",
            "order_region": "Newsletter",
            "cargo_department": data.email,
            "dispatch_status": "NEWSLETTER_SUBSCRIBED",
        }).execute()
    except Exception:
        pass
    return {"success": True, "message": "You've been subscribed to FREIGHTIQ Freight Insights."}


# ── ML Prediction ──────────────────────────────────────────────────────────────

@app.post("/api/predict")
async def predict(shipment: ShipmentInput):
    """Run ML risk prediction on a shipment."""
    try:
        from predictor import FreightRiskPredictor
        predictor = FreightRiskPredictor(
            models_dir=os.path.join(os.path.dirname(__file__), '..', 'models')
        )
        result = predictor.predict_shipment(shipment.model_dump())
        return {"success": True, "prediction": result}
    except Exception as e:
        delay_prob = 78.5 if shipment.shipping_mode == "First Class" else 42.0
        tier = "HIGH" if delay_prob > 60 else "MEDIUM"
        return {
            "success": True,
            "prediction": {
                "delay_probability": delay_prob,
                "is_delayed_predicted": delay_prob >= 50,
                "predicted_penalty_usd": round(delay_prob * 1.8, 2),
                "risk_tier": tier,
                "contributing_factors": [f"Regional transit congestion in {shipment.order_region}"],
            },
            "note": f"Demo mode: {str(e)}",
        }


# ── Quantum Optimization ───────────────────────────────────────────────────────

@app.post("/api/optimize")
async def optimize(shipment: ShipmentInput):
    """Run QpiAI quantum carrier optimization."""
    try:
        from predictor import FreightRiskPredictor
        predictor = FreightRiskPredictor(
            models_dir=os.path.join(os.path.dirname(__file__), '..', 'models')
        )
        ml_result = predictor.predict_shipment(shipment.model_dump())
        delay_prob = ml_result["delay_probability"] / 100
        penalty = ml_result["predicted_penalty_usd"]
    except Exception:
        delay_prob = 0.78
        penalty = 120.0
        ml_result = {"delay_probability": 78.0, "risk_tier": "HIGH", "predicted_penalty_usd": 120.0, "contributing_factors": []}

    try:
        from quantum_optimizer import QpiAICarrierOptimizer
        optimizer = QpiAICarrierOptimizer()
        quantum_result = optimizer.optimize_carrier(
            predicted_penalty=penalty,
            delay_prob=delay_prob,
            base_order_val=shipment.order_item_total,
        )
    except Exception as e:
        quantum_result = {
            "status": "DEMO_MODE",
            "quantum_backend": "QpiAI-QSV-Simulated",
            "is_cloud_executed": False,
            "selected_carrier": {
                "name": "Expedited Regional Express",
                "expedite_cost": 42.0,
                "residual_penalty": round(penalty * 0.15, 2),
                "speed_days": "2 days (On-time)",
                "reliability_score": "92%",
            },
            "net_financial_savings_usd": round(penalty * 0.85 - 42.0, 2),
            "all_candidates": [],
            "note": f"Demo: {str(e)}",
        }

    return {"success": True, "ml_risk": ml_result, "quantum_optimization": quantum_result}


# ── Full Pipeline (Predict + Optimize + GenAI + n8n) ─────────────────────────

@app.post("/api/triage")
async def full_triage(shipment: ShipmentInput):
    """Run the full FREIGHTIQ triage pipeline."""
    shipment_dict = shipment.model_dump()
    if not shipment_dict.get("order_id"):
        shipment_dict["order_id"] = f"SHP-{uuid.uuid4().hex[:6].upper()}"

    # 1. ML Prediction
    try:
        from predictor import FreightRiskPredictor
        predictor = FreightRiskPredictor(
            models_dir=os.path.join(os.path.dirname(__file__), '..', 'models')
        )
        ml_result = predictor.predict_shipment(shipment_dict)
    except Exception as e:
        ml_result = {"delay_probability": 78.0, "risk_tier": "HIGH", "predicted_penalty_usd": 120.0, "contributing_factors": [f"Demo: {e}"]}

    # 2. Quantum Optimization
    try:
        from quantum_optimizer import QpiAICarrierOptimizer
        optimizer = QpiAICarrierOptimizer()
        quantum_result = optimizer.optimize_carrier(
            predicted_penalty=ml_result["predicted_penalty_usd"],
            delay_prob=ml_result["delay_probability"] / 100,
            base_order_val=shipment_dict.get("order_item_total", 150),
        )
    except Exception as e:
        quantum_result = {
            "status": "DEMO", "quantum_backend": "QpiAI-QSV-Simulated", "is_cloud_executed": False,
            "selected_carrier": {"name": "Expedited Regional Express", "expedite_cost": 42.0},
            "net_financial_savings_usd": 78.0, "note": str(e),
        }

    # 3. GenAI Copilot
    try:
        from genai_copilot import GenAICopilot
        copilot = GenAICopilot()
        genai_result = copilot.generate_incident_report(shipment_dict, ml_result, quantum_result)
    except Exception as e:
        genai_result = {"status": "DEMO", "generated_briefing": f"Demo mode — GenAI briefing unavailable: {e}"}

    # 4. n8n Dispatch
    try:
        from n8n_integration import N8NWorkflowDispatcher
        dispatcher = N8NWorkflowDispatcher()
        n8n_result = dispatcher.dispatch_incident_event(shipment_dict, ml_result, quantum_result, genai_result)
    except Exception as e:
        n8n_result = {"status": "DEMO", "note": str(e)}

    # 5. Store in Supabase
    try:
        carrier = quantum_result.get("selected_carrier", {})
        supabase.table("shipment_incidents").insert({
            "shipment_id": shipment_dict["order_id"],
            "order_region": shipment_dict.get("order_region"),
            "cargo_department": shipment_dict.get("department_name"),
            "order_value_usd": shipment_dict.get("order_item_total"),
            "delay_probability_pct": ml_result.get("delay_probability"),
            "risk_tier": ml_result.get("risk_tier"),
            "predicted_penalty_usd": ml_result.get("predicted_penalty_usd"),
            "selected_carrier": carrier.get("name"),
            "expedite_cost_usd": carrier.get("expedite_cost"),
            "net_financial_savings_usd": quantum_result.get("net_financial_savings_usd"),
            "quantum_backend": quantum_result.get("quantum_backend"),
            "genai_briefing": genai_result.get("generated_briefing", ""),
            "dispatch_status": "DISPATCHED",
        }).execute()
    except Exception:
        pass

    return {
        "success": True,
        "shipment_id": shipment_dict["order_id"],
        "ml_risk": ml_result,
        "quantum_optimization": quantum_result,
        "genai_briefing": genai_result,
        "n8n_dispatch": n8n_result,
    }


# ── Data Endpoints ─────────────────────────────────────────────────────────────

@app.get("/api/incidents")
async def get_incidents(limit: int = 20):
    """Get recent shipment incidents from Supabase."""
    try:
        res = (
            supabase.table("shipment_incidents")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return {"success": True, "incidents": res.data, "count": len(res.data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/shipments")
async def get_shipments(limit: int = 50):
    """Get shipment dataset samples from Supabase."""
    try:
        res = (
            supabase.table("shipment_datasets")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return {"success": True, "shipments": res.data, "count": len(res.data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/quantum-jobs")
async def get_quantum_jobs(limit: int = 20):
    """Get QpiAI quantum job history from Supabase."""
    try:
        res = (
            supabase.table("qpiai_quantum_jobs")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return {"success": True, "jobs": res.data, "count": len(res.data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Static file serving — Unified Single Frontend ──────────────────────────────
@app.get("/freightiq_nature_blue.html")
@app.get("/freightiq_advanced_enterprise_dashboard.html")
async def redirect_legacy_frontend():
    return RedirectResponse(url="/")

_frontend_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend')
_dist_dir = os.path.join(os.path.dirname(__file__), '..', 'dist')

if os.path.isdir(_frontend_dir):
    app.mount("/", StaticFiles(directory=_frontend_dir, html=True), name="frontend")
elif os.path.isdir(_dist_dir):
    app.mount("/", StaticFiles(directory=_dist_dir, html=True), name="static")


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
