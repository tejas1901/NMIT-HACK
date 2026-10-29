import { useState, useRef, useEffect } from 'react'

const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
)

const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

export default function Navbar({ onSignIn, onGetStarted, setPage, onHowItWorks, onOpenModal }) {
  const [showLoginMenu, setShowLoginMenu] = useState(false)
  const menuRef = useRef(null)

  const handleNavClick = (type) => {
    if (onOpenModal) onOpenModal(type)
    else if (onHowItWorks) onHowItWorks()
  }

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowLoginMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCustomerLogin = () => {
    setShowLoginMenu(false)
    if (onSignIn) onSignIn('customer')
    else if (setPage) setPage('login', 'customer')
  }

  const handleAdminLogin = () => {
    setShowLoginMenu(false)
    if (onSignIn) onSignIn('admin')
    else if (setPage) setPage('login', 'admin')
  }

  const handleCustomerRegister = () => {
    setShowLoginMenu(false)
    if (onGetStarted) onGetStarted()
  }

  return (
    <nav className="navbar">
      <a className="navbar-brand" onClick={() => setPage && setPage('landing')} role="button" tabIndex={0}>
        <span className="brand-name">FREIGHTIQ</span>
        <span className="brand-sep" />
        <span className="brand-powered">
          Powered by <span className="brand-qpi">Qπ AI</span>
        </span>
      </a>

      {/* Nav items pointed to by arrows in screenshot */}
      <div className="navbar-links">
        <button className="nav-link active" onClick={() => setPage && setPage('landing')}>Home</button>
        <button className="nav-link" onClick={() => handleNavClick('platform')}>Platform</button>
        <button className="nav-link" onClick={() => handleNavClick('howitworks')}>How It Works</button>
        <button className="nav-link" onClick={() => handleNavClick('insights')}>Insights</button>
        <button className="nav-link" onClick={() => handleNavClick('about')}>About</button>
      </div>

      {/* Actions with Dual Role Login Menu */}
      <div className="navbar-actions" ref={menuRef}>
        <div className="login-dropdown-wrapper">
          <button
            className="btn-signin"
            onClick={() => setShowLoginMenu((prev) => !prev)}
            aria-expanded={showLoginMenu}
            aria-haspopup="true"
          >
            <span>Sign In</span>
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              stroke="currentColor"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ transition: 'transform 0.2s', transform: showLoginMenu ? 'rotate(180deg)' : 'none' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* DUAL LOGIN MENU DROPDOWN (No emojis, sleek enterprise icons) */}
          {showLoginMenu && (
            <div className="login-menu-dropdown animate-fade-in">
              <div className="lmd-header">
                <span className="lmd-eyebrow">ENTERPRISE GATEWAY</span>
                <h6>Select Portal Access</h6>
              </div>

              {/* Customer Access Option */}
              <button className="lmd-item customer" onClick={handleCustomerLogin}>
                <div className="lmd-icon-svg">
                  <UserIcon />
                </div>
                <div className="lmd-content">
                  <div className="lmd-title-row">
                    <strong>Customer Portal</strong>
                    <span className="lmd-badge-open">Registration Open</span>
                  </div>
                  <p>Shippers, exporters, importers & fleet customers</p>
                </div>
              </button>

              {/* Admin Access Option */}
              <button className="lmd-item admin" onClick={handleAdminLogin}>
                <div className="lmd-icon-svg admin">
                  <ShieldIcon />
                </div>
                <div className="lmd-content">
                  <div className="lmd-title-row">
                    <strong>Admin Command</strong>
                    <span className="lmd-badge-locked">
                      <LockIcon />
                      <span>Restricted</span>
                    </span>
                  </div>
                  <p>Fleet directors & QpiAI quantum controllers</p>
                </div>
              </button>

              <div className="lmd-footer">
                <span>New customer?</span>
                <button className="lmd-register-link" onClick={handleCustomerRegister}>
                  Create Account &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        <button className="btn-getstarted" onClick={onGetStarted}>
          Get Started
        </button>
      </div>
    </nav>
  )
}
