-- ====================================================================
-- FREIGHTGUARD AI - SUPABASE DATABASE SCHEMA
-- Integrated with QpiAI Quantum Engine, Predictive ML & GenAI Copilot
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Table: shipment_datasets (Live Supply Chain Telemetry Data)
CREATE TABLE IF NOT EXISTS public.shipment_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT,
    shipping_mode TEXT,
    order_region TEXT,
    market TEXT,
    customer_segment TEXT,
    department_name TEXT,
    days_for_shipment_scheduled INTEGER,
    order_item_total NUMERIC(10, 2),
    order_item_quantity INTEGER,
    order_item_discount_rate NUMERIC(5, 2),
    late_delivery_risk INTEGER,
    penalty_usd NUMERIC(10, 2),
    risk_tier TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: model_training_runs (ML Training & Evaluation Metrics)
CREATE TABLE IF NOT EXISTS public.model_training_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    framework TEXT DEFAULT 'XGBoost',
    train_rows INTEGER,
    test_rows INTEGER,
    accuracy NUMERIC(6, 4),
    precision_score NUMERIC(6, 4),
    recall_score NUMERIC(6, 4),
    f1_score NUMERIC(6, 4),
    roc_auc NUMERIC(6, 4),
    mae_usd NUMERIC(10, 2),
    rmse_usd NUMERIC(10, 2),
    r2_score NUMERIC(6, 4),
    top_features JSONB,
    hyperparameters JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: qpiai_quantum_jobs (QpiAI QCloud & Circuit Telemetry)
CREATE TABLE IF NOT EXISTS public.qpiai_quantum_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id TEXT,
    experiment_name TEXT DEFAULT 'Default Experiment',
    device_name TEXT,
    quantum_backend TEXT,
    is_cloud_executed BOOLEAN DEFAULT FALSE,
    shots INTEGER DEFAULT 1000,
    thetas JSONB,
    qasm_code TEXT,
    selected_carrier TEXT,
    expedite_cost_usd NUMERIC(10, 2),
    net_savings_usd NUMERIC(10, 2),
    status TEXT DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: shipment_incidents (Full Pipeline Real-Time Triage & Dispatch)
CREATE TABLE IF NOT EXISTS public.shipment_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id TEXT NOT NULL,
    order_region TEXT,
    cargo_department TEXT,
    order_value_usd NUMERIC(10, 2),
    delay_probability_pct NUMERIC(5, 2),
    risk_tier TEXT,
    predicted_penalty_usd NUMERIC(10, 2),
    selected_carrier TEXT,
    expedite_cost_usd NUMERIC(10, 2),
    net_financial_savings_usd NUMERIC(10, 2),
    quantum_backend TEXT,
    genai_briefing TEXT,
    dispatch_status TEXT DEFAULT 'DISPATCHED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table: cargo_bookings (Commercial Cargo Consignments)
CREATE TABLE IF NOT EXISTS public.cargo_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_ref TEXT UNIQUE NOT NULL,
    user_email TEXT,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    cargo_type TEXT NOT NULL,
    weight_lbs NUMERIC(10, 2) DEFAULT 35000.0,
    declared_value_usd NUMERIC(12, 2) DEFAULT 85000.0,
    shipping_mode TEXT DEFAULT 'Standard Class',
    scheduled_delivery TEXT,
    status TEXT DEFAULT 'CONFIRMED',
    delay_risk_pct NUMERIC(5, 2) DEFAULT 15.0,
    risk_tier TEXT DEFAULT 'LOW',
    demurrage_penalty_usd NUMERIC(10, 2) DEFAULT 0.0,
    quantum_carrier_assigned TEXT DEFAULT 'Expedited Regional Express',
    net_savings_usd NUMERIC(10, 2) DEFAULT 0.0,
    qasm_file TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- Enable Row Level Security (RLS) on all exposed tables
-- --------------------------------------------------------------------
ALTER TABLE public.shipment_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_training_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qpiai_quantum_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargo_bookings ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- Permissive Policies for Webhook, API, and Dashboard Clients
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow all access to shipment_datasets" ON public.shipment_datasets;
CREATE POLICY "Allow all access to shipment_datasets" ON public.shipment_datasets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to model_training_runs" ON public.model_training_runs;
CREATE POLICY "Allow all access to model_training_runs" ON public.model_training_runs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to qpiai_quantum_jobs" ON public.qpiai_quantum_jobs;
CREATE POLICY "Allow all access to qpiai_quantum_jobs" ON public.qpiai_quantum_jobs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to shipment_incidents" ON public.shipment_incidents;
CREATE POLICY "Allow all access to shipment_incidents" ON public.shipment_incidents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to cargo_bookings" ON public.cargo_bookings;
CREATE POLICY "Allow all access to cargo_bookings" ON public.cargo_bookings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- Enable Realtime Replication Publication
-- --------------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cargo_bookings;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shipment_incidents;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;
