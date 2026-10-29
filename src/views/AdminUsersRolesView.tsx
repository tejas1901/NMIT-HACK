import React, { useState } from 'react';
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
  Shield
} from 'lucide-react';
import { UserAccount } from '../types';
import { AdminBadge } from '../components/AdminBadge';
import { INITIAL_USERS } from '../data/mockData';

export const AdminUsersRolesView: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'admin' | 'customer'>('ALL');

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
            Strict role-based isolation. The Customer panel never renders or receives admin models, while Admin Operations maintains complete visibility and oversight.
          </p>
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
                        <p className="font-bold text-[#08193A]">{user.name}</p>
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
