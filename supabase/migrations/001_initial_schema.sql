-- ====================================================================
-- FREIGHTIQ – Unified Intelligence Schema & RLS Policies
-- Target: Supabase Postgres
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table (Users & Roles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    company TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ports Table
CREATE TABLE IF NOT EXISTS public.ports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    lat NUMERIC(9,6),
    lng NUMERIC(9,6),
    avg_dwell_days NUMERIC(4,2) DEFAULT 3.5,
    congestion_index NUMERIC(4,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Carriers Table
CREATE TABLE IF NOT EXISTS public.carriers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    scac_code TEXT,
    service_type TEXT NOT NULL,
    reliability_score NUMERIC(5,2) DEFAULT 90.0,
    base_rate_multiplier NUMERIC(4,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Corridors Table
CREATE TABLE IF NOT EXISTS public.corridors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    origin_city TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    distance_km NUMERIC(8,2) NOT NULL,
    avg_transit_hours NUMERIC(6,2) NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Route Waypoints Table
CREATE TABLE IF NOT EXISTS public.routes_waypoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    corridor_id UUID REFERENCES public.corridors(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    location_name TEXT NOT NULL,
    lat NUMERIC(9,6) NOT NULL,
    lng NUMERIC(9,6) NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('ORIGIN', 'WAYPOINT', 'GHAT PASS', 'DESTINATION')),
    distance_km NUMERIC(8,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Containers Table
CREATE TABLE IF NOT EXISTS public.containers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_number TEXT UNIQUE NOT NULL,
    container_type TEXT NOT NULL DEFAULT 'Dry Van',
    max_payload_kg NUMERIC(10,2) DEFAULT 28000.0,
    tare_weight_kg NUMERIC(10,2) DEFAULT 3800.0,
    current_status TEXT DEFAULT 'IN_TRANSIT',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Shipments Table
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    tracking_ref TEXT UNIQUE NOT NULL,
    container_id UUID REFERENCES public.containers(id) ON DELETE SET NULL,
    carrier_id UUID REFERENCES public.carriers(id) ON DELETE SET NULL,
    corridor_id UUID REFERENCES public.corridors(id) ON DELETE SET NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    cargo_description TEXT NOT NULL,
    declared_value NUMERIC(12,2) NOT NULL,
    weight_kg NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'AT RISK')),
    eta TIMESTAMPTZ,
    delay_risk_score NUMERIC(5,2) DEFAULT 15.0,
    risk_tier TEXT DEFAULT 'LOW',
    demurrage_estimated NUMERIC(12,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Weather Snapshots Table
CREATE TABLE IF NOT EXISTS public.weather_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waypoint_id UUID REFERENCES public.routes_waypoints(id) ON DELETE CASCADE,
    corridor_id UUID REFERENCES public.corridors(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    condition TEXT NOT NULL,
    temperature_c NUMERIC(5,2) NOT NULL,
    wind_kmh NUMERIC(5,2) NOT NULL,
    precipitation_mm NUMERIC(5,2) NOT NULL,
    visibility_km NUMERIC(5,2) NOT NULL,
    weather_risk_score NUMERIC(5,2) NOT NULL,
    risk_tier TEXT DEFAULT 'LOW',
    raw_open_meteo JSONB
);

-- 9. Demurrage Predictions Table
CREATE TABLE IF NOT EXISTS public.demurrage_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
    model_version TEXT NOT NULL DEFAULT 'XGBoost-3.2.0',
    dwell_days_so_far NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    congestion_index NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    weather_risk_index NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    predicted_demurrage_prob NUMERIC(5,2) NOT NULL,
    predicted_dwell_days NUMERIC(5,2) NOT NULL,
    predicted_cost NUMERIC(12,2) NOT NULL,
    shap_contributions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Optimization Runs Table
CREATE TABLE IF NOT EXISTS public.optimization_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
    solver_used TEXT NOT NULL CHECK (solver_used IN ('qpiai', 'classical-fallback')),
    experiment_name TEXT DEFAULT 'Carrier QUBO',
    qubits_used INTEGER DEFAULT 3,
    circuit_qasm TEXT,
    candidates JSONB NOT NULL,
    selected_carrier TEXT NOT NULL,
    expedite_cost NUMERIC(12,2) NOT NULL,
    net_savings NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Fleet Vehicles Table
CREATE TABLE IF NOT EXISTS public.fleet_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_number TEXT UNIQUE NOT NULL,
    plate_number TEXT UNIQUE NOT NULL,
    model_name TEXT NOT NULL,
    current_status TEXT DEFAULT 'On Route',
    current_lat NUMERIC(9,6),
    current_lng NUMERIC(9,6),
    speed_kmh NUMERIC(5,2) DEFAULT 0.0,
    assigned_corridor_id UUID REFERENCES public.corridors(id) ON DELETE SET NULL,
    efficiency_km_l NUMERIC(4,2) DEFAULT 4.2,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('DEMURRAGE_RISK', 'SEVERE_WEATHER', 'SLA_BREACH', 'OPTIMIZATION_ACTION')),
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    message TEXT NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    actor_email TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('OVERRIDE', 'PRICING', 'TELEMETRY', 'SECURITY', 'ASSIGNMENT', 'AUTH')),
    details TEXT NOT NULL,
    ip_address TEXT DEFAULT '127.0.0.1',
    severity TEXT DEFAULT 'INFO',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- Performance Indexes (Foreign keys & frequently filtered columns)
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_routes_waypoints_corridor ON public.routes_waypoints(corridor_id);
CREATE INDEX IF NOT EXISTS idx_shipments_user ON public.shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_weather_snapshots_corridor ON public.weather_snapshots(corridor_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_demurrage_predictions_shipment ON public.demurrage_predictions(shipment_id);
CREATE INDEX IF NOT EXISTS idx_optimization_runs_shipment ON public.optimization_runs(shipment_id);
CREATE INDEX IF NOT EXISTS idx_alerts_shipment ON public.alerts(shipment_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.alerts(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ====================================================================
-- Row Level Security (RLS) Configuration
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corridors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes_waypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demurrage_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimization_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view & update own profile; admins can view all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()));

-- Reference Tables: Anyone authenticated can read
CREATE POLICY "Authenticated read ports" ON public.ports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage ports" ON public.ports FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Authenticated read carriers" ON public.carriers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage carriers" ON public.carriers FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Authenticated read corridors" ON public.corridors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage corridors" ON public.corridors FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Authenticated read waypoints" ON public.routes_waypoints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage waypoints" ON public.routes_waypoints FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Authenticated read fleet" ON public.fleet_vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage fleet" ON public.fleet_vehicles FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Authenticated read containers" ON public.containers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage containers" ON public.containers FOR ALL TO authenticated USING (public.is_admin());

-- Shipments: Users can view own; Admins can view/edit all
CREATE POLICY "Users view own shipments" ON public.shipments FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY "Users create shipments" ON public.shipments FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY "Admins update shipments" ON public.shipments FOR UPDATE TO authenticated
  USING (public.is_admin());

-- Weather snapshots & Predictions: Authenticated read
CREATE POLICY "Authenticated read weather" ON public.weather_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read predictions" ON public.demurrage_predictions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read optimization" ON public.optimization_runs FOR SELECT TO authenticated USING (true);

-- Alerts: Users view alerts for their shipments; admins view all
CREATE POLICY "Users view alerts" ON public.alerts FOR SELECT TO authenticated
  USING (
    public.is_admin() OR 
    EXISTS (SELECT 1 FROM public.shipments WHERE shipments.id = alerts.shipment_id AND shipments.user_id = (SELECT auth.uid()))
  );
CREATE POLICY "Admins manage alerts" ON public.alerts FOR ALL TO authenticated USING (public.is_admin());

-- Audit logs: Admins view all; authenticated can insert
CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Authenticated insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Realtime Publication
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments, public.alerts, public.weather_snapshots, public.fleet_vehicles;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;
