import os
import sqlite3
import uuid
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

# Load env from root
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "freightguard.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

# Supabase REST client initialization
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://iwcqkrzefoawlpugergc.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY", "sb_publishable__uivHUYOrPe8_2yzD7hBhg_x6O9m85a")

sb_client = None
try:
    from supabase import create_client
    if SUPABASE_URL and SUPABASE_KEY:
        sb_client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"[!] Supabase client load warning: {e}")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cur = conn.cursor()
    
    # 1. Users table
    cur.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT,
        company TEXT,
        created_at TEXT
    )
    ''')
    
    # 2. Cargo Bookings table
    cur.execute('''
    CREATE TABLE IF NOT EXISTS cargo_bookings (
        id TEXT PRIMARY KEY,
        booking_ref TEXT UNIQUE NOT NULL,
        user_email TEXT,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        cargo_type TEXT NOT NULL,
        weight_lbs REAL DEFAULT 35000.0,
        declared_value_usd REAL DEFAULT 85000.0,
        shipping_mode TEXT DEFAULT 'Standard Class',
        scheduled_delivery TEXT,
        status TEXT DEFAULT 'CONFIRMED',
        delay_risk_pct REAL DEFAULT 15.0,
        risk_tier TEXT DEFAULT 'LOW',
        demurrage_penalty_usd REAL DEFAULT 0.0,
        quantum_carrier_assigned TEXT DEFAULT 'Expedited Regional Express',
        net_savings_usd REAL DEFAULT 0.0,
        qasm_file TEXT,
        created_at TEXT
    )
    ''')
    
    # 3. Shipment Incidents
    cur.execute('''
    CREATE TABLE IF NOT EXISTS shipment_incidents (
        id TEXT PRIMARY KEY,
        shipment_id TEXT NOT NULL,
        order_region TEXT,
        cargo_department TEXT,
        order_value_usd REAL,
        delay_probability_pct REAL,
        risk_tier TEXT,
        predicted_penalty_usd REAL,
        selected_carrier TEXT,
        expedite_cost_usd REAL,
        net_financial_savings_usd REAL,
        quantum_backend TEXT,
        genai_briefing TEXT,
        dispatch_status TEXT DEFAULT 'DISPATCHED',
        created_at TEXT
    )
    ''')

    # 4. Automated Weather Route Forecasts Table
    cur.execute('''
    CREATE TABLE IF NOT EXISTS shipment_weather_forecasts (
        id TEXT PRIMARY KEY,
        shipment_id TEXT NOT NULL,
        waypoint_name TEXT NOT NULL,
        waypoint_type TEXT DEFAULT 'WAYPOINT',
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        forecast_valid_time TEXT NOT NULL,
        provider TEXT DEFAULT 'Open-Meteo',
        retrieval_time TEXT NOT NULL,
        temperature_c REAL,
        apparent_temp_c REAL,
        precipitation_mm REAL,
        precip_probability_pct REAL,
        rain_mm REAL,
        snowfall_cm REAL,
        wind_speed_kmh REAL,
        wind_gusts_kmh REAL,
        visibility_m REAL,
        cloud_cover_pct REAL,
        weather_code INTEGER,
        condition_text TEXT,
        condition_icon TEXT,
        is_stale INTEGER DEFAULT 0
    )
    ''')
    cur.execute('CREATE INDEX IF NOT EXISTS idx_weather_shipment ON shipment_weather_forecasts (shipment_id)')

    # 5. Automated Weather Risk Evaluations Table
    cur.execute('''
    CREATE TABLE IF NOT EXISTS weather_risk_evaluations (
        id TEXT PRIMARY KEY,
        shipment_id TEXT UNIQUE NOT NULL,
        risk_tier TEXT NOT NULL,
        triggering_factors_json TEXT,
        explanation TEXT,
        affected_segment TEXT,
        recommended_action TEXT,
        evaluation_time TEXT NOT NULL,
        attribution TEXT DEFAULT 'Weather data by Open-Meteo.com'
    )
    ''')

    # Seed initial cargo bookings if table empty
    cur.execute('SELECT COUNT(*) as cnt FROM cargo_bookings')
    if cur.fetchone()['cnt'] == 0:
        seed_bookings = [
            ("CRG-8910", "tejas.s.s192406@gmail.com", "Chicago Hub 04", "Dallas Intermodal Rail", "Industrial Machinery", 44000.0, 185000.0, "First Class", "2026-10-31", "IN_TRANSIT", 78.4, "HIGH", 125.00, "Expedited Regional Express", 63.00, "qpiai_circuit_1793220505.qasm", datetime.now().isoformat()),
            ("CRG-8911", "tejas.s.s192406@gmail.com", "Long Beach Port Dock 7", "Denver Distribution Center", "Pharmaceuticals (Cold-Chain)", 28500.0, 340000.0, "Same Day Priority", "2026-10-30", "DISPATCHED", 88.2, "CRITICAL", 210.00, "Dedicated Priority Air Cargo", 115.00, "qpiai_circuit_1793220505.qasm", datetime.now().isoformat()),
            ("CRG-8912", "tejas.s.s192406@gmail.com", "Rotterdam Gateway Pier 3", "Frankfurt Airfreight Hub", "Automotive Precision Parts", 52000.0, 120000.0, "Second Class", "2026-11-02", "CONFIRMED", 24.5, "LOW", 0.00, "Retain Current Carrier (Status Quo)", 0.00, "", datetime.now().isoformat()),
            ("CRG-8913", "tejas.s.s192406@gmail.com", "Savannah Container Terminal", "Atlanta Logistics Yard", "Consumer Electronics", 38000.0, 210000.0, "Standard Class", "2026-11-01", "IN_TRANSIT", 64.0, "MEDIUM", 85.00, "Expedited Regional Express", 43.00, "", datetime.now().isoformat())
        ]
        for b in seed_bookings:
            cur.execute('''
            INSERT INTO cargo_bookings (
                id, booking_ref, user_email, origin, destination, cargo_type, weight_lbs, 
                declared_value_usd, shipping_mode, scheduled_delivery, status, delay_risk_pct, 
                risk_tier, demurrage_penalty_usd, quantum_carrier_assigned, net_savings_usd, qasm_file, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (str(uuid.uuid4()), *b))

    conn.commit()
    conn.close()

# Auto-initialize on import
init_db()

def create_user(email: str, password: str, full_name: str = "", company: str = ""):
    conn = get_connection()
    cur = conn.cursor()
    user_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    try:
        cur.execute(
            "INSERT INTO users (id, email, password, full_name, company, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, email.lower().strip(), password, full_name, company, now)
        )
        conn.commit()
        return {"id": user_id, "email": email, "full_name": full_name, "company": company}
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def authenticate_user(email: str, password: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, email, password, full_name, company FROM users WHERE email = ?", (email.lower().strip(),))
    row = cur.fetchone()
    conn.close()
    if row and row["password"] == password:
        return {"id": row["id"], "email": row["email"], "full_name": row["full_name"], "company": row["company"]}
    return None

def add_cargo_booking(data: dict):
    conn = get_connection()
    cur = conn.cursor()
    booking_id = str(uuid.uuid4())
    ref = data.get("booking_ref") or f"CRG-{int(datetime.now().timestamp()) % 100000:05d}"
    now = datetime.now().isoformat()

    row = (
        booking_id,
        ref,
        data.get("user_email", "guest@freightguard.ai"),
        data.get("origin", "Chicago Terminal"),
        data.get("destination", "Dallas Intermodal"),
        data.get("cargo_type", "General Freight"),
        float(data.get("weight_lbs", 35000.0)),
        float(data.get("declared_value_usd", 85000.0)),
        data.get("shipping_mode", "Standard Class"),
        data.get("scheduled_delivery", ""),
        data.get("status", "CONFIRMED"),
        float(data.get("delay_risk_pct", 18.0)),
        data.get("risk_tier", "LOW"),
        float(data.get("demurrage_penalty_usd", 0.0)),
        data.get("quantum_carrier_assigned", "Expedited Regional Express"),
        float(data.get("net_savings_usd", 0.0)),
        data.get("qasm_file", ""),
        now
    )

    cur.execute('''
    INSERT INTO cargo_bookings (
        id, booking_ref, user_email, origin, destination, cargo_type, weight_lbs, 
        declared_value_usd, shipping_mode, scheduled_delivery, status, delay_risk_pct, 
        risk_tier, demurrage_penalty_usd, quantum_carrier_assigned, net_savings_usd, qasm_file, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', row)
    conn.commit()
    conn.close()

    # Try sync to Supabase if table exists
    if sb_client:
        try:
            sb_client.table("cargo_bookings").insert({
                "booking_ref": ref,
                "user_email": data.get("user_email"),
                "origin": data.get("origin"),
                "destination": data.get("destination"),
                "cargo_type": data.get("cargo_type"),
                "weight_lbs": float(data.get("weight_lbs", 35000.0)),
                "declared_value_usd": float(data.get("declared_value_usd", 85000.0)),
                "shipping_mode": data.get("shipping_mode"),
                "status": data.get("status", "CONFIRMED"),
                "quantum_carrier_assigned": data.get("quantum_carrier_assigned"),
                "net_savings_usd": float(data.get("net_savings_usd", 0.0))
            }).execute()
        except Exception as sb_err:
            pass  # Table might not exist yet on Supabase

    return {
        "id": booking_id,
        "booking_ref": ref,
        **data,
        "created_at": now
    }

def get_all_cargo_bookings(user_email: str = None):
    """
    Bi-directional sync:
    1. Attempts to pull live modifications from Supabase table 'cargo_bookings'.
    2. Syncs any new/updated rows from Supabase into local database.
    3. Returns full live records.
    """
    # 1. Check Supabase for live changes made externally
    if sb_client:
        try:
            query = sb_client.table("cargo_bookings").select("*").order("created_at", desc=True)
            if user_email:
                query = query.eq("user_email", user_email.lower().strip())
            sb_res = query.execute()
            if sb_res.data and len(sb_res.data) > 0:
                conn = get_connection()
                cur = conn.cursor()
                for row in sb_res.data:
                    ref = row.get("booking_ref")
                    if ref:
                        cur.execute('''
                        INSERT INTO cargo_bookings (
                            id, booking_ref, user_email, origin, destination, cargo_type, weight_lbs, 
                            declared_value_usd, shipping_mode, scheduled_delivery, status, delay_risk_pct, 
                            risk_tier, demurrage_penalty_usd, quantum_carrier_assigned, net_savings_usd, qasm_file, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(booking_ref) DO UPDATE SET
                            origin=excluded.origin,
                            destination=excluded.destination,
                            status=excluded.status,
                            quantum_carrier_assigned=excluded.quantum_carrier_assigned,
                            net_savings_usd=excluded.net_savings_usd,
                            declared_value_usd=excluded.declared_value_usd,
                            weight_lbs=excluded.weight_lbs
                        ''', (
                            row.get("id") or str(uuid.uuid4()),
                            ref,
                            row.get("user_email") or "guest@freightguard.ai",
                            row.get("origin") or "Unknown Origin",
                            row.get("destination") or "Unknown Dest",
                            row.get("cargo_type") or "General Freight",
                            float(row.get("weight_lbs") or 35000.0),
                            float(row.get("declared_value_usd") or 85000.0),
                            row.get("shipping_mode") or "Standard Class",
                            row.get("scheduled_delivery") or "",
                            row.get("status") or "CONFIRMED",
                            float(row.get("delay_risk_pct") or 15.0),
                            row.get("risk_tier") or "LOW",
                            float(row.get("demurrage_penalty_usd") or 0.0),
                            row.get("quantum_carrier_assigned") or "Expedited Regional Express",
                            float(row.get("net_savings_usd") or 0.0),
                            row.get("qasm_file") or "",
                            row.get("created_at") or datetime.now().isoformat()
                        ))
                conn.commit()
                conn.close()
        except Exception as e:
            pass  # Table might not exist yet on Supabase

    # 2. Return all local cached & synced records
    conn = get_connection()
    cur = conn.cursor()
    if user_email:
        cur.execute("SELECT * FROM cargo_bookings WHERE user_email = ? ORDER BY created_at DESC", (user_email.lower().strip(),))
    else:
        cur.execute("SELECT * FROM cargo_bookings ORDER BY created_at DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

def get_database_status():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as count FROM cargo_bookings")
    bookings_cnt = cur.fetchone()["count"]
    cur.execute("SELECT COUNT(*) as count FROM users")
    users_cnt = cur.fetchone()["count"]
    conn.close()

    sb_status = "NOT_CONFIGURED"
    sb_table_found = False
    sb_rows_count = 0
    if sb_client:
        try:
            res = sb_client.table("cargo_bookings").select("*", count="exact").execute()
            sb_rows_count = len(res.data) if res.data else 0
            sb_status = f"CONNECTED_AND_ACTIVE ({sb_rows_count} cargo bookings in Supabase)"
            sb_table_found = True
        except Exception as e:
            err_str = str(e)
            if "PGRST205" in err_str:
                sb_status = "CONNECTED_WAITING_FOR_SQL_SCHEMA (cargo_bookings table not yet created)"
            else:
                sb_status = f"CONNECTED (Auth active, info: {err_str[:60]})"

    return {
        "sqlite": {
            "status": "ONLINE",
            "path": DB_PATH,
            "cargo_bookings_count": bookings_cnt,
            "registered_users_count": users_cnt
        },
        "supabase": {
            "status": sb_status,
            "url": SUPABASE_URL,
            "project_ref": os.getenv("SUPABASE_PROJECT_REF", "iwcqkrzefoawlpugergc"),
            "cargo_bookings_cloud_count": sb_rows_count
        }
    }


# ── Weather Intelligence Storage & Retrieval ───────────────────────────────────

def save_weather_forecasts(shipment_id: str, waypoints: list, evaluation: dict):
    """
    Persist waypoint weather forecasts and route evaluation with deduplication.
    """
    conn = get_connection()
    cur = conn.cursor()
    now_ts = datetime.now().isoformat()

    try:
        # Delete existing forecasts for this shipment before inserting fresh snapshot
        cur.execute("DELETE FROM shipment_weather_forecasts WHERE shipment_id = ?", (shipment_id,))

        for wp in waypoints:
            f_id = str(uuid.uuid4())
            cur.execute('''
            INSERT INTO shipment_weather_forecasts (
                id, shipment_id, waypoint_name, waypoint_type, latitude, longitude,
                forecast_valid_time, provider, retrieval_time, temperature_c, apparent_temp_c,
                precipitation_mm, precip_probability_pct, rain_mm, snowfall_cm,
                wind_speed_kmh, wind_gusts_kmh, visibility_m, cloud_cover_pct,
                weather_code, condition_text, condition_icon, is_stale
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                f_id,
                shipment_id,
                wp.get("waypoint_name", "Corridor Waypoint"),
                wp.get("waypoint_type", "WAYPOINT"),
                float(wp.get("latitude", 0.0)),
                float(wp.get("longitude", 0.0)),
                wp.get("forecast_valid_time", now_ts),
                wp.get("provider", "Open-Meteo"),
                wp.get("retrieval_time", now_ts),
                float(wp.get("temperature_c", 25.0)),
                float(wp.get("apparent_temp_c", 25.0)),
                float(wp.get("precipitation_mm", 0.0)),
                float(wp.get("precip_probability_pct", 0.0)),
                float(wp.get("rain_mm", 0.0)),
                float(wp.get("snowfall_cm", 0.0)),
                float(wp.get("wind_speed_kmh", 0.0)),
                float(wp.get("wind_gusts_kmh", 0.0)),
                float(wp.get("visibility_m", 10000.0)),
                float(wp.get("cloud_cover_pct", 0.0)),
                int(wp.get("weather_code", 0)),
                wp.get("condition_text", "Clear"),
                wp.get("condition_icon", "☀️"),
                int(wp.get("is_stale", 0))
            ))

        # Upsert weather_risk_evaluations
        e_id = str(uuid.uuid4())
        factors_json = json.dumps(evaluation.get("all_triggering_factors", []))
        cur.execute('''
        INSERT INTO weather_risk_evaluations (
            id, shipment_id, risk_tier, triggering_factors_json, explanation,
            affected_segment, recommended_action, evaluation_time, attribution
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(shipment_id) DO UPDATE SET
            risk_tier = excluded.risk_tier,
            triggering_factors_json = excluded.triggering_factors_json,
            explanation = excluded.explanation,
            affected_segment = excluded.affected_segment,
            recommended_action = excluded.recommended_action,
            evaluation_time = excluded.evaluation_time,
            attribution = excluded.attribution
        ''', (
            e_id,
            shipment_id,
            evaluation.get("overall_risk_tier", "LOW"),
            factors_json,
            evaluation.get("explanation", ""),
            evaluation.get("affected_segment", "Entire Route"),
            evaluation.get("recommended_action", ""),
            evaluation.get("evaluation_time", now_ts),
            evaluation.get("attribution", "Weather data by Open-Meteo.com")
        ))

        conn.commit()
    finally:
        conn.close()


def get_shipment_weather_data(shipment_id: str) -> Optional[dict]:
    """
    Retrieve stored waypoint forecasts and latest risk evaluation for a shipment.
    """
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM weather_risk_evaluations WHERE shipment_id = ?", (shipment_id,))
    eval_row = cur.fetchone()

    cur.execute("SELECT * FROM shipment_weather_forecasts WHERE shipment_id = ? ORDER BY forecast_valid_time ASC", (shipment_id,))
    forecast_rows = [dict(r) for r in cur.fetchall()]
    conn.close()

    if not eval_row and not forecast_rows:
        return None

    evaluation = dict(eval_row) if eval_row else {}
    if evaluation.get("triggering_factors_json"):
        try:
            evaluation["all_triggering_factors"] = json.loads(evaluation["triggering_factors_json"])
        except Exception:
            evaluation["all_triggering_factors"] = []

    return {
        "shipment_id": shipment_id,
        "evaluation": evaluation,
        "waypoints": forecast_rows,
        "attribution": "Weather data by Open-Meteo.com",
        "count": len(forecast_rows)
    }


def create_or_update_weather_incident(shipment_id: str, evaluation: dict, booking_info: Optional[dict] = None):
    """
    Integrate weather risk evaluation into freight exceptions (shipment_incidents).
    Deduplicates exceptions so scheduled polls update rather than duplicate.
    If risk drops to LOW, downgrades or resolves the exception cleanly.
    """
    risk_tier = evaluation.get("overall_risk_tier", "LOW")
    conn = get_connection()
    cur = conn.cursor()
    now_ts = datetime.now().isoformat()

    try:
        # Check if weather incident already exists for this shipment
        cur.execute(
            "SELECT id, dispatch_status FROM shipment_incidents WHERE shipment_id = ? AND cargo_department = 'Weather Risk'",
            (shipment_id,)
        )
        existing = cur.fetchone()

        if risk_tier in ("HIGH", "SEVERE"):
            briefing = (
                f"[WEATHER EXCEPTION] {evaluation.get('explanation')}\n"
                f"Protocol Recommendation: {evaluation.get('recommended_action')}\n"
                f"Data Source: Open-Meteo API | Evaluated: {evaluation.get('evaluation_time')}"
            )
            penalty = 18000.0 if risk_tier == "SEVERE" else 8500.0

            if existing:
                cur.execute('''
                UPDATE shipment_incidents SET
                    risk_tier = ?,
                    predicted_penalty_usd = ?,
                    genai_briefing = ?,
                    dispatch_status = 'WEATHER_ALERT_ACTIVE'
                WHERE id = ?
                ''', (risk_tier, penalty, briefing, existing["id"]))
            else:
                inc_id = str(uuid.uuid4())
                order_val = float(booking_info.get("declared_value_usd", 250000.0)) if booking_info else 250000.0
                cur.execute('''
                INSERT INTO shipment_incidents (
                    id, shipment_id, order_region, cargo_department, order_value_usd,
                    delay_probability_pct, risk_tier, predicted_penalty_usd,
                    selected_carrier, expedite_cost_usd, net_financial_savings_usd,
                    quantum_backend, genai_briefing, dispatch_status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    inc_id,
                    shipment_id,
                    evaluation.get("affected_segment", "Highway Corridor"),
                    "Weather Risk",
                    order_val,
                    88.0 if risk_tier == "SEVERE" else 68.0,
                    risk_tier,
                    penalty,
                    "Automated Corridor Governor",
                    0.0,
                    penalty * 0.75,
                    "Open-Meteo & QpiAI Sentinel",
                    briefing,
                    "WEATHER_ALERT_ACTIVE",
                    now_ts
                ))
        elif risk_tier == "LOW" and existing:
            # Downgrade / auto-resolve resolved weather alerts
            cur.execute(
                "UPDATE shipment_incidents SET dispatch_status = 'RESOLVED_NOMINAL_WEATHER', risk_tier = 'LOW' WHERE id = ?",
                (existing["id"],)
            )

        conn.commit()
    finally:
        conn.close()


def get_all_weather_alerts():
    """
    Get all active weather risk alerts across all shipments.
    """
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('''
    SELECT e.*, b.origin, b.destination, b.cargo_type, b.scheduled_delivery, b.booking_ref
    FROM weather_risk_evaluations e
    LEFT JOIN cargo_bookings b ON e.shipment_id = b.booking_ref OR e.shipment_id = b.id
    WHERE e.risk_tier IN ('MODERATE', 'HIGH', 'SEVERE')
    ORDER BY CASE e.risk_tier 
        WHEN 'SEVERE' THEN 1 
        WHEN 'HIGH' THEN 2 
        WHEN 'MODERATE' THEN 3 
        ELSE 4 END, e.evaluation_time DESC
    ''')
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()

    for r in rows:
        if r.get("triggering_factors_json"):
            try:
                r["all_triggering_factors"] = json.loads(r["triggering_factors_json"])
            except Exception:
                r["all_triggering_factors"] = []
    return rows
