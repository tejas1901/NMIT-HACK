import FloatingInfoCard from './FloatingInfoCard'
import TrackingOverlay from './TrackingOverlay'
import FeaturePanel from './FeaturePanel'

// SVG icons for floating cards
const BoxIcon = () => (
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const AnchorIcon = () => (
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
    <circle cx="12" cy="5" r="3" />
    <line x1="12" y1="22" x2="12" y2="8" />
    <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
  </svg>
)

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 6v3h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default function HeroSection({ onHowItWorks, onExplore, onOpenModal }) {
  const handleCardClick = (type) => {
    if (onOpenModal) onOpenModal(type)
    else if (onHowItWorks) onHowItWorks()
  }

  return (
    <section className="hero">
      {/* Background Image strictly maintained in absolute positioning */}
      <div className="hero-bg" aria-hidden="true" />

      {/* Tracking animation overlay */}
      <TrackingOverlay />

      {/* Exception panel (clickable with arrow pointing to it in screenshot) */}
      <div
        className="exception-panel clickable"
        onClick={() => handleCardClick('exception')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick('exception') }}
        role="button"
        tabIndex={0}
        title="Click to view automated exception resolution protocols"
      >
        <div className="exception-title">
          <span className="exc-dot" />
          Exception Resolved
          <span className="exc-badge">4/4 Cleared</span>
        </div>
        {[
          'Customs clearance confirmed',
          'Terminal gate open',
          'Driver dispatched',
          'Deadline met — 4h early',
        ].map((label) => (
          <div className="exception-row" key={label}>
            <div className="exc-check">
              <CheckIcon />
            </div>
            <span className="exc-label">{label}</span>
          </div>
        ))}
        <div className="exc-view-hint">
          <span>Inspect Resolution Protocol</span>
          <span className="hint-arrow">&rarr;</span>
        </div>
      </div>

      {/* Floating info cards (pointed to by arrows in screenshot) */}
      <FloatingInfoCard
        className="card-exporters"
        icon={<BoxIcon />}
        title="Exporters & Exporters"
        subtitle="Global Trade. Bigger Opportunities."
        onClick={() => handleCardClick('exporters')}
      />
      <FloatingInfoCard
        className="card-port"
        icon={<AnchorIcon />}
        title="Port & Terminal Operators"
        subtitle="Efficient Ports. Smoother Flow."
        onClick={() => handleCardClick('port')}
      />
      <FloatingInfoCard
        className="card-transport"
        icon={<TruckIcon />}
        title="Transport & Tracking"
        subtitle="Real-time. Everywhere."
        onClick={() => handleCardClick('transport')}
      />
      <FloatingInfoCard
        className="card-supply"
        icon={<LinkIcon />}
        title="Supply Chain"
        subtitle="Connected. Transparent. Resilient."
        onClick={() => handleCardClick('supply')}
      />

      {/* Interactive Highway Corridor Truck Telematics Hotspot (pointed to by arrow at bottom truck) */}
      <div
        className="truck-telematics-hotspot"
        onClick={() => handleCardClick('truck')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick('truck') }}
        role="button"
        tabIndex={0}
        title="Click to inspect live truck telematics & highway weather radar"
      >
        <span className="truck-pulse" />
        <span className="truck-pulse-ring" />
        <div className="truck-hotspot-icon-wrap">
          <TruckIcon />
        </div>
        <div className="truck-hotspot-text">
          <span className="th-title">Carrier KA-01-EQ-9482</span>
          <span className="th-sub">NH-48 Monsoon Radar • 54 km/h</span>
        </div>
        <span className="truck-hotspot-badge">Inspect &rarr;</span>
      </div>

      {/* Hero content */}
      <div className="hero-content">
        <p className="hero-eyebrow">AI-POWERED FREIGHT EXCEPTION INTELLIGENCE</p>
        <h1 className="hero-headline">
          Resolve freight exceptions
          <br />
          before they become
          <br />
          <span className="teal">costly.</span>
        </h1>
        <p className="hero-description">
          Bring carrier communications, shipping documents, customs updates,
          terminal deadlines and truck bookings into one intelligent workflow.
          Identify verified blockers, assign time-critical actions and estimate
          avoidable logistics costs before deadlines are missed.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={onExplore}>
            Explore the Platform
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button className="btn-secondary" onClick={onHowItWorks}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            See How It Works
          </button>
        </div>
      </div>

      {/* Feature panel */}
      <FeaturePanel onDiscover={onExplore} />
    </section>
  )
}
