import React, { useState } from 'react';
import { 
  X, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Save, 
  RotateCcw,
  Truck,
  Hash,
  Lock,
  Key
} from 'lucide-react';
import { UserProfile, Role } from '../types';
import { supabase } from '../lib/supabase';
import { 
  LOGGED_IN_CUSTOMER_NAME, 
  LOGGED_IN_CUSTOMER_COMPANY, 
  LOGGED_IN_CUSTOMER_EMAIL 
} from '../roles';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  activeRole: Role;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
  activeRole
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...currentUser });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  if (!isOpen) return null;

  // Compute initials
  const initials = formData.full_name
    ? formData.full_name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AV';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      setPasswordError('');
      if (showPasswordChange && newPassword) {
        if (newPassword.length < 6) {
          setPasswordError('New password must be at least 6 characters.');
          setIsSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setPasswordError('Passwords do not match.');
          setIsSaving(false);
          return;
        }
        try {
          await supabase.auth.updateUser({ password: newPassword });
          const savedUsers = localStorage.getItem('freightiq_users_db');
          const users = savedUsers ? JSON.parse(savedUsers) : {};
          users[formData.email.toLowerCase()] = {
            email: formData.email,
            password: newPassword,
            role: activeRole.toUpperCase(),
            full_name: formData.full_name
          };
          localStorage.setItem('freightiq_users_db', JSON.stringify(users));
        } catch {}
      }

      // 1. Try to sync to Supabase profiles table if available
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: formData.id || 'usr-custom',
            full_name: formData.full_name,
            company: formData.company,
            phone: formData.phone,
            corridor: formData.corridor,
            gstin: formData.gstin,
            depot: formData.depot,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
      } catch {
        // Fallback gracefully if schema does not have profiles table
      }

      // 2. Local persistence & App state update
      onSaveProfile(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    const defaultProfile: UserProfile = {
      id: 'usr-default',
      email: LOGGED_IN_CUSTOMER_EMAIL,
      full_name: LOGGED_IN_CUSTOMER_NAME,
      company: LOGGED_IN_CUSTOMER_COMPANY,
      phone: '+91 98201 55194',
      corridor: 'NH-48 (Bengaluru - Mumbai JNPT)',
      gstin: '27AABCV1234F1Z5',
      depot: 'JNPT Nhava Sheva Terminal 3',
      role: 'CUSTOMER',
      role_label: 'Verified Customer'
    };
    setFormData(defaultProfile);
    onSaveProfile(defaultProfile);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl glass-panel-dark text-white rounded-[32px] p-6 md:p-8 shadow-[0_24px_80px_rgba(8,25,58,0.55)] border border-white/20 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
          aria-label="Close profile dashboard"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#34D399]/20 text-[#6EE7B7] border border-[#34D399]/40 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#34D399]" />
              <span>SHIPPER ACCOUNT PROFILE</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/10 text-white/70 flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 text-[#34D399]" />
              <span>{activeRole === 'admin' ? 'OPERATIONS LEAD' : 'VERIFIED CLIENT'}</span>
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Organization Profile & Account Details
          </h2>
          <p className="text-xs text-white/60">
            Configure your corporate shipper identity, primary dispatch corridors, GSTIN, and direct phone contact.
          </p>
        </div>

        {/* Top Summary Banner */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#38BDF8] via-[#1B3A7A] to-[#34D399] p-[2px] shadow-sm shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#08193A] flex items-center justify-center font-extrabold text-base text-[#34D399]">
                {initials}
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">
                {formData.full_name || 'Customer Shipper'}
              </h3>
              <p className="text-xs text-white/60 truncate">
                {formData.company || 'Enterprise Logistics Partner'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-[#A7F3D0]">
                  {formData.email}
                </span>
                {formData.phone && (
                  <span className="text-[10px] font-mono text-white/40">
                    • {formData.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-1.5 rounded-full text-[10px] font-bold text-white/70 hover:text-white border border-white/20 hover:bg-white/10 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
            title="Reset profile to standard corporate defaults"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Default</span>
          </button>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/80 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Ananya Verma"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-hidden focus:border-[#34D399] transition-all"
              />
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/80 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Company / Organization Name</span>
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Vikas Intermodal Corp"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-hidden focus:border-[#34D399] transition-all"
              />
            </div>

            {/* Work Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/80 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Work Email Address</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@organization.com"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-hidden focus:border-[#34D399] transition-all"
              />
            </div>

            {/* Direct Phone Number */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/80 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Direct Phone Number (+91 format)</span>
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98201 55194"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-hidden focus:border-[#34D399] transition-all"
              />
            </div>

            {/* GSTIN / Tax ID */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/80 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#34D399]" />
                <span>GSTIN / Corporate Tax ID</span>
              </label>
              <input
                type="text"
                value={formData.gstin || ''}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                placeholder="27AABCV1234F1Z5"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-hidden focus:border-[#34D399] transition-all uppercase"
              />
            </div>

            {/* Primary Corridor */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/80 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Primary Cargo Corridor</span>
              </label>
              <select
                value={formData.corridor || 'NH-48 (Bengaluru - Mumbai JNPT)'}
                onChange={(e) => setFormData({ ...formData, corridor: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/40 border border-white/20 text-white focus:outline-hidden focus:border-[#34D399] transition-all"
              >
                <option value="NH-48 (Bengaluru - Mumbai JNPT)" className="bg-[#08193A] text-white">NH-48 (Bengaluru - Mumbai JNPT)</option>
                <option value="NH-44 (Bengaluru - Hyderabad - Delhi)" className="bg-[#08193A] text-white">NH-44 (Bengaluru - Hyderabad - Delhi)</option>
                <option value="Western Freight Corridor (JNPT - Mundra - NCR)" className="bg-[#08193A] text-white">Western Freight Corridor (JNPT - Mundra - NCR)</option>
                <option value="Chennai Port Corridors" className="bg-[#08193A] text-white">Chennai Port Intermodal Corridors</option>
                <option value="Sanand - Pune Expressway" className="bg-[#08193A] text-white">Sanand - Pune Industrial Expressway</option>
              </select>
            </div>
          </div>

          {/* Operating Depot / Facility */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/80 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Assigned Facility Depot / Intermodal Terminal</span>
            </label>
            <input
              type="text"
              value={formData.depot || ''}
              onChange={(e) => setFormData({ ...formData, depot: e.target.value })}
              placeholder="e.g. JNPT Nhava Sheva Terminal 3 / Chakan Industrial Yard"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-hidden focus:border-[#34D399] transition-all"
            />
          </div>

          {/* Change Account Password (Secure authenticated change for registered users) */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
            <button
              type="button"
              onClick={() => { setShowPasswordChange(!showPasswordChange); setPasswordError(''); }}
              className="w-full flex items-center justify-between text-left text-xs font-bold text-white/90 hover:text-[#34D399] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Security: Update Account Password</span>
              </div>
              <span className="text-[10px] text-white/50">{showPasswordChange ? 'Hide ▲' : 'Change Password ▼'}</span>
            </button>

            {showPasswordChange && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                {passwordError && (
                  <p className="text-[11px] text-[#F26D6D] font-medium">{passwordError}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/70">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-black/40 border border-white/20 text-white placeholder-white/30 focus:outline-hidden focus:border-[#34D399]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/70">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-black/40 border border-white/20 text-white placeholder-white/30 focus:outline-hidden focus:border-[#34D399]"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-white/50">
                  {activeRole === 'admin' 
                    ? 'As an active Master Admin, you can change your password securely while logged in without data loss.' 
                    : 'Customer credentials update immediately upon saving.'}
                </p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="text-[11px] text-white/50">
              {saveSuccess ? (
                <span className="text-[#34D399] font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Profile updated & synced!
                </span>
              ) : (
                <span>Updates sync immediately across your active dashboard.</span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white/80 hover:bg-white/20 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
