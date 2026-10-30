import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Lock, 
  Check, 
  X, 
  Search, 
  Building2, 
  Key, 
  Sparkles,
  Shield,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { UserAccount } from '../types';
import { AdminBadge } from '../components/AdminBadge';
import { INITIAL_USERS } from '../data/mockData';
import { getRegisteredCustomers, DEMO_CUSTOMER_EMAILS } from '../services/customerAuth';
import { supabase } from '../lib/supabase';

// Helper to assemble full user directory merging initial users, local registrations, active session & Supabase cloud
const compileUserDirectory = async (): Promise<UserAccount[]> => {
  const registered = getRegisteredCustomers();

  let activeSessionUser: any = null;
  try {
    const raw = localStorage.getItem('freightiq_user');
    if (raw) activeSessionUser = JSON.parse(raw);
  } catch {}

  let cloudProfiles: any[] = [];
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && Array.isArray(data)) {
      cloudProfiles = data;
    }
  } catch (err) {
    console.warn('Supabase profiles fetch note:', err);
  }

  const map = new Map<string, UserAccount>();

  // 1. Initial baseline users
  INITIAL_USERS.forEach((u) => {
    map.set(u.email.toLowerCase(), u);
  });

  // 2. Persistent local customer registrations
  registered.forEach((c) => {
    const emailKey = c.email.toLowerCase();
    const isAdmin = c.role?.toLowerCase() === 'admin' || emailKey === 'admin@gmail.com';
    map.set(emailKey, {
      id: c.id,
      name: c.full_name,
      email: c.email,
      company: c.company || 'Commercial Shipper Corp',
      role: isAdmin ? 'admin' : 'customer',
      title: c.corridor ? `Corridor: ${c.corridor}` : (c.role_label || 'Verified Cargo Shipper'),
      status: 'ACTIVE',
      lastLogin: c.created_at 
        ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today' 
        : 'Just now',
      accessTier: isAdmin ? 'Enterprise Admin (Root)' : 'Tier 1 - Shipper Access'
    });
  });

  // 3. Supabase Cloud Profiles
  cloudProfiles.forEach((cp) => {
    if (!cp.email) return;
    const emailKey = cp.email.toLowerCase();
    const isAdmin = cp.role?.toLowerCase() === 'admin' || emailKey === 'admin@gmail.com';
    if (!map.has(emailKey)) {
      map.set(emailKey, {
        id: cp.id || `usr-cloud-${emailKey.replace(/[^a-zA-Z0-9]/g, '')}`,
        name: cp.full_name || emailKey.split('@')[0],
        email: cp.email,
        company: cp.company || 'Commercial Freight Client',
        role: isAdmin ? 'admin' : 'customer',
        title: isAdmin ? 'Operations Command' : (cp.corridor ? `Corridor: ${cp.corridor}` : 'Verified Cargo Shipper'),
        status: 'ACTIVE',
        lastLogin: cp.created_at ? new Date(cp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today' : 'Recently Active',
        accessTier: isAdmin ? 'Enterprise Admin (Root)' : 'Tier 1 - Shipper Access'
      });
    }
  });

  // 4. Current active session user if signed in as customer
    if (activeSessionUser?.email) {
      const emailKey = activeSessionUser.email.toLowerCase();
      if (!DEMO_CUSTOMER_EMAILS.includes(emailKey)) {
        const isAdmin = activeSessionUser.role?.toLowerCase() === 'admin' || emailKey === 'admin@gmail.com';
        if (!map.has(emailKey)) {
          map.set(emailKey, {
            id: activeSessionUser.id || `usr-active-${Date.now()}`,
            name: activeSessionUser.full_name || emailKey.split('@')[0],
            email: activeSessionUser.email,
            company: activeSessionUser.company || 'Commercial Shipper Corp',
            role: isAdmin ? 'admin' : 'customer',
            title: isAdmin ? 'Operations Command' : 'Verified Cargo Shipper',
            status: 'ACTIVE',
            lastLogin: 'Just now (Active Session)',
            accessTier: isAdmin ? 'Enterprise Admin (Root)' : 'Tier 1 - Shipper Access'
          });
        }
      }
    }

    const demoSet = new Set(DEMO_CUSTOMER_EMAILS.map(e => e.toLowerCase()));
    return Array.from(map.values()).filter(u => !demoSet.has(u.email.toLowerCase()));
  };

export const AdminUsersRolesView: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    // Synchronously seed with initial users + any local registrations
    const registered = getRegisteredCustomers();
    const map = new Map<string, UserAccount>();
    INITIAL_USERS.forEach((u) => map.set(u.email.toLowerCase(), u));
    registered.forEach((c) => {
      const emailKey = c.email.toLowerCase();
      const isAdmin = c.role?.toLowerCase() === 'admin' || emailKey === 'admin@gmail.com';
      map.set(emailKey, {
        id: c.id,
        name: c.full_name,
        email: c.email,
        company: c.company || 'Commercial Shipper Corp',
        role: isAdmin ? 'admin' : 'customer',
        title: c.corridor ? `Corridor: ${c.corridor}` : (c.role_label || 'Verified Cargo Shipper'),
        status: 'ACTIVE',
        lastLogin: c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today' : 'Just now',
        accessTier: isAdmin ? 'Enterprise Admin (Root)' : 'Tier 1 - Shipper Access'
      });
    });
    const demoSet = new Set(DEMO_CUSTOMER_EMAILS.map(e => e.toLowerCase()));
    return Array.from(map.values()).filter(u => !demoSet.has(u.email.toLowerCase()));
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'admin' | 'customer'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync users from local persistent registry, active session and Supabase cloud
  const refreshUsers = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const updated = await compileUserDirectory();
      setUsers(updated);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Real-time synchronization listeners
  useEffect(() => {
    refreshUsers();

    // 1. BroadcastChannel real-time sync across tabs
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('freightiq_realtime_sync');
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'SYNC_CUSTOMERS' || ev.data?.type === 'SYNC_USER') {
          refreshUsers();
        }
      };
    }

    // 2. Storage event listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'freightiq_registered_customers' || e.key === 'freightiq_user') {
        refreshUsers();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Periodic polling interval (every 4 seconds for fresh customer signups)
    const interval = setInterval(refreshUsers, 4000);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [refreshUsers]);

  const filtered = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedRoleFilter !== 'ALL' && u.role !== selectedRoleFilter) return false;
    return true;
  });

  const totalCustomers = users.filter((u) => u.role === 'customer').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;

  const permissionsMatrix = [
    { capability: 'View & Track Own Consignments', customer: true, admin: true },
    { capability: 'Submit Freight Haul Requests', customer: true, admin: true },
    { capability: 'Browse & Buy Commercial Trucks', customer: true, admin: true },
    { capability: 'Download Official Tax Invoices', customer: true, admin: true },
    { capability: 'Multi-Tenant Cross-Customer Shipments', customer: false, admin: true },
    { capability: 'XGBoost ML Delay Prediction Math & Weights', customer: false, admin: true },
    { capability: 'QpiAI QUBO Quantum Carrier Circuits', customer: false, admin: true },
    { capability: 'Deep Truck Intelligence & CAN-Bus DTCs', customer: false, admin: true },
    { capability: 'Speed Governor Overrides & Cab Alerts', customer: false, admin: true },
    { capability: 'Dynamic Commercial Pricing Quoting', customer: false, admin: true },
    { capability: 'System Audit Logs & Security Tracing', customer: false, admin: true }
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#08193A] text-[#A7F3D0] border border-[#34D399]/40 flex items-center gap-1.5">
              <Users className="w-3 h-3 text-[#34D399]" />
              <span>ACCESS CONTROL & GOVERNANCE</span>
            </span>
            <AdminBadge label="SECURITY ADMIN" />
            <span className="text-xs text-[#5B6B86] font-medium">• Single Source of Truth</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
            User Accounts & Role Permissions (RBAC)
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-3xl">
            Real-time multi-tenant directory. Every newly registered customer and authenticated shipper immediately syncs into this administrative view.
          </p>
        </div>

        {/* Directory Controls & Live Cloud Sync Status */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="px-3 py-1.5 rounded-full text-[11px] font-mono font-semibold bg-white/70 border border-black/5 text-[#08193A] flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            <span>Supabase Cloud Sync: Live</span>
          </div>

          <button
            onClick={refreshUsers}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
            title="Refresh user directory from persistent store and Supabase database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Directory'}</span>
          </button>
        </div>
      </div>

      {/* KPI Directory Bento Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-[22px] glass-panel flex flex-col justify-between shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6B86]">TOTAL ACCOUNTS</span>
          <div className="my-1 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-[#08193A]">{users.length}</span>
            <span className="text-[11px] font-bold text-[#34D399]">Registered</span>
          </div>
          <span className="text-[10px] text-[#5B6B86]">Admins & Shippers Combined</span>
        </div>

        <div className="p-4 rounded-[22px] glass-panel flex flex-col justify-between border border-[#34D399]/40 bg-gradient-to-br from-white/90 to-[#34D399]/5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B3A7A]">VERIFIED SHIPPERS (CUSTOMERS)</span>
          <div className="my-1 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-[#1B3A7A]">{totalCustomers}</span>
            <span className="text-[11px] font-bold text-[#34D399]">Active</span>
          </div>
          <span className="text-[10px] text-[#34D399] font-semibold">Self-registered shippers via gateway</span>
        </div>

        <div className="p-4 rounded-[22px] glass-panel flex flex-col justify-between shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6B86]">MASTER ADMINISTRATORS</span>
          <div className="my-1 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-[#08193A]">{totalAdmins}</span>
            <span className="text-[11px] font-bold text-[#1B3A7A]">Root Ops</span>
          </div>
          <span className="text-[10px] text-[#5B6B86]">Password@123 Elevated Command</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-[24px] glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#5B6B86] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, email, company..."
            className="w-full pl-9 pr-4 py-2 rounded-full text-xs font-medium glass-input text-[#08193A] placeholder-[#5B6B86]/70"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {(['ALL', 'admin', 'customer'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRoleFilter(r)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all liquid-btn cursor-pointer ${
                selectedRoleFilter === r
                  ? 'bg-[#08193A] text-white shadow-xs'
                  : 'bg-white/60 text-[#5B6B86] hover:bg-white border border-white'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r === 'admin' ? 'Admins (Ops)' : 'Customers (Shippers)'}
            </button>
          ))}
        </div>
      </div>

      {/* User Directory Table */}
      <div className="p-5 md:p-6 rounded-[28px] glass-panel shadow-sm border border-white/80 overflow-hidden space-y-4">
        <h3 className="text-sm font-extrabold text-[#08193A] flex items-center justify-between">
          <span>Active User Directory & Identities</span>
          <span className="text-xs font-mono text-[#5B6B86]">{filtered.length} Users Registered</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/5 text-[#5B6B86] font-mono text-[10px] uppercase">
                <th className="py-2.5 px-3">User & Identity</th>
                <th className="py-2.5 px-3">Role & Access Tier</th>
                <th className="py-2.5 px-3">Corporate Entity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-white/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        user.role === 'admin' ? 'bg-[#08193A] text-[#34D399]' : 'bg-[#1B3A7A]/15 text-[#1B3A7A]'
                      }`}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-[#08193A]">{user.name}</p>
                          {(user.lastLogin.includes('Today') || user.lastLogin.includes('Just now')) && user.role === 'customer' ? (
                            <span className="px-1.5 py-0.5 rounded-full text-[8.5px] font-mono font-bold bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40">
                              VERIFIED SIGNUP
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[10px] text-[#5B6B86] font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1 ${
                      user.role === 'admin' 
                        ? 'bg-[#08193A] text-[#A7F3D0]' 
                        : 'bg-[#34D399]/20 text-[#08193A]'
                    }`}>
                      {user.role === 'admin' ? <Shield className="w-3 h-3 text-[#34D399]" /> : <Users className="w-3 h-3 text-[#1B3A7A]" />}
                      <span>{user.role.toUpperCase()}</span>
                    </span>
                    <p className="text-[10px] text-[#5B6B86] mt-0.5">{user.accessTier}</p>
                  </td>

                  <td className="py-3 px-3 font-semibold text-[#08193A]">
                    {user.company}
                    <p className="text-[10px] text-[#5B6B86] font-normal">{user.title}</p>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#34D399]/20 text-[#08193A]">
                      {user.status}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px] text-[#5B6B86]">
                    {user.lastLogin}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Capabilities Matrix */}
      <div className="p-5 md:p-6 rounded-[28px] glass-panel shadow-sm border border-white/80 space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#08193A] flex items-center gap-2">
            <Key className="w-4 h-4 text-[#1B3A7A]" />
            <span>Role-Based Access Control (RBAC) Matrix</span>
          </h3>
          <p className="text-xs text-[#5B6B86] mt-0.5">
            Single source of truth configured in <code className="font-mono text-[#08193A]">roles.ts</code> with zero client code leakage.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-black/5 text-[#5B6B86] text-[10px] uppercase">
                <th className="py-2.5 px-3">Functional Capability</th>
                <th className="py-2.5 px-3 text-center">Customer Role (Shipper)</th>
                <th className="py-2.5 px-3 text-center">Admin Role (Operations)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/40">
                  <td className="py-2.5 px-3 font-sans font-semibold text-[#08193A]">
                    {item.capability}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.customer ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#34D399]/20 text-[#08193A]">
                        <Check className="w-3 h-3 text-[#34D399]" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/10 text-red-500">
                        <X className="w-3 h-3 text-red-500" />
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#08193A] text-[#34D399]">
                      <Check className="w-3 h-3 text-[#34D399]" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
