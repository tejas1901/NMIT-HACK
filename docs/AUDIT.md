# FREIGHTIQ – System Audit & Endpoint Contract Specification

**Audit Timestamp:** 2026-10-29T18:45:00+05:30  
**Project:** FREIGHTIQ – Unified Intelligence Dashboard  
**Stack:** React 19 + Vite 8 + TypeScript + Tailwind CSS v4, iOS 26 "Liquid Glass" aesthetic  
**Author:** Antigravity Senior Full-Stack Autonomous Engineer

---

## 1. Executive Summary

This audit establishes the baseline for transitioning FREIGHTIQ from a hybrid mockup/prototype into a unified enterprise logistics intelligence platform. All frontend features from the newly added package (`c:\Users\LENOVO\OneDrive\Desktop\New folder`) have been integrated into this project workspace without modifying existing UI styling, animations, colors, component markup, or class names.

The platform unifies:
1. **Interactive Shipper Landing Page & Dual-Role Login** (`customer` & `admin`).
2. **Customer Freight Portal** (Booking, Real-Time Waypoint Tracking, Fleet Marketplace, Orders).
3. **Admin Operations Control Tower** (Multi-Agent Dispatch, Exception Management, Fleet Radar, Haul Queue, Yard Slot Map, Users & RBAC, Tamper-Evident Audit Logs).
4. **XGBoost 3.2 Demurrage & SLA Penalty Predictor** (Model telemetry, SHAP explainability, online inference).
5. **QpiAI Quantum QUBO Optimizer** (QCloud remote execution with local statevector simulator fallback).
6. **Open-Meteo Autonomous Weather Sentinel** (Automated 30-min polling along Indian Freight Corridors NH-44 / NH-48).
7. **Local Ollama GenAI Incident Briefing Copilot** (Grounded in XGBoost + QpiAI numbers with template fallback).

---

## 2. File Merge & Collision Resolution Report

Frontend files from `c:\Users\LENOVO\OneDrive\Desktop\New folder` were compared against the existing codebase (`c:\Users\LENOVO\OneDrive\Desktop\nmit hackathon\src`) and merged according to Rule 1 (preserve UI, keep newer UI version where files collide).

### Collisions & Resolution
| File | Status | Collision Detail & Resolution |
|---|---|---|
| `src/App.tsx` | Collided | Existing version (480 lines) contained early cockpit prototype. New version (882 lines) introduced 19 views, multi-tenant RBAC, role switcher, yard slot map, truck marketplace. **Resolution:** Kept newer version; wrapped with `UnifiedCockpitProps` and exported both `default App` and `export { App as UnifiedIntelligenceCockpit }` so `App.jsx` landing router functions seamlessly. |
| `src/components/Sidebar.tsx` | Collided | Existing version (295 lines) supported 6 legacy tabs. New version (482 lines) adds role badges, dynamic category accordions, customer vs admin tabs, drawer triggers. **Resolution:** Kept newer version. |
| `src/components/LiveEventTicker.tsx` | Collided | Added `role` prop awareness for targeted event streaming. **Resolution:** Kept newer version. |
| `src/components/NewBookingModal.tsx` | Collided | Refined booking form with direct state pass-through. **Resolution:** Kept newer version. |
| `src/data/mockData.ts` | Collided | Expanded dataset (416 lines → 862 lines) adding `INITIAL_HAUL_REQUESTS`, `INITIAL_AUDIT_LOGS`, and user profiles. **Resolution:** Kept newer version. |
| `src/types/index.ts` | Collided | Expanded type system (118 lines → 399 lines) defining `TruckListing`, `PurchasedTruckOrder`, `YardSlot`, `AuditLogEntry`, `ExceptionBlockerType`. **Resolution:** Kept newer version. |
| `src/views/CargoBookingsView.tsx` | Collided | Resolved layout bug on KPI Bento Row (`lg:grid-cols-5` preventing 5th card orphan). **Resolution:** Kept newer version. |

### New Files Added (from New folder)
- `src/roles.ts`: Access control matrix and role definitions (`admin` vs `customer`).
- `src/utils/extractor.ts`: Document disposition parser, PII masking, quote validation.
- `src/components/AdminBadge.tsx`: Visual security indicator.
- `src/components/PaymentModal.tsx`: Dual-currency (USD/INR) invoice and payment settlement drawer.
- `src/components/RoleSwitcherModal.tsx`: Interactive role switcher between Elena Vance and Rajathgowda.
- `src/components/TruckIntelligenceDrawer.tsx`: Deep telematics drawer for fleet assets.
- `src/data/labeledDocs.ts`: Structured demurrage document corpus.
- `src/data/truckCatalogData.ts`: Commercial truck marketplace inventory.
- `src/data/yardData.ts`: Intermodal container yard slot maps and gate queue.
- `src/views/AdminAllFleetOrdersView.tsx`: Comprehensive order audit.
- `src/views/AdminAllShipmentsView.tsx`: Master manifest table.
- `src/views/AdminAuditLogView.tsx`: Immutable compliance audit log.
- `src/views/AdminExceptionControlTowerView.tsx`: Multi-stage exception resolution cockpit.
- `src/views/AdminFleetRadarView.tsx`: Live GPS corridor radar map.
- `src/views/AdminHaulQueueView.tsx`: Spot-freight bid matching.
- `src/views/AdminTruckInventoryView.tsx`: Pricing and asset manager.
- `src/views/AdminUsersRolesView.tsx`: Directory access permissions.
- `src/views/AdminYardSlotMapView.tsx`: 2D interactive yard grid with crane optimization.
- `src/views/CustomerBookShipmentView.tsx`: Instant rate calculator & booking flow.
- `src/views/CustomerFleetOrdersView.tsx`: Shipper fleet acquisition portal.
- `src/views/CustomerShipmentsView.tsx`: Shipper manifest monitoring.
- `src/views/CustomerTrackingView.tsx`: Route waypoint telematics and delay risk breakdown.
- `src/views/TruckMarketplaceView.tsx`: Direct fleet vehicle procurement.

### Preserved Files (Untouched Existing UI)
- `src/App.jsx`: Root router coordinating Landing Page, Login Page, and Cockpit.
- `src/components/LoginCard.jsx`: Dual-mode customer/admin login card with restricted admin self-registration.
- `src/components/Navbar.jsx`: Enterprise navigation with brand, links, and role dropdown.
- `src/components/HeroSection.jsx`: Liquid glass interactive hero with floating telemetry cards.
- `src/components/Modal.jsx`: Modal suite (Exporters, Port Operators, Supply Chain, How It Works, Auth).
- `src/components/FeaturePanel.jsx`: Bottom feature grid.
- `src/components/FloatingInfoCard.jsx`: Holographic stats widgets.
- `src/components/TrackingOverlay.jsx`: SVG animated highway transit stream.
- `src/styles/landing.css`: Scoped landing page CSS.
- `src/App.css`: Master CSS design system.

---

## 3. Comprehensive Feature & Data Inventory

| View / Component | Feature Description | Data Displayed | Data Source (Mock vs API) | Target API Endpoint |
|---|---|---|---|---|
| **LandingPage** | Brand awareness, CTA routing, service info | Live telemetry bar, corridor status, modals | Hardcoded / static | `/api/stats` |
| **LoginPage** | Dual-role authentication (`customer` / `admin`) | Role switcher tabs, credentials form | Local storage / Supabase fallback | `POST /api/auth/login`, `POST /api/auth/register` |
| **CargoBookingsView** | Master manifest table, SLA indicators | Consignment lists, status, penalty risk | `INITIAL_CONSIGNMENTS` | `GET /api/shipments`, `POST /api/shipments` |
| **CustomerShipmentsView** | Shipper-specific active cargo list | Filtered customer shipments | `getShipmentsForRole` | `GET /api/shipments?role=customer` |
| **CustomerTrackingView** | Waypoint radar & telematics stream | Waypoint coordinates, speed, temp, wind | `WAYPOINTS_WEATHER` | `GET /api/weather/waypoints` |
| **CustomerBookShipmentView**| New freight booking & pricing quote | Corridor options, truck types, rate calculation | Local state | `POST /api/shipments` |
| **TruckMarketplaceView** | Commercial vehicle procurement | Fleet catalog, prices, horsepower, payload | `TRUCK_CATALOG` | `GET /api/fleet/trucks` |
| **CustomerFleetOrdersView**| Invoice downloads, delivery milestones | Fleet orders | `INITIAL_PURCHASED_ORDERS` | `GET /api/fleet/orders` |
| **AdminExceptionControlTowerView**| Multi-stage demurrage exception triage | Labeled carrier notices, PII masked text, evidence quotes | `labeledDocs.ts` | `POST /api/exceptions/resolve` |
| **AdminFleetRadarView** | GPS telematics stream across NH-48 / NH-44 | 6 telemetry units, geofences, speed governors | `TELEMETRY_UNITS` | `GET /api/fleet/telemetry` |
| **AdminYardSlotMapView** | 2D container yard slot allocation | Yard slots, stack heights, reefer power | `yardData.ts` | `POST /api/yard/optimize` |
| **AdminHaulQueueView** | Backhaul empty-leg pairing | Available return trips, net savings | `BACKHAUL_ROWS` | `POST /api/backhaul/match` |
| **AdminTruckInventoryView**| Fleet catalog price management | Truck specs, stock, list price | `TRUCK_CATALOG` | `PUT /api/fleet/trucks/:id` |
| **AdminAllShipmentsView** | Master cross-organization shipments | Global consignments | `INITIAL_CONSIGNMENTS` | `GET /api/admin/shipments` |
| **AdminAllFleetOrdersView**| Company-wide vehicle orders | All purchased fleet orders | `allOrders` | `GET /api/admin/orders` |
| **AdminUsersRolesView** | User directory and RBAC assignments | Users, roles, last active | `INITIAL_USERS` | `GET /api/admin/users` |
| **AdminAuditLogView** | Immutable compliance activity ledger | Actor, timestamp, category, severity, IP | `INITIAL_AUDIT_LOGS` | `GET /api/admin/audit-logs` |
| **XGBoostModelView** | ML model evaluation & live simulation | ROC-AUC, RMSE, MAE, feature importances | `INITIAL_FEATURE_IMPORTANCE` | `POST /ml/demurrage/predict`, `GET /ml/demurrage/metrics` |
| **CorridorSimulationView** | Route weather forecasting & mitigation | 5 waypoints, weather risk index, detour options | `WAYPOINTS_WEATHER` | `POST /ml/weather/waypoints` |
| **QpiAIQuantumView** | Carrier QUBO statevector compilation | 3 basis states, QASM code, energy histogram | `OPENQASM_CODE` | `POST /ml/optimize/carriers` |
| **QpiAiPilotView** | Industrial logistics conversational copilot | Grounded insights, weather triage, dispatch notices | Mock rule engine | `POST /ml/llm/insight` |

---

## 4. Backend Gap Analysis

| Feature Area | Current State | Required Architecture | Action Required |
|---|---|---|---|
| **API Gateway** | Direct Python FastAPI on port 8000 | Node.js + Express TypeScript Gateway on port 3001 | Build `backend-node/` with JWT auth, Zod validation, proxy, rate limiting, SSE stream. |
| **ML Microservice** | Monolithic Python scripts in root `src/` | Modular FastAPI in `backend-ml/` on port 8000 | Refactor `backend-ml/` with Pydantic v2 schemas, SHAP explainers, classical QUBO fallback, Open-Meteo client. |
| **Demurrage Model** | Basic models in `models/` | Calibrated XGBoost with metrics endpoint & automated retrain | Add `data/scripts/train.py`, `/ml/demurrage/predict`, `/ml/demurrage/train`. |
| **Quantum Optimization** | `src/quantum_optimizer.py` requires QpiAI key | Dual-mode solver: QpiAI remote + Classical fallback (Scipy/Annealing) | Standardize response schema with `solver: 'qpiai' \| 'classical-fallback'`. |
| **Route Weather** | In-process timer in `weather_scheduler.py` | Standalone endpoint `POST /ml/weather/waypoints` | Wire Open-Meteo free API without API keys; compute leg risk score. |
| **LLM Insights** | `src/genai_copilot.py` calls Ollama localhost:11434 | `POST /ml/llm/insight` with Ollama + deterministic template fallback | Standardize schema with fallback guarantee. |
| **Database & RLS** | Flat table schema in `supabase_schema.sql` | 13 relational tables with complete RLS policies and seed data | Create `supabase/migrations/001_initial_schema.sql` and `supabase/seed.sql`. |
| **Automation** | Single static JSON `n8n_workflow_freightguard.json` | 4 importable n8n workflows in `n8n/` | Export scheduled weather poller, retrain job, risk alert, and carrier optimization workflows. |
| **Dataset Pipeline** | Raw CSVs in `data/` | Synthetic data generator (≥100k rows) + feature engineering pipeline | Create `data/scripts/generate_synthetic.py` & `data/scripts/train.py`. |

---

## 5. Unified Endpoint Contract Table

### Node Gateway (`backend-node`) – `/api/*`
| Method | Path | Request Body | Response Body | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | `{ email, password, role }` | `{ success, user, access_token }` | Supabase auth verification |
| `POST` | `/api/auth/register`| `{ email, password, full_name, company, role }` | `{ success, user, access_token }` | Customer self-registration |
| `GET` | `/api/shipments` | Query: `role?, status?` | `[ Consignment ]` | Consignment list filtered by tenant/role |
| `POST` | `/api/shipments` | `ConsignmentInput` | `{ success, consignment }` | Create new cargo booking |
| `GET` | `/api/weather/live` | Query: `corridor?` | `[ WaypointWeather ]` | Waypoint telemetry from Open-Meteo via ML service |
| `POST` | `/api/demurrage/predict` | `DemurrageInput` | `DemurragePrediction` | Forward to ML XGBoost model |
| `POST` | `/api/optimize/carriers` | `CarrierOptimizationInput` | `CarrierOptimizationOutput` | Forward to ML QpiAI/Classical solver |
| `POST` | `/api/copilot/chat` | `{ query, context? }` | `{ reply, badges, generated_briefing }`| Forward to ML LLM service |
| `GET` | `/api/fleet/telemetry` | None | `Record<string, TelemetryUnit>` | Real-time GPS telematics |
| `GET` | `/api/admin/audit-logs`| None | `[ AuditLogEntry ]` | Immutable activity records |
| `POST` | `/api/webhooks/n8n` | Webhook Payload | `{ received: true, eventId }` | Inbound webhook from n8n |
| `GET` | `/api/events/stream` | None (SSE header) | `text/event-stream` | Server-Sent Events stream for live alerts |

### ML Microservice (`backend-ml`) – `/ml/*`
| Method | Path | Request Body | Response Body | Description |
|---|---|---|---|---|
| `GET` | `/ml/health` | None | `{ status: "ok", version: "3.2.0" }` | Health check |
| `POST` | `/ml/demurrage/predict` | `DemurragePredictRequest` | `DemurragePredictResponse` | XGBoost demurrage probability, days, cost, SHAP |
| `POST` | `/ml/demurrage/train` | `{ data_path?, test_size? }` | `TrainMetricsResponse` | Retrain model, compute AUC, RMSE, MAE, save joblib |
| `GET` | `/ml/demurrage/metrics` | None | `ModelMetrics` | Latest model evaluation metrics & top SHAP features |
| `POST` | `/ml/weather/waypoints` | `RouteWaypointsRequest` | `RouteWeatherResponse` | Open-Meteo live waypoint forecast + corridor risk score |
| `POST` | `/ml/optimize/carriers` | `CarrierOptimizeRequest` | `CarrierOptimizeResponse` | QpiAI QUBO or classical simulated annealing solver |
| `GET` | `/ml/fleet/corridors` | None | `CorridorMetricsResponse` | Aggregated corridor KPIs (transit time, delay rate, risk) |
| `POST` | `/ml/llm/insight` | `LLMInsightRequest` | `LLMInsightResponse` | Grounded Ollama briefing with template fallback |
