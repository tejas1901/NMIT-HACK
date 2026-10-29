import React, { useState } from 'react';
import TrackingOverlay from '../components/TrackingOverlay';
import LoginCard from '../components/LoginCard';
import Modal from '../components/Modal';
import '../App.css';

export function LoginPage({ onNavigateLanding, onLoginSuccess, initialRole = 'customer' }) {
  const [modal, setModal] = useState(null);

  return (
    <div className="login-page">
      {/* Background image in absolute positioning */}
      <div className="login-bg" aria-hidden="true" />

      {/* Interactive animated tracking overlay across the background */}
      <TrackingOverlay />

      {/* Brand top-left — click to return to landing */}
      <div
        className="login-brand"
        onClick={onNavigateLanding}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigateLanding(); }}
        title="Return to FreightIQ Home"
      >
        <span className="brand-name">FREIGHTIQ</span>
        <span className="brand-sep" />
        <span className="brand-powered">
          Powered by <span className="brand-qpi">Qπ AI</span>
        </span>
      </div>

      {/* Floating Live Telemetry Ticker across the top */}
      <div className="login-telemetry-bar">
        <div className="ltb-item">
          <span className="ltb-dot live" />
          <span className="ltb-label">Corridor Telematics:</span>
          <strong>NH-48 & NH-44 Active</strong>
        </div>
        <div className="ltb-sep" />
        <div className="ltb-item">
          <span className="ltb-dot sync" />
          <span className="ltb-label">Weather Radar:</span>
          <strong>Open-Meteo Sentinel Connected</strong>
        </div>
        <div className="ltb-sep" />
        <div className="ltb-item">
          <span className="ltb-dot quant" />
          <span className="ltb-label">Optimization:</span>
          <strong>QpiAI Quantum QUBO Online</strong>
        </div>
      </div>

      <div className="login-layout">
        {/* Left hero copy */}
        <div className="login-hero">
          <div className="login-eyebrow-badge">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>AUTONOMOUS FREIGHT INTELLIGENCE GATEWAY</span>
          </div>

          <h1 className="hero-headline">
            Commercial Cargo.<br />
            <span className="teal">Quantum Optimized.</span>
          </h1>

          <p className="login-desc">
            Connect cargo booking pipelines, predict demurrage penalties using calibrated XGBoost 3.2,
            and formulate optimal carrier allocation on the QpiAI Quantum Simulator.
            Real-time tracking, road weather mitigation, and automated dispatch notices.
          </p>

          <div className="login-features">
            <div className="lf-item">
              <div className="lf-icon">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <h5>Global Cargo<br />Booking</h5>
            </div>
            <div className="lf-sep" />
            <div className="lf-item">
              <div className="lf-icon">
                <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h5>XGBoost<br />Risk Scoring</h5>
            </div>
            <div className="lf-sep" />
            <div className="lf-item">
              <div className="lf-icon">
                <svg viewBox="0 0 24 24"><path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2z"/><path d="M2 22c0-5.5 4.5-10 10-10s10 4.5 10 10"/></svg>
              </div>
              <h5>QpiAI Quantum<br />Carrier QUBO</h5>
            </div>
            <div className="lf-sep" />
            <div className="lf-item">
              <div className="lf-icon">
                <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h5>QpiAi Pilot<br />Logistics AI</h5>
            </div>
          </div>
        </div>

        {/* Dual Role Professional Login card */}
        <div className="login-card-wrap">
          <LoginCard
            initialRole={initialRole}
            onLoginSuccess={onLoginSuccess}
            onCreateAccount={(r) => setModal({ type: 'register', role: r || 'customer' })}
            onForgotPassword={(r) => setModal({ type: 'forgot', role: r || 'customer' })}
          />
        </div>
      </div>

      {modal && (
        <Modal
          type={typeof modal === 'string' ? modal : modal.type}
          initialRole={typeof modal === 'object' ? modal.role : initialRole}
          onClose={() => setModal(null)}
          onOpenRegister={(r) => setModal({ type: 'register', role: r || 'customer' })}
          onRegisterSuccess={(u) => {
            setModal(null);
            onLoginSuccess(u);
          }}
        />
      )}
    </div>
  );
}

export default LoginPage;
