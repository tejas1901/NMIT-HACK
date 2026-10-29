-- ====================================================================
-- FREIGHTIQ – Supabase Seed Data
-- ====================================================================

-- 1. Reference Ports
INSERT INTO public.ports (code, name, country, lat, lng, avg_dwell_days, congestion_index) VALUES
('IN-BOM', 'Jawaharlal Nehru Port Trust (JNPT)', 'India', 18.9500, 72.9500, 3.2, 1.45),
('IN-MAA', 'Chennai Port Trust Terminal', 'India', 13.0827, 80.2707, 2.8, 1.15),
('IN-MUN', 'Mundra Port & Special Economic Zone', 'India', 22.8396, 69.7042, 2.1, 0.90),
('US-SAV', 'Savannah Container Terminal', 'USA', 32.0809, -81.0912, 4.5, 1.80),
('NL-RTM', 'Port of Rotterdam Intermodal Dock', 'Netherlands', 51.9244, 4.4777, 2.4, 1.05)
ON CONFLICT (code) DO NOTHING;

-- 2. Reference Carriers
INSERT INTO public.carriers (name, scac_code, service_type, reliability_score, base_rate_multiplier) VALUES
('Dedicated Priority Air Cargo', 'DPAC', 'Air Freight Express', 99.2, 2.25),
('Expedited Regional Express', 'EREX', 'Highway Express Platoon', 92.4, 1.35),
('Ground Priority Freight', 'GPFR', 'Standard Truckload', 78.5, 1.00),
('Ocean Prime Multimodal', 'OPMM', 'Intermodal Container', 84.1, 0.85)
ON CONFLICT (name) DO NOTHING;

-- 3. Reference Corridors
INSERT INTO public.corridors (name, code, origin_city, destination_city, distance_km, avg_transit_hours, status) VALUES
('NH-48 Golden Quadrilateral (Bengaluru - Mumbai JNPT)', 'NH-48', 'Bengaluru', 'Mumbai', 980.0, 18.5, 'ACTIVE'),
('NH-44 North-South Highway (Bengaluru - Hyderabad)', 'NH-44', 'Bengaluru', 'Hyderabad', 570.0, 10.5, 'ACTIVE'),
('Chennai Sea Port Intermodal Corridor', 'CH-01', 'Bengaluru', 'Chennai', 345.0, 7.0, 'ACTIVE')
ON CONFLICT (name) DO NOTHING;

-- 4. Waypoints along NH-48
DO $$
DECLARE
  v_corridor_id UUID;
BEGIN
  SELECT id INTO v_corridor_id FROM public.corridors WHERE code = 'NH-48' LIMIT 1;

  IF v_corridor_id IS NOT NULL THEN
    INSERT INTO public.routes_waypoints (corridor_id, sequence_order, location_name, lat, lng, stage, distance_km) VALUES
    (v_corridor_id, 1, 'Bengaluru Logistics Park (NH-48)', 12.9716, 77.5946, 'ORIGIN', 0.0),
    (v_corridor_id, 2, 'Hubballi Highway Waypoint', 15.3647, 75.1240, 'WAYPOINT', 410.0),
    (v_corridor_id, 3, 'Pune Chakan Industrial Hub', 18.7600, 73.8600, 'WAYPOINT', 840.0),
    (v_corridor_id, 4, 'Khandala Ghat Mountain Pass', 18.7500, 73.3700, 'GHAT PASS', 890.0),
    (v_corridor_id, 5, 'Mumbai JNPT Intermodal Yard', 18.9500, 72.9500, 'DESTINATION', 980.0);
  END IF;
END $$;

-- 5. Reference Containers
INSERT INTO public.containers (container_number, container_type, max_payload_kg, tare_weight_kg, current_status) VALUES
('MSKU-908231', '40ft High Cube Reefer', 29500.0, 4200.0, 'IN_TRANSIT'),
('CMAU-419208', '40ft Standard Dry', 28000.0, 3750.0, 'IN_TRANSIT'),
('HLCU-102938', '20ft Standard Dry', 21800.0, 2200.0, 'YARD_STAGED'),
('TGHU-882910', '40ft High Cube Dry', 28600.0, 3900.0, 'GATE_IN')
ON CONFLICT (container_number) DO NOTHING;

-- 6. Reference Fleet Vehicles
INSERT INTO public.fleet_vehicles (unit_number, plate_number, model_name, current_status, current_lat, current_lng, speed_kmh, efficiency_km_l) VALUES
('Unit #4021', 'KA-01-EQ-8812', 'Volvo FH16 750 (Electric Hybrid)', 'On Route', 18.7510, 73.3720, 62.5, 4.8),
('Unit #4022', 'MH-12-BF-4491', 'Scania R500 V8 Streamline', 'On Route', 15.3710, 75.1290, 71.0, 4.1),
('Unit #4023', 'KA-04-MG-3301', 'Tata Prima 5530.S Euro VI', 'Standby', 12.9810, 77.6010, 0.0, 4.3),
('Unit #4024', 'MH-46-AR-9902', 'BharatBenz 4028T Heavy Haul', 'Dwell', 18.9550, 72.9520, 0.0, 3.9)
ON CONFLICT (unit_number) DO NOTHING;

-- 7. Audit Log Baseline
INSERT INTO public.audit_logs (actor_name, actor_email, actor_role, action, category, details, ip_address, severity) VALUES
('System Administrator', 'admin@freightiq.ai', 'admin', 'SYSTEM_INITIALIZATION', 'SECURITY', 'FreightIQ Core telemetry engines and Supabase RLS policies successfully loaded.', '127.0.0.1', 'INFO'),
('Elena Vance', 'elena@vanceintermodal.com', 'user', 'USER_SESSION_ESTABLISHED', 'AUTH', 'Customer Shipper session authenticated for Vance Intermodal Corp.', '103.21.244.18', 'INFO');
