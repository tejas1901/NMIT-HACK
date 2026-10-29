import os
import json
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://iwcqkrzefoawlpugergc.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SECRET_KEY")

if not SUPABASE_KEY:
    print("[-] Supabase key not found in .env")
    exit(1)

sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 1. Indian Cargo Bookings Manifest Dataset
INDIAN_CARGO_BOOKINGS = [
    {
        "booking_ref": "CRG-24551",
        "user_email": "ananya.verma@vikasintermodal.in",
        "origin": "JNPT Port Terminal Hub",
        "destination": "Chakan Industrial Yard",
        "cargo_type": "Industrial Goods",
        "weight_lbs": 42000.0,
        "declared_value_usd": 125000.0,
        "shipping_mode": "First Class",
        "status": "CONFIRMED",
        "delay_risk_pct": 99.8,
        "risk_tier": "CRITICAL",
        "demurrage_penalty_usd": 93.22,
        "quantum_carrier_assigned": "Expedited Regional Express",
        "net_savings_usd": 37.24
    },
    {
        "booking_ref": "CRG-21818",
        "user_email": "ananya.verma@vikasintermodal.in",
        "origin": "JNPT Port Terminal Hub",
        "destination": "Pune Bhosari MIDC",
        "cargo_type": "Perishable Foodstuff",
        "weight_lbs": 42000.0,
        "declared_value_usd": 124997.0,
        "shipping_mode": "Second Class",
        "status": "CONFIRMED",
        "delay_risk_pct": 75.5,
        "risk_tier": "MODERATE",
        "demurrage_penalty_usd": 91.12,
        "quantum_carrier_assigned": "Expedited Regional Express",
        "net_savings_usd": 35.45
    },
    {
        "booking_ref": "CRG-20835",
        "user_email": "ananya.verma@vikasintermodal.in",
        "origin": "Chennai Port Container Terminal",
        "destination": "Sriperumbudur Industrial Hub",
        "cargo_type": "Pharmaceuticals (Cold-Chain)",
        "weight_lbs": 32000.0,
        "declared_value_usd": 240000.0,
        "shipping_mode": "First Class",
        "status": "CONFIRMED",
        "delay_risk_pct": 99.8,
        "risk_tier": "CRITICAL",
        "demurrage_penalty_usd": 106.56,
        "quantum_carrier_assigned": "Expedited Regional Express",
        "net_savings_usd": 48.58
    },
    {
        "booking_ref": "CRG-8910",
        "user_email": "ananya.verma@vikasintermodal.in",
        "origin": "JNPT Terminal 02 (Clear)",
        "destination": "Chakan Auto Cluster (Arrived)",
        "cargo_type": "Industrial Machinery",
        "weight_lbs": 44000.0,
        "declared_value_usd": 185000.0,
        "shipping_mode": "First Class",
        "status": "DELIVERED",
        "delay_risk_pct": 78.4,
        "risk_tier": "MODERATE",
        "demurrage_penalty_usd": 125.0,
        "quantum_carrier_assigned": "Dedicated Priority Air Cargo",
        "net_savings_usd": 92.5
    },
    {
        "booking_ref": "CRG-8911",
        "user_email": "ananya.verma@vikasintermodal.in",
        "origin": "Mundra Port Terminal 4",
        "destination": "Sanand Industrial Area",
        "cargo_type": "Pharmaceuticals (Cold-Chain)",
        "weight_lbs": 28500.0,
        "declared_value_usd": 340000.0,
        "shipping_mode": "Same Day Priority",
        "status": "DISPATCHED",
        "delay_risk_pct": 88.2,
        "risk_tier": "HIGH",
        "demurrage_penalty_usd": 210.0,
        "quantum_carrier_assigned": "Dedicated Priority Air Cargo",
        "net_savings_usd": 115.0
    },
    {
        "booking_ref": "CRG-9942",
        "user_email": "ananya.verma@vikasintermodal.in",
        "origin": "Visakhapatnam Port Container Depot",
        "destination": "Hyderabad Whitefield Logistics Park",
        "cargo_type": "Heavy Transformers",
        "weight_lbs": 68000.0,
        "declared_value_usd": 520000.0,
        "shipping_mode": "First Class",
        "status": "CONFIRMED",
        "delay_risk_pct": 94.6,
        "risk_tier": "CRITICAL",
        "demurrage_penalty_usd": 280.0,
        "quantum_carrier_assigned": "Expedited Regional Express",
        "net_savings_usd": 142.0
    },
    {
        "booking_ref": "CRG-4401",
        "user_email": "rahul.deshmukh@bharattrans.in",
        "origin": "Kolkata Haldia Port",
        "destination": "Durgapur Steel Corridor",
        "cargo_type": "Structural Steel",
        "weight_lbs": 55000.0,
        "declared_value_usd": 210000.0,
        "shipping_mode": "Standard Class",
        "status": "IN TRANSIT",
        "delay_risk_pct": 32.0,
        "risk_tier": "LOW",
        "demurrage_penalty_usd": 0.0,
        "quantum_carrier_assigned": "Western Express Logistics",
        "net_savings_usd": 0.0
    },
    {
        "booking_ref": "CRG-4402",
        "user_email": "priya.nair@cochinlogistics.in",
        "origin": "Cochin Vallarpadam ICTT",
        "destination": "Bengaluru Electronic City",
        "cargo_type": "Electronics Components",
        "weight_lbs": 18000.0,
        "declared_value_usd": 450000.0,
        "shipping_mode": "First Class",
        "status": "CONFIRMED",
        "delay_risk_pct": 14.5,
        "risk_tier": "LOW",
        "demurrage_penalty_usd": 0.0,
        "quantum_carrier_assigned": "Western Express Logistics",
        "net_savings_usd": 850.0
    }
]

def run_sync():
    print(f"[*] Uploading datasets to Supabase cloud at {SUPABASE_URL}...")

    # Save to local CSV as well for user reference
    df_manifest = pd.DataFrame(INDIAN_CARGO_BOOKINGS)
    csv_file = os.path.join("data", "indian_cargo_bookings_manifest.csv")
    df_manifest.to_csv(csv_file, index=False)
    print(f"[+] Exported CSV to {csv_file}")

    # 1. Sync cargo_bookings to Supabase
    try:
        res = sb.table("cargo_bookings").upsert(INDIAN_CARGO_BOOKINGS, on_conflict="booking_ref").execute()
        print(f"[+] Successfully inserted/upserted {len(INDIAN_CARGO_BOOKINGS)} live cargo bookings to 'cargo_bookings'!")
    except Exception as e:
        print(f"[-] cargo_bookings sync error: {e}")

    # 2. Sync profiles table
    PROFILES = [
        {
            "id": "usr-default",
            "full_name": "Ananya Verma",
            "company": "Vikas Intermodal Corp",
            "email": "ananya.verma@vikasintermodal.in",
            "phone": "+91 98201 55194",
            "gstin": "27AABCV1234F1Z5",
            "corridor": "NH-48 (Bengaluru - Mumbai JNPT)",
            "depot": "JNPT Nhava Sheva Terminal 3",
            "role": "CUSTOMER",
            "role_label": "Verified Customer"
        },
        {
            "id": "usr-admin",
            "full_name": "Rajathgowda",
            "company": "FreightIQ Freight Operations Lead",
            "email": "rajathgowda@gmail.com",
            "phone": "+91 98450 12345",
            "gstin": "29AABCU9603R1ZM",
            "corridor": "NH-48 Corridor Control",
            "depot": "Bangalore National Control Tower",
            "role": "ADMIN",
            "role_label": "Master Administrator"
        }
    ]
    try:
        sb.table("profiles").upsert(PROFILES, on_conflict="id").execute()
        print(f"[+] Successfully inserted {len(PROFILES)} profiles to 'profiles' table!")
    except Exception as e:
        print(f"[-] profiles sync error: {e}")

    # 3. Verify counts in Supabase
    b_count = len(sb.table("cargo_bookings").select("id").execute().data or [])
    s_count = len(sb.table("shipment_datasets").select("order_id").execute().data or [])
    p_count = len(sb.table("profiles").select("id").execute().data or [])
    m_count = len(sb.table("model_training_runs").select("id").execute().data or [])

    print("\n=======================================================")
    print(f"    SUPABASE CLOUD DATASET INGESTION COMPLETED")
    print("=======================================================")
    print(f"  • cargo_bookings:     {b_count} rows live")
    print(f"  • shipment_datasets:  {s_count} rows live (from DataCo CSV)")
    print(f"  • profiles:           {p_count} rows live")
    print(f"  • model_training_runs:{m_count} rows live")
    print("=======================================================")

if __name__ == "__main__":
    run_sync()
