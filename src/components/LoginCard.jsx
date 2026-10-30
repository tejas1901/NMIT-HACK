import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { authenticateCustomer, registerCustomer, validatePasswordStrength } from '../services/customerAuth'

/* Professional SVG Icons (No Emojis) */
const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const ShieldLockIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="11" r="2.5" />
    <path d="M12 13.5v2" />
  </svg>
)

const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
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

export default function LoginCard({ onCreateAccount, onForgotPassword, onLoginSuccess, initialRole = 'customer' }) {
  const [role, setRole] = useState(initialRole || 'customer') // 'customer' | 'admin'
  const [viewMode, setViewMode] = useState('login') // 'login' | 'register' (customer only)
  
  // Login fields (Empty by default — NEVER show/pre-fill admin credentials)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPw, setShowPw] = useState(false)
  
  // Customer Register fields (only active when role === 'customer' & viewMode === 'register')
  const [regForm, setRegForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    password: '',
    corridor: 'NH-48 (Bengaluru - Mumbai JNPT)',
    gstin: ''
  })

  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialRole) {
      handleRoleChange(initialRole)
    }
  }, [initialRole])

  // Switch role — Keep credentials empty!
  const handleRoleChange = (newRole) => {
    setRole(newRole)
    setViewMode('login')
    setErrors({})
    setSuccess('')
    setEmail('')
    setPassword('')
  }

  const validateLogin = () => {
    const e = {}
    if (!email.includes('@')) e.email = 'Please enter a valid email address.'
    if (!password) e.password = 'Password is required.'
    return e
  }

  const validateRegister = () => {
    const e = {}
    if (!regForm.name.trim()) e.name = 'Full name is required.'
    if (!regForm.company.trim()) e.company = 'Company / Organization name is required.'
    if (!regForm.email.includes('@')) e.email = 'Please enter a valid work email.'
    const pwCheck = validatePasswordStrength(regForm.password)
    if (!pwCheck.valid) {
      e.password = pwCheck.error || 'Password must be at least 8 characters and contain both letters and numbers.'
    }
    return e
  }

  // Handle Login Submit
  const handleLoginSubmit = async (ev) => {
    ev.preventDefault()
    const e = validateLogin()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)

    const normalizedEmail = email.trim().toLowerCase();
    const isAdminAccount = role === 'admin' || normalizedEmail === 'admin@gmail.com';

    // 1. Strict Master Admin Authentication (ONLY admin@gmail.com and admin@123)
    if (isAdminAccount) {
      if (normalizedEmail === 'admin@gmail.com' && password.trim() === 'admin@123') {
        const adminUser = {
          id: 'usr-admin',
          email: 'admin@gmail.com',
          full_name: 'Admin',
          company: 'FreightIQ Command',
          role: 'ADMIN',
          role_label: 'Master Administrator'
        };
        setSuccess(`Authenticated as Master Administrator. Launching Admin Command...`);
        localStorage.setItem('freightiq_user', JSON.stringify(adminUser));
        localStorage.setItem('freightiq_token', 'freightiq-admin-master-elevation-token');
        localStorage.setItem('freightiq_active_role', 'admin');
        sessionStorage.setItem('freightiq_active_role', 'admin');
        sessionStorage.setItem('freightiq_admin_token', 'freightiq-admin-master-elevation-token');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(adminUser);
        }, 200);
        return;
      } else {
        setErrors({ general: 'Invalid administrator credentials. Authorized admin email is admin@gmail.com with password admin@123.' });
        setLoading(false);
        return;
      }
    }

    // 2. Customer Database Credential Check
    try {
      const authResult = await authenticateCustomer(normalizedEmail, password);

      if (authResult.success && authResult.user) {
        setSuccess(`Authenticated as ${authResult.user.full_name} (${authResult.user.company}). Launching workspace...`);
        localStorage.setItem('freightiq_user', JSON.stringify(authResult.user));
        localStorage.setItem('freightiq_token', 'freightiq-jwt-' + Date.now());
        localStorage.setItem('freightiq_active_role', 'customer');
        sessionStorage.setItem('freightiq_active_role', 'customer');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(authResult.user);
        }, 300);
        return;
      }

      if (authResult.notFound) {
        // User does NOT exist in database -> Pop message and automatically redirect to register page!
        setErrors({ general: 'No customer account found with this email. Redirecting to registration page...' });
        setRegForm((prev) => ({ ...prev, email: normalizedEmail }));
        setTimeout(() => {
          setViewMode('register');
        }, 800);
        return;
      }

      // Password mismatch or credentials invalid
      setErrors({ general: authResult.error || 'Invalid credentials. Please verify your email and password.' });
    } catch (authErr) {
      console.warn('Customer auth error:', authErr);
      setErrors({ general: 'Authentication service encountered an error. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  // Handle Customer Registration Submit
  const handleRegisterSubmit = async (ev) => {
    ev.preventDefault()
    if (role === 'admin') {
      setErrors({ general: 'Administrative accounts cannot be self-registered.' })
      return
    }

    const e = validateRegister()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)

    try {
      const regResult = await registerCustomer({
        email: regForm.email,
        password: regForm.password,
        full_name: regForm.name,
        company: regForm.company,
        phone: regForm.phone,
        gstin: regForm.gstin,
        corridor: regForm.corridor
      });

      if (!regResult.success) {
        if (regResult.code === 'USER_EXISTS') {
          // Email already exists -> pop message and redirect to sign in!
          setErrors({ general: 'User exists with this email address. Please sign in instead.' });
          setEmail(regForm.email.trim());
          setViewMode('login');
          return;
        }

        if (regResult.code === 'WEAK_PASSWORD') {
          setErrors({ password: regResult.error || 'Password must be at least 8 characters long and contain both letters and numbers.' });
          return;
        }

        setErrors({ general: regResult.error || 'Registration failed. Please try again.' });
        return;
      }

      // Successful Registration
      if (regResult.user) {
        setSuccess(`Customer account created successfully for ${regResult.user.full_name}! Launching your fresh workspace...`);
        localStorage.setItem('freightiq_user', JSON.stringify(regResult.user));
        localStorage.setItem('freightiq_token', 'freightiq-jwt-' + Date.now());
        localStorage.setItem('freightiq_active_role', 'customer');
        sessionStorage.setItem('freightiq_active_role', 'customer');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(regResult.user);
        }, 600);
      }
    } catch (regErr) {
      console.warn('Registration error:', regErr);
      setErrors({ general: 'Registration service encountered an error. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-card">
      {/* Decorative ambient background */}
      <div className="card-deco">
        <svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="120" cy="80" r="60" fill="#2d9b8a" opacity="0.3" />
          <circle cx="110" cy="90" r="35" fill="#3dbfa8" opacity="0.18" />
        </svg>
      </div>

      {/* DUAL ROLE LOGIN MENU TABS (No emojis, sleek enterprise icons) */}
      <div className="role-selector-menu" role="tablist" aria-label="Portal Selection">
        <button
          type="button"
          role="tab"
          aria-selected={role === 'customer'}
          className={`role-tab-btn customer ${role === 'customer' ? 'active' : ''}`}
          onClick={() => handleRoleChange('customer')}
        >
          <div className="role-icon-wrap">
            <UserIcon />
          </div>
          <div className="role-text-wrap">
            <span className="role-text">Customer Portal</span>
            <span className="role-sub">Shippers & Cargo</span>
          </div>
          <span className="role-reg-badge ok">
            <CheckIcon />
            <span>Open</span>
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={role === 'admin'}
          className={`role-tab-btn admin ${role === 'admin' ? 'active' : ''}`}
          onClick={() => handleRoleChange('admin')}
        >
          <div className="role-icon-wrap admin">
            <ShieldLockIcon />
          </div>
          <div className="role-text-wrap">
            <span className="role-text">Admin Command</span>
            <span className="role-sub">Fleet & Quantum</span>
          </div>
          <span className="role-reg-badge locked">
            <LockIcon />
            <span>Restricted</span>
          </span>
        </button>
      </div>

      {/* Header Info */}
      <div className="card-header-section">
        <div className="card-role-eyebrow">
          {role === 'customer' ? (
            <span className="badge-customer">VERIFIED CARGO SHIPPER & CLIENT PORTAL</span>
          ) : (
            <span className="badge-admin">MASTER ADMIN & DISPATCH CONSOLE</span>
          )}
        </div>
        <h2>
          {role === 'customer'
            ? (viewMode === 'register' ? 'Register Customer Account' : 'Customer Cargo Gateway')
            : 'Administrator Sign In'}
        </h2>
        <p className="card-sub">
          {role === 'customer'
            ? (viewMode === 'register'
                ? 'Create a verified shipper account to book multi-modal freight and monitor weather risks.'
                : 'Sign in to manage consignments, track real-time routes, and inspect demurrage risk.')
            : 'Enter authorized administrator credentials to access fleet telemetry and quantum circuits.'}
        </p>
      </div>

      {success && <div className="success-msg">{success}</div>}
      {errors.general && <div className="field-error general-error">{errors.general}</div>}

      {/* ───────────────── VIEW MODE: CUSTOMER REGISTRATION ───────────────── */}
      {role === 'customer' && viewMode === 'register' ? (
        <form onSubmit={handleRegisterSubmit} noValidate className="register-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrap">
              <input
                type="text"
                className={`form-input${errors.name ? ' is-error' : ''}`}
                placeholder="Ramesh Kumar"
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
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
                placeholder="Deccan Precision Logistics Ltd"
                value={regForm.company}
                onChange={(e) => setRegForm({ ...regForm, company: e.target.value })}
              />
            </div>
            {errors.company && <span className="field-error">{errors.company}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number (+91)</label>
            <div className="input-wrap">
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98201 55194"
                value={regForm.phone}
                onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">GSTIN / Tax ID (Optional)</label>
            <div className="input-wrap">
              <input
                type="text"
                className="form-input"
                placeholder="27AABCV1234F1Z5"
                value={regForm.gstin}
                onChange={(e) => setRegForm({ ...regForm, gstin: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Work Email Address</label>
            <div className="input-wrap">
              <input
                type="email"
                className={`form-input${errors.email ? ' is-error' : ''}`}
                placeholder="client@company.com"
                value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
              />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password (Min 8 chars, letters & numbers)</label>
            <div className="input-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                className={`form-input${errors.password ? ' is-error' : ''}`}
                placeholder="Min 8 chars with letters & numbers (e.g. Acme2026)"
                value={regForm.password}
                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
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
              value={regForm.corridor}
              onChange={(e) => setRegForm({ ...regForm, corridor: e.target.value })}
            >
              <option value="NH-48 (Bengaluru - Mumbai JNPT)">NH-48 (Bengaluru - Mumbai JNPT)</option>
              <option value="NH-44 (Bengaluru - Hyderabad)">NH-44 (Bengaluru - Hyderabad)</option>
              <option value="Chennai Port Corridors">Chennai Port Intermodal Corridors</option>
              <option value="Mundra Intermodal Maritime">Mundra Maritime Hub</option>
            </select>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Creating Account…' : 'Register Customer Account →'}
          </button>

          <p className="new-user-txt">
            Already have an account?{' '}
            <button type="button" className="teal-link" onClick={() => setViewMode('login')}>
              Sign in to your customer account
            </button>
          </p>
        </form>
      ) : (
        /* ───────────────── VIEW MODE: SIGN IN (CUSTOMER OR ADMIN) ───────────────── */
        <form onSubmit={handleLoginSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              {role === 'customer' ? 'Customer Email' : 'Administrator Email'}
            </label>
            <div className="input-wrap">
              <input
                type="email"
                className={`form-input${errors.email ? ' is-error' : ''}`}
                placeholder={role === 'customer' ? 'client@company.com' : 'admin@freightiq.ai'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">
              <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {role === 'customer' ? 'Password' : 'Admin Security Key'}
            </label>
            <div className="input-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                className={`form-input${errors.password ? ' is-error' : ''}`}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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

          {/* Remember / Forgot */}
          <div className="form-row">
            <label className="check-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <button type="button" className="forgot-btn" onClick={() => onForgotPassword && onForgotPassword(role)}>
              Forgot password?
            </button>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                </svg>
                Verifying Credentials…
              </>
            ) : (
              <>
                {role === 'customer' ? 'Sign In to Customer Portal' : 'Sign In to Admin Console'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>
      )}

      {/* ───────────────── REGISTRATION POLICY CONTROLS ───────────────── */}
      {viewMode === 'login' && (
        role === 'customer' ? (
          <>
            <div className="divider">
              <div className="div-line" />
              <span>or</span>
              <div className="div-line" />
            </div>

            <button
              type="button"
              className="btn-create"
              onClick={() => {
                if (onCreateAccount) onCreateAccount()
                else setViewMode('register')
              }}
            >
              + Create a New Customer Account
            </button>

            <p className="new-user-txt">
              New Customer?{' '}
              <button
                type="button"
                className="teal-link"
                onClick={() => setViewMode('register')}
              >
                Register here to start booking cargo
              </button>
            </p>
          </>
        ) : (
          /* ADMIN RESTRICTION NOTICE: Admin CANNOT register another account */
          <div className="admin-lock-box">
            <div className="alb-header">
              <div className="alb-icon-svg">
                <LockIcon />
              </div>
              <div>
                <strong>Admin Self-Registration Restricted</strong>
                <span className="alb-sub">Directory Security Policy</span>
              </div>
            </div>
            <p className="alb-desc">
              Administrative credentials cannot be registered through this interface.
              All admin accounts are restricted and must be provisioned internally by
              Corporate IT and Super-Administrator authority.
            </p>
            <div className="alb-badge">
              <span>Public Admin Registration: Disabled</span>
            </div>
          </div>
        )
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
