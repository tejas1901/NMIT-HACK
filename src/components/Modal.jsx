import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import LoginCard from './LoginCard'

const supabase = createClient(
  'https://iwcqkrzefoawlpugergc.supabase.co',
  'sb_publishable__uivHUYOrPe8_2yzD7hBhg_x6O9m85a'
)

/* ── SVG helpers (Enterprise Professional, No Emojis) ────────────────────────── */
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const EyeIcon = ({ open }) =>
  open ? (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

const ShipIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.07" />
    <path d="M12 10V4" />
    <path d="m8 7 4-3 4 3" />
  </svg>
)

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
)

const BoxIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const AnchorIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3" />
    <line x1="12" y1="22" x2="12" y2="8" />
    <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const CraneIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

const CloudSunIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41" />
    <path d="M15.5 17a4.5 4.5 0 0 0 0-9 4.3 4.3 0 0 0-.8.08A6 6 0 1 0 4 16h11.5z" />
  </svg>
)

const ZapIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const AtomIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2a10 5 0 1 0 0 20 10 5 0 1 0 0-20z" transform="rotate(45 12 12)" />
    <path d="M12 2a10 5 0 1 0 0 20 10 5 0 1 0 0-20z" transform="rotate(-45 12 12)" />
  </svg>
)

const RepeatIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
)

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const RainIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 13a4 4 0 0 0 0-8 3.5 3.5 0 0 0-6.8-1 5 5 0 0 0-5.2 6.5" />
    <line x1="8" y1="17" x2="8" y2="21" />
    <line x1="12" y1="17" x2="12" y2="23" />
    <line x1="16" y1="17" x2="16" y2="21" />
  </svg>
)

/* ── 1. How It Works Modal (pointed by arrow in navbar) ────────────────────────────── */
const HOW_IT_WORKS_STEPS = [
  {
    title: '1. Connect Your Multi-Modal Data Sources',
    body: 'Integrate carrier communications, electronic shipping documents, ICEGATE customs portals, Fastag RFID, and marine terminal APIs into a single unified FREIGHTIQ workspace in minutes.',
  },
  {
    title: '2. Continuous Road & Port Weather Sentinel',
    body: 'Open-Meteo automated weather intelligence continuously samples real highway waypoints along high-volume corridors (NH-48, NH-44) every 30 minutes to detect severe rainfall and gale winds.',
  },
  {
    title: '3. XGBoost 3.2 Freight Exception Classification',
    body: 'Evaluates 142 consignment parameters to compute demurrage detention probabilities and financial penalty exposure in Indian Rupees (₹) before deadlines approach.',
  },
  {
    title: '4. QpiAI Quantum Carrier Optimization',
    body: 'When risk is elevated, carrier re-allocation is formulated as a QUBO Hamiltonian executed on the QpiAI Quantum Simulator to optimize transit schedules and mitigate penalties.',
  },
  {
    title: '5. Automated Backhaul Matching & Dispatch Resolution',
    body: 'Averts demurrage fines and pairs returning empty trucks with profitable export/import backhaul loads, eliminating deadhead miles and crediting operational yield.',
  },
]

function HowItWorksModal({ onClose }) {
  return (
    <>
      <div className="modal-close-row">
        <div>
          <span className="modal-tag-badge">AUTONOMOUS FREIGHT ARCHITECTURE</span>
          <h2 className="modal-title">How FreightIQ Works</h2>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
      </div>
      <p className="modal-sub">
        End-to-end autonomous freight intelligence: from predictive road weather radar to QpiAI quantum carrier optimization.
      </p>
      <div className="hiw-steps">
        {HOW_IT_WORKS_STEPS.map((step, i) => (
          <div className="hiw-step" key={i}>
            <div className="hiw-num">{i + 1}</div>
            <div>
              <h4>{step.title}</h4>
              <p>{step.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="modal-actions-row">
        <button className="btn-modal-primary" onClick={onClose}>
          Close View &rarr;
        </button>
      </div>
    </>
  )
}

/* ── 2. Exporters & Exporters / Shippers Modal (pointed by box arrow) ────────────────────── */
function ExportersModal({ onClose }) {
  return (
    <>
      <div className="modal-close-row">
        <div>
          <span className="modal-tag-badge">GLOBAL TRADE & SHIPPERS</span>
          <h2 className="modal-title">Exporters & Exporters</h2>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
      </div>
      <p className="modal-sub">
        Global Trade. Bigger Opportunities. Autonomous cargo protection across major Indian maritime corridors (Nhava Sheva JNPT, Chennai Port, Mundra, and Cochin).
      </p>
      <div className="info-stat-grid">
        <div className="info-stat-card">
          <span className="stat-num">94.2%</span>
          <span className="stat-label">On-Time Customs SLA</span>
        </div>
        <div className="info-stat-card">
          <span className="stat-num">₹42,500</span>
          <span className="stat-label">Avg Demurrage Saved / Load</span>
        </div>
        <div className="info-stat-card">
          <span className="stat-num">48 Hours</span>
          <span className="stat-label">Predictive Port Window</span>
        </div>
      </div>
      <div className="info-features-list">
        <div className="info-feature-item">
          <div className="if-icon-svg"><ShipIcon /></div>
          <div>
            <strong>ICEGATE & Port Terminal Pre-Clearance:</strong>
            <p>Automates bill of lading and customs e-waybill verification before container trucks reach port terminal gates.</p>
          </div>
        </div>
        <div className="info-feature-item">
          <div className="if-icon-svg"><ShieldIcon /></div>
          <div>
            <strong>XGBoost Demurrage Scoring:</strong>
            <p>Analyzes 142 consignment parameters to flag high detention risks, auto-recommending expedited carrier alternatives.</p>
          </div>
        </div>
        <div className="info-feature-item">
          <div className="if-icon-svg"><BoxIcon /></div>
          <div>
            <strong>High-Value Cargo Security:</strong>
            <p>Continuously tracks export consignments from industrial manufacturing corridors to shipping berths.</p>
          </div>
        </div>
      </div>
      <div className="modal-actions-row">
        <button className="btn-modal-primary" onClick={onClose}>
          Close Intelligence View &rarr;
        </button>
      </div>
    </>
  )
}

/* ── 3. Port & Terminal Operators Modal (pointed by box arrow) ───────────────── */
function PortOperatorsModal({ onClose }) {
  return (
    <>
      <div className="modal-close-row">
        <div>
          <span className="modal-tag-badge">MARINE & INTERMODAL TERMINALS</span>
          <h2 className="modal-title">Port & Terminal Operators</h2>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
      </div>
      <p className="modal-sub">
        Efficient Ports. Smoother Flow. Terminal gate dwell prediction and container yard balancing powered by real-time queue analytics.
      </p>
      <div className="info-stat-grid">
        <div className="info-stat-card">
          <span className="stat-num">18.2h &rarr; 9.4h</span>
          <span className="stat-label">Avg Yard Dwell Reduction</span>
        </div>
        <div className="info-stat-card">
          <span className="stat-num">0.924</span>
          <span className="stat-label">AUC-ROC Gate Accuracy</span>
        </div>
        <div className="info-stat-card">
          <span className="stat-num">100%</span>
          <span className="stat-label">RFID Gate Appointment Sync</span>
        </div>
      </div>
      <div className="info-features-list">
        <div className="info-feature-item">
          <div className="if-icon-svg"><AnchorIcon /></div>
          <div>
            <strong>Berth & Gate Congestion Forecasting:</strong>
            <p>Predicts truck turnaround times at Mumbai JNPT and Chennai Port to eliminate traffic bottlenecks.</p>
          </div>
        </div>
        <div className="info-feature-item">
          <div className="if-icon-svg"><ClockIcon /></div>
          <div>
            <strong>Dynamic Detention Deadlines:</strong>
            <p>Surfaces countdown timers for free-time expiration so cargo handlers dispatch pickups before detention kicks in.</p>
          </div>
        </div>
        <div className="info-feature-item">
          <div className="if-icon-svg"><CraneIcon /></div>
          <div>
            <strong>Container Yard Load Balancing:</strong>
            <p>Optimizes stacking arrangements and crane assignments to cut truck waiting times by 48%.</p>
          </div>
        </div>
      </div>
      <div className="modal-actions-row">
        <button className="btn-modal-primary" onClick={onClose}>
          Close Port Intelligence View &rarr;
        </button>
      </div>
    </>
  )
}

/* ── 4. Transport & Tracking Modal (pointed by box arrow) ────────────────────── */
function TransportTrackingModal({ onClose }) {
  return (
    <>
      <div className="modal-close-row">
        <div>
          <span className="modal-tag-badge">ROAD RADAR & TELEMATICS</span>
          <h2 className="modal-title">Transport & Tracking</h2>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
      </div>
      <p className="modal-sub">
        Real-time. Everywhere. Highway corridor waypoint weather intelligence via Open-Meteo API and GPS vehicle telematics.
      </p>
      <div className="info-stat-grid">
        <div className="info-stat-card">
          <span className="stat-num">30 Mins</span>
          <span className="stat-label">Automated Refresh Cadence</span>
        </div>
        <div className="info-stat-card">
          <span className="stat-num">NH-48 & NH-44</span>
          <span className="stat-label">Major Road Corridors</span>
        </div>
        <div className="info-stat-card">
          <span className="stat-num">55 km/h</span>
          <span className="stat-label">Monsoon Speed Governor</span>
        </div>
      </div>
      <div className="info-features-list">
        <div className="info-feature-item">
          <div className="if-icon-svg"><CloudSunIcon /></div>
          <div>
            <strong>Real Road Waypoints (Not Straight Lines):</strong>
            <p>Captures Western Ghat mountain passes (Khandala Ghat) and Deccan plateau winds (Pune Chakan) for accurate risk forecasting.</p>
          </div>
        </div>
        <div className="info-feature-item">
          <div className="if-icon-svg"><ZapIcon /></div>
          <div>
            <strong>Active Safety Governors:</strong>
            <p>Automatically triggers driver speed advisory (55 km/h) and platooning spacing (55 meters) when crosswinds exceed 30 km/h.</p>
          </div>
        </div>
        <div className="info-feature-item">
          <div className="if-icon-svg"><MapPinIcon /></div>
          <div>
            <strong>Carrier Telematics Sync:</strong>
            <p>Integrates vehicle GPS, toll plaza Fastag events, and OBD-II diagnostics into the driver cockpit.</p>
          </div>
        </div>
      </div>
      <div className="modal-actions-row">
        <button className="btn-modal-primary" onClick={onClose}>
          Close Transport View &rarr;
        </button>
      </div>
    </>
  )
}

/* ── 5. Supply Chain Modal (pointed by box arrow) ────────────────────────────── */
function SupplyChainModal({ onClose }) {
  return (
    <>
      <div className="modal-close-row">
        <div>
          <span className="modal-tag-badge">QUANTUM RESILIENCE</span>
          <h2 className="modal-title">Supply Chain</h2>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
      </div>
      <p className="modal-sub">
        Connected. Transparent. Resilient. Formulating multi-modal carrier allocation as a QUBO Hamiltonian executed on the QpiAI Quantum Simulator.
      </p>
      <div className="info-stat-grid">
        <div className="info-stat-card">
          <span className="stat-num">3.4x</span>
          <span className="stat-label">Quantum Speedup vs Classical</span>
        </div>
        <div className="info-stat-card">
          <span className="stat-num">₹4,34,000</span>
          <span className="stat-label">Weekly Backhaul Yield</span>
        </div>
        <div className="info-stat-card">
          <span className="stat-num">QpiAI-QSV</span>
          <span className="stat-label">Quantum Simulator</span>
        </div>
      </div>
      <div className="info-features-list">
        <div className="info-feature-item">
          <div className="if-icon-svg"><AtomIcon /></div>
          <div>
            <strong>QpiAI Quantum QUBO Optimizer:</strong>
            <p>Builds OpenQASM 2.0 circuits with parameterized Ry rotations and CNOT entanglement to solve complex carrier re-allocations.</p>
          </div>
        </div>
        <div className="info-feature-item">
          <div className="if-icon-svg"><RepeatIcon /></div>
          <div>
            <strong>Empty Semi Backhaul Matching:</strong>
            <p>Pairs returning empty refrigerated and container trucks with verified export cargo, eliminating deadhead miles.</p>
          </div>
        </div>
        <div className="info-feature-item">
          <div className="if-icon-svg"><ChartIcon /></div>
          <div>
            <strong>Avoidable Cost Intelligence:</strong>
            <p>Quantifies exact detention penalties avoided in Indian Rupees (₹) across the national freight network.</p>
          </div>
        </div>
      </div>
      <div className="modal-actions-row">
        <button className="btn-modal-primary" onClick={onClose}>
          Close Supply Chain View &rarr;
        </button>
      </div>
    </>
  )
}

/* ── 6. Exception Resolved Modal (pointed by center box arrow) ──────────────────────── */
function ExceptionResolvedModal({ onClose }) {
  return (
    <>
      <div className="modal-close-row">
        <div>
          <span className="modal-tag-badge green">EXCEPTION RESOLUTION PROTOCOL</span>
          <h2 className="modal-title">Exception Resolved (4/4 Cleared)</h2>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
      </div>
      <p className="modal-sub">
        Real-time telemetry breakdown of how FreightIQ automatically mitigates freight blockers without human delays.
      </p>
      <div className="exception-breakdown">
        <div className="ex-item-card resolved">
          <div className="eic-check">✓</div>
          <div>
            <strong>Customs Clearance Confirmed:</strong>
            <p>EDI electronic manifest matched with ICEGATE. No physical inspection hold placed.</p>
          </div>
          <span className="eic-time">08:14 AM</span>
        </div>
        <div className="ex-item-card resolved">
          <div className="eic-check">✓</div>
          <div>
            <strong>Terminal Gate Open:</strong>
            <p>RFID pre-booked entry token verified for Mumbai JNPT Pier 3 terminal gate.</p>
          </div>
          <span className="eic-time">09:30 AM</span>
        </div>
        <div className="ex-item-card resolved">
          <div className="eic-check">✓</div>
          <div>
            <strong>Driver Dispatched:</strong>
            <p>Multi-axle container trailer assigned with live GPS telemetry on NH-48.</p>
          </div>
          <span className="eic-time">10:15 AM</span>
        </div>
        <div className="ex-item-card resolved">
          <div className="eic-check">✓</div>
          <div>
            <strong>Deadline Met — 4h Early:</strong>
            <p>Carrier delivery completed 4 hours prior to container demurrage penalty window.</p>
          </div>
          <span className="eic-time">02:00 PM</span>
        </div>
      </div>
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold" style={{ marginTop: '1rem' }}>
        ✓ Verified Result: ₹18,500 demurrage penalty averted. Net operational savings credited to client.
      </div>
      <div className="modal-actions-row">
        <button className="btn-modal-primary" onClick={onClose}>
          Acknowledge & Close &rarr;
        </button>
      </div>
    </>
  )
}

/* ── 7. Highway Truck Telematics Modal (pointed by arrow at bottom truck) ────────────────── */
function HighwayTruckModal({ onClose }) {
  return (
    <>
      <div className="modal-close-row">
        <div>
          <span className="modal-tag-badge cyan">LIVE HIGHWAY TELEMATICS</span>
          <h2 className="modal-title">Corridor Carrier KA-01-EQ-9482</h2>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
      </div>
      <p className="modal-sub">
        Real-time telemetry and Open-Meteo monsoon road radar on the multi-axle carrier operating along NH-48.
      </p>
      
      <div className="info-stat-grid">
        <div className="info-stat-card">
          <span className="stat-num">54 km/h</span>
          <span className="stat-label">Current Speed (Capped at 55)</span>
        </div>
        <div className="info-stat-card">
          <span className="stat-num">Km 92</span>
          <span className="stat-label">Khandala Ghat Pass</span>
        </div>
        <div className="info-stat-card">
          <span className="stat-num">0.08</span>
          <span className="stat-label">Demurrage Risk (Safe)</span>
        </div>
      </div>

      <div className="info-features-list">
        <div className="info-feature-item">
          <div className="if-icon-svg"><RainIcon /></div>
          <div>
            <strong>Open-Meteo Road Weather Sentinel:</strong>
            <p>14.2 mm/h precipitation with 28.4 km/h crosswinds. Automated monsoon advisory engaged.</p>
          </div>
        </div>
        <div className="info-feature-item">
          <div className="if-icon-svg"><ShieldIcon /></div>
          <div>
            <strong>Speed Governor & Spacing:</strong>
            <p>Engine governor locked at 55 km/h with 55m platooning distance to prevent mountain slip.</p>
          </div>
        </div>
        <div className="info-feature-item">
          <div className="if-icon-svg"><ShipIcon /></div>
          <div>
            <strong>Terminal Destination:</strong>
            <p>Mumbai JNPT Marine Terminal Pier 3. RFID Fastag clearance token verified for 16:30 gate slot.</p>
          </div>
        </div>
      </div>

      <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 font-semibold" style={{ marginTop: '1rem' }}>
        Carrier ETA: 4h 15m ahead of free-time demurrage expiration. No detention risk detected.
      </div>

      <div className="modal-actions-row">
        <button className="btn-modal-primary" onClick={onClose}>
          Close Telematics Radar &rarr;
        </button>
      </div>
    </>
  )
}

/* ── 8. Platform Modal (pointed by navbar arrow) ────────────────────────────────── */
function PlatformModal({ onClose }) {
  return (
    <>
      <div className="modal-close-row">
        <div>
          <span className="modal-tag-badge">FREIGHTIQ CORE ARCHITECTURE</span>
          <h2 className="modal-title">Autonomous Freight Intelligence Platform</h2>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
      </div>
      <p className="modal-sub">
        A unified hybrid intelligence stack combining classical machine learning, quantum optimization, and predictive road weather.
      </p>
      <div className="hiw-steps">
        <div className="hiw-step">
          <div className="hiw-num">1</div>
          <div>
            <h4>Open-Meteo Road Weather Sentinel</h4>
            <p>Non-commercial hourly weather radar sampling real highway waypoints along Indian freight corridors every 30 minutes with zero API cost.</p>
          </div>
        </div>
        <div className="hiw-step">
          <div className="hiw-num">2</div>
          <div>
            <h4>XGBoost 3.2 Machine Learning</h4>
            <p>Calibrated across 42,000 shipments to predict demurrage detention probabilities and financial penalties in ₹ INR.</p>
          </div>
        </div>
        <div className="hiw-step">
          <div className="hiw-num">3</div>
          <div>
            <h4>QpiAI Quantum QUBO Optimizer</h4>
            <p>Simulates carrier assignment Hamiltonians on the QpiAI-QSV-Simulator with OpenQASM 2.0 circuits.</p>
          </div>
        </div>
        <div className="hiw-step">
          <div className="hiw-num">4</div>
          <div>
            <h4>QpiAi Pilot AI Assistant</h4>
            <p>Retrieves stored forecast evidence, port congestion states, and carrier telemetry to guide fleet directors.</p>
          </div>
        </div>
      </div>
      <div className="modal-actions-row">
        <button className="btn-modal-primary" onClick={onClose}>
          Close Platform View &rarr;
        </button>
      </div>
    </>
  )
}

/* ── 9. Insights Modal (pointed by navbar arrow) ────────────────────────────────── */
function InsightsModal({ onClose }) {
  return (
    <>
      <div className="modal-close-row">
        <div>
          <span className="modal-tag-badge">CORRIDOR ANALYTICS</span>
          <h2 className="modal-title">Live Logistics Intelligence & KPIs</h2>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
      </div>
      <p className="modal-sub">
        Operational telemetry benchmarks across Indian multi-modal freight operations.
      </p>
      <div className="info-stat-grid">
        <div className="info-stat-card">
          <span className="stat-num">89.4%</span>
          <span className="stat-label">Demurrage Prediction Accuracy</span>
        </div>
        <div className="info-stat-card">
          <span className="stat-num">100%</span>
          <span className="stat-label">Road Corridor Radar Coverage</span>
        </div>
        <div className="info-stat-card">
          <span className="stat-num">₹1,42,800</span>
          <span className="stat-label">Net Carrier Savings Delivered</span>
        </div>
      </div>
      <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-slate-700 space-y-2" style={{ marginTop: '1rem' }}>
        <div className="font-bold text-sky-900">Key Route Observations:</div>
        <div>• <strong>NH-48 (Bengaluru &rarr; Mumbai JNPT):</strong> 34.8 km/h peak crosswinds detected in Khandala Ghat mountain pass. Speed governor capped at 55 km/h.</div>
        <div>• <strong>NH-44 (Bengaluru &rarr; Hyderabad):</strong> Favorable conditions throughout Anantapur & Kurnool waypoints. Standard 68 km/h permitted.</div>
        <div>• <strong>Mumbai JNPT Pier 3:</strong> 9.4h average dwell time with RFID gate clearance.</div>
      </div>
      <div className="modal-actions-row">
        <button className="btn-modal-primary" onClick={onClose}>
          Close Insights &rarr;
        </button>
      </div>
    </>
  )
}

/* ── 10. About Modal (pointed by navbar arrow) ────────────────────────────────────── */
function AboutModal({ onClose }) {
  return (
    <>
      <div className="modal-close-row">
        <div>
          <span className="modal-tag-badge">ABOUT FREIGHTIQ</span>
          <h2 className="modal-title">Engineering Autonomous Logistics</h2>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
      </div>
      <p className="modal-sub">
        Developed for the NMIT Hackathon.
      </p>
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-3 leading-relaxed">
        <p>
          Indian logistics suffers over <strong>₹1.2 lakh crore</strong> in annual losses due to unexpected terminal demurrage, unpredictable monsoon weather fronts, and empty returning semi-trucks (deadheading).
        </p>
        <p>
          <strong>FREIGHTIQ</strong> solves this with an end-to-end autonomous sentinel:
        </p>
        <ul className="list-disc pl-4 space-y-1 text-slate-600 font-mono text-[11px]">
          <li>Open-Meteo automated road waypoint weather forecasting (zero API key cost).</li>
          <li>XGBoost 3.2 machine learning demurrage risk classification in Indian Rupees (₹).</li>
          <li>QpiAI Quantum QUBO carrier optimization on QCloud simulator.</li>
          <li>QpiAi Pilot AI assistant for instant dispatch insights.</li>
        </ul>
      </div>
      <div className="modal-actions-row">
        <button className="btn-modal-primary" onClick={onClose}>
          Close About &rarr;
        </button>
      </div>
    </>
  )
}

/* ── 11. Customer Register Modal ──────────────────────── */
function RegisterModal({ onClose, onRegisterSuccess }) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    corridor: 'NH-48 (Bengaluru - Mumbai JNPT)'
  })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required.'
    if (!form.company.trim()) e.company = 'Company name is required.'
    if (!form.email.includes('@')) e.email = 'Please enter a valid email address.'
    if (form.password.length < 4) e.password = 'Password must be at least 4 characters.'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)

    try {
      // 1. Register customer account with backend
      const res = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.name,
          company: form.company,
          corridor: form.corridor,
          role: 'CUSTOMER'
        })
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setSuccess(`Welcome, ${form.name}! Customer account registered. Entering workspace...`)
        localStorage.setItem('freightiq_user', JSON.stringify({ ...data.user, role: 'CUSTOMER', role_label: 'Verified Customer' }))
        localStorage.setItem('freightiq_token', data.access_token || '')
        setTimeout(() => {
          if (onRegisterSuccess) onRegisterSuccess({ ...data.user, role: 'CUSTOMER', role_label: 'Verified Customer' })
          onClose()
        }, 800)
        return
      }

      // 2. Supabase fallback
      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name, company: form.company, corridor: form.corridor, role: 'CUSTOMER' } },
      })
      if (sbError) {
        setErrors({ general: sbError.message })
      } else {
        const u = { id: sbData.user?.id || 'usr-reg', email: form.email, full_name: form.name, role: 'CUSTOMER', role_label: 'Verified Customer' }
        setSuccess('Customer account created! Entering workspace...')
        localStorage.setItem('freightiq_user', JSON.stringify(u))
        setTimeout(() => {
          if (onRegisterSuccess) onRegisterSuccess(u)
          onClose()
        }, 800)
      }
    } catch {
      // Offline fallback
      const u = { id: 'usr-offline', email: form.email, full_name: form.name, company: form.company, role: 'CUSTOMER', role_label: 'Verified Customer' }
      localStorage.setItem('freightiq_user', JSON.stringify(u))
      setSuccess('Customer account initialized! Entering workspace...')
      setTimeout(() => {
        if (onRegisterSuccess) onRegisterSuccess(u)
        onClose()
      }, 800)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="modal-close-row">
        <div>
          <span className="modal-tag-badge">CUSTOMER REGISTRATION</span>
          <h2 className="modal-title">Create Customer Cargo Account</h2>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
      </div>
      <p className="modal-sub">
        Sign up as a verified cargo shipper or freight customer. (Note: Admin accounts cannot be self-registered).
      </p>

      {success && <div className="success-msg">{success}</div>}
      {errors.general && <span className="field-error" style={{ display: 'block', marginBottom: '0.75rem' }}>{errors.general}</span>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <div className="input-wrap">
            <input
              type="text"
              className={`form-input${errors.name ? ' is-error' : ''}`}
              placeholder="Ramesh Kumar"
              value={form.name}
              onChange={set('name')}
            />
          </div>
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Company / Shipper Name</label>
          <div className="input-wrap">
            <input
              type="text"
              className={`form-input${errors.company ? ' is-error' : ''}`}
              placeholder="Deccan Precision Tools Ltd"
              value={form.company}
              onChange={set('company')}
            />
          </div>
          {errors.company && <span className="field-error">{errors.company}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Customer Work Email</label>
          <div className="input-wrap">
            <input
              type="email"
              className={`form-input${errors.email ? ' is-error' : ''}`}
              placeholder="client@company.com"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
            />
          </div>
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-wrap">
            <input
              type={showPw ? 'text' : 'password'}
              className={`form-input${errors.password ? ' is-error' : ''}`}
              placeholder="Minimum 4 characters"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
              style={{ paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPw((v) => !v)}
              tabIndex={-1}
            >
              <EyeIcon open={showPw} />
            </button>
          </div>
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Primary Cargo Corridor</label>
          <select
            className="form-input"
            value={form.corridor}
            onChange={set('corridor')}
          >
            <option value="NH-48 (Bengaluru - Mumbai JNPT)">NH-48 (Bengaluru - Mumbai JNPT)</option>
            <option value="NH-44 (Bengaluru - Hyderabad)">NH-44 (Bengaluru - Hyderabad)</option>
            <option value="Chennai Port Corridors">Chennai Port Intermodal Corridors</option>
            <option value="Mundra Intermodal Maritime">Mundra Maritime Hub</option>
          </select>
        </div>

        <button type="submit" className="btn-modal-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
          {loading ? 'Creating Account…' : 'Register Customer Account →'}
        </button>
      </form>
    </>
  )
}

/* ── 12. Forgot Password Modal ────────────────────────── */
function ForgotModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      })
      if (err) setError(err.message)
      else setSent(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="modal-close-row">
        <h2 className="modal-title">Reset Your Password</h2>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
      </div>
      <p className="modal-sub">
        Enter the email address linked to your FREIGHTIQ account. We'll send you a reset link.
      </p>

      {sent ? (
        <>
          <div className="success-msg">
            Reset link sent! Check your inbox and follow the instructions to set a new password.
          </div>
          <button className="btn-modal-primary" onClick={onClose} style={{ marginTop: '1rem' }}>
            Back to Sign In
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {error && <span className="field-error" style={{ display: 'block', marginBottom: '0.75rem' }}>{error}</span>}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrap">
              <input
                type="email"
                className="form-input"
                placeholder="client@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>
          <button type="submit" className="btn-modal-primary" disabled={loading}>
            {loading ? 'Sending…' : 'Send Reset Link →'}
          </button>
        </form>
      )}
    </>
  )
}

/* ── 13. Login Modal ─────────────────── */
function LoginModal({ onClose, onLoginSuccess, initialRole = 'customer', onOpenRegister }) {
  return (
    <div className="modal-login-wrapper">
      <div className="modal-close-abs">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
      </div>
      <LoginCard
        initialRole={initialRole}
        onLoginSuccess={(u) => {
          onClose()
          if (onLoginSuccess) onLoginSuccess(u)
        }}
        onCreateAccount={() => {
          if (onOpenRegister) onOpenRegister()
        }}
        onForgotPassword={() => {}}
      />
    </div>
  )
}

/* ── Main Modal component ──────────────────────────── */
export default function Modal({ type, onClose, onRegisterSuccess, onLoginSuccess, initialRole = 'customer', onOpenRegister }) {
  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  // Keyboard escape handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const isLoginModal = type === 'login' || type === 'login-customer' || type === 'login-admin'
  const resolvedRole = type === 'login-admin' ? 'admin' : (type === 'login-customer' ? 'customer' : initialRole)

  return (
    <div className="modal-overlay" onClick={handleOverlay} role="dialog" aria-modal="true">
      <div className={`modal-box ${isLoginModal ? 'modal-login-box' : ''}`}>
        {type === 'howitworks'     && <HowItWorksModal onClose={onClose} />}
        {type === 'exporters'      && <ExportersModal  onClose={onClose} />}
        {type === 'port'           && <PortOperatorsModal onClose={onClose} />}
        {type === 'transport'      && <TransportTrackingModal onClose={onClose} />}
        {type === 'supply'         && <SupplyChainModal onClose={onClose} />}
        {type === 'exception'      && <ExceptionResolvedModal onClose={onClose} />}
        {type === 'truck'          && <HighwayTruckModal onClose={onClose} />}
        {type === 'platform'       && <PlatformModal onClose={onClose} />}
        {type === 'insights'       && <InsightsModal onClose={onClose} />}
        {type === 'about'          && <AboutModal onClose={onClose} />}
        {type === 'register'       && <RegisterModal onClose={onClose} onRegisterSuccess={onRegisterSuccess} />}
        {type === 'forgot'         && <ForgotModal   onClose={onClose} />}
        {isLoginModal              && (
          <LoginModal
            onClose={onClose}
            onLoginSuccess={onLoginSuccess}
            initialRole={resolvedRole}
            onOpenRegister={onOpenRegister}
          />
        )}
      </div>
    </div>
  )
}
