export default function FeaturePanel({ onDiscover }) {
  return (
    <div className="feature-panel">
      {/* Left section */}
      <div className="panel-left">
        <h3>Smarter Logistics.<br />Lower Costs.</h3>
        <p>
          From port to warehouse, we keep your freight moving — intelligently.
        </p>
        <button className="panel-discover" onClick={(e) => { e.preventDefault(); onDiscover && onDiscover(); }}>
          Discover More
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, marginLeft: 4 }}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="panel-vsep" />

      {/* Feature 1 */}
      <div className="panel-feature">
        <div className="pf-icon">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
          </svg>
        </div>
        <h4>Real-Time Visibility</h4>
        <p>Track your shipments 24/7</p>
      </div>

      <div className="panel-vsep" />

      {/* Feature 2 */}
      <div className="panel-feature">
        <div className="pf-icon">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <h4>Fewer Penalties</h4>
        <p>Avoid demurrage & detention</p>
      </div>

      <div className="panel-vsep" />

      {/* Feature 3 */}
      <div className="panel-feature">
        <div className="pf-icon">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
          </svg>
        </div>
        <h4>Smarter Decisions</h4>
        <p>AI-powered insights</p>
      </div>

      <div className="panel-vsep" />

      {/* Feature 4 */}
      <div className="panel-feature">
        <div className="pf-icon">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <h4>Lower Costs</h4>
        <p>Optimize every move</p>
      </div>
    </div>
  )
}
