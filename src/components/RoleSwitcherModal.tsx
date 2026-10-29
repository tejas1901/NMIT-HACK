import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  KeyRound, 
  Loader2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserRole } from '../types';
import { setElevationToken, clearElevationToken } from '../services/api';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  activeRole,
  onSelectRole
}) => {
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminElevationSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminPassword.trim()) {
      setErrorMessage('Admin password is required');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/admin-elevate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: adminPassword,
          userId: 'rajathgowda',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'Incorrect password');
        setIsVerifying(false);
        return;
      }

      // Elevation successful! Store token in api service & sessionStorage
      setElevationToken(data.token);
      setIsVerifying(false);
      setAdminPassword('');
      setShowPasswordPrompt(false);
      onSelectRole('admin');
      onClose();
    } catch {
      setErrorMessage('Unable to connect to authorization gateway');
      setIsVerifying(false);
    }
  };

  const handleChoose = (role: UserRole) => {
    if (role === 'customer') {
      clearElevationToken();
      setShowPasswordPrompt(false);
      setErrorMessage(null);
      onSelectRole('customer');
      onClose();
    } else {
      // Switching to Admin
      if (activeRole === 'admin') {
        onClose();
      } else {
        setShowPasswordPrompt(true);
        setErrorMessage(null);
      }
    }
  };

  const handleClose = () => {
    setShowPasswordPrompt(false);
    setAdminPassword('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl glass-panel-dark text-white rounded-[32px] p-6 md:p-8 shadow-[0_24px_80px_rgba(8,25,58,0.55)] border border-white/20 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#34D399]/20 text-[#6EE7B7] border border-[#34D399]/40 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#34D399]" />
              <span>DUAL-PANEL ARCHITECTURE</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/10 text-white/70 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-[#34D399]" />
              <span>RBAC SECURED</span>
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Switch Operating Mode & Access Control
          </h2>
          <p className="text-xs text-white/60">
            Toggle between the Operations Center (Admin) and the Commercial Shipper Client Portal (Customer).
          </p>
        </div>

        {/* Two Role Cards Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. ADMIN PANEL */}
          <div 
            onClick={() => {
              if (!showPasswordPrompt && activeRole !== 'admin') {
                setShowPasswordPrompt(true);
              }
            }}
            className={`p-5 rounded-[26px] border transition-all flex flex-col justify-between space-y-4 group relative ${
              activeRole === 'admin'
                ? 'bg-[#34D399]/15 border-[#34D399] shadow-[0_0_30px_rgba(52,211,153,0.25)]'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 cursor-pointer'
            }`}
          >
            {activeRole === 'admin' && (
              <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399] text-[#08193A] flex items-center gap-1">
                <Check className="w-3 h-3" />
                ACTIVE
              </span>
            )}

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#08193A] border border-white/20 flex items-center justify-center text-[#34D399]">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#A7F3D0]">
                  Role: Operations Lead
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Admin Panel
                </h3>
                <p className="text-xs text-white/70 mt-1">
                  Full command of enterprise logistics pipelines, corridor simulations, and predictive ML models.
                </p>
              </div>

              {/* Persona Tag */}
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#34D399] text-[#08193A] font-bold text-xs flex items-center justify-center shrink-0">
                  RG
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-semibold text-white truncate">Rajathgowda</p>
                  <p className="text-[10px] text-white/50 truncate">rajathgowda@gmail.com</p>
                </div>
              </div>

              {/* Capabilities checklist (Shown when not entering password) */}
              {(!showPasswordPrompt || activeRole === 'admin') && (
                <div className="space-y-1.5 pt-1 text-[11px] text-white/75 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Live Manifest Register & Overrides</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>XGBoost 3.2 Evaluation Metrics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>QpiAI Quantum QUBO Allocation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Open-Meteo Waypoint Radar</span>
                  </div>
                </div>
              )}

              {/* PASSWORD PROMPT CONTAINER */}
              {showPasswordPrompt && activeRole !== 'admin' && (
                <form 
                  onSubmit={handleAdminElevationSubmit}
                  onClick={(e) => e.stopPropagation()} 
                  className="pt-2 space-y-2.5 animate-in fade-in duration-150"
                >
                  <label className="text-[11px] font-bold text-[#A7F3D0] flex items-center gap-1.5">
                    <KeyRound className="w-3 h-3 text-[#34D399]" />
                    <span>Admin Elevation Passcode</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoFocus
                      placeholder="Enter administrator password..."
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-3.5 py-2 pr-9 rounded-xl text-xs bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-hidden focus:border-[#34D399] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {errorMessage && (
                    <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-200 text-[11px] flex items-center gap-1.5 leading-tight">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlock Admin</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordPrompt(false);
                        setErrorMessage(null);
                        setAdminPassword('');
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-medium bg-white/10 text-white/80 hover:bg-white/20 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {(!showPasswordPrompt || activeRole === 'admin') && (
              <button
                type="button"
                onClick={() => handleChoose('admin')}
                className={`w-full py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRole === 'admin'
                    ? 'bg-[#34D399] text-[#08193A]'
                    : 'bg-white/15 text-white group-hover:bg-white group-hover:text-[#08193A]'
                }`}
              >
                <span>{activeRole === 'admin' ? 'Stay in Admin Mode' : 'Switch to Admin Panel'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. CUSTOMER PANEL */}
          <div 
            onClick={() => handleChoose('customer')}
            className={`p-5 rounded-[26px] border transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative ${
              activeRole === 'customer'
                ? 'bg-[#34D399]/15 border-[#34D399] shadow-[0_0_30px_rgba(52,211,153,0.25)]'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
            }`}
          >
            {activeRole === 'customer' && (
              <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399] text-[#08193A] flex items-center gap-1">
                <Check className="w-3 h-3" />
                ACTIVE
              </span>
            )}

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#08193A] border border-white/20 flex items-center justify-center text-[#6EE7B7]">
                <UserCheck className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#6EE7B7]">
                  Role: Shipper / Client
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Customer Panel
                </h3>
                <p className="text-xs text-white/70 mt-1">
                  Dedicated client portal to track shipments, view live GPS coordinates, and purchase commercial trucks.
                </p>
              </div>

              {/* Persona Tag */}
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#38BDF8] to-[#34D399] text-[#08193A] font-bold text-xs flex items-center justify-center shrink-0">
                  AV
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-semibold text-white truncate">Ananya Verma</p>
                  <p className="text-[10px] text-white/50 truncate">Vikas Intermodal Logistics Corp</p>
                </div>
              </div>

              {/* Capabilities checklist */}
              <div className="space-y-1.5 pt-1 text-[11px] text-white/75 font-medium">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>My Active Shipments & Live ETAs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Truck GPS Coordinates & Radar Telemetry</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Instant Rate Calculator & Haul Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Fleet Marketplace: Purchase Rig Models</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={`w-full py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRole === 'customer'
                  ? 'bg-[#34D399] text-[#08193A]'
                  : 'bg-white/15 text-white group-hover:bg-white group-hover:text-[#08193A]'
              }`}
            >
              <span>{activeRole === 'customer' ? 'Stay in Customer Mode' : 'Switch to Customer Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
