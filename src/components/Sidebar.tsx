import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Navigation, 
  Cpu, 
  Atom, 
  Bot, 
  ChevronUp, 
  ChevronDown, 
  Send, 
  Sparkles, 
  LogOut, 
  Radio, 
  Truck, 
  ShoppingBag, 
  PlusCircle, 
  Users, 
  Shield, 
  FileText, 
  ListOrdered, 
  Repeat, 
  Lock,
  SquareParking,
  ShieldAlert,
  Building2,
  Mail,
  Inbox,
  Layers,
  UserCheck
} from 'lucide-react';
import { NavTab, Role, UserProfile } from '../types';
import { DEMO_MODE } from '../roles';
import { AdminBadge } from './AdminBadge';

interface SidebarProps {
  activeRole: Role;
  onOpenRoleSwitcher: () => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  bookingCount?: number;
  customerShipmentsCount?: number;
  purchasedFleetCount?: number;
  pendingRequestsCount?: number;
  onTriggerPilotPrompt?: (prompt: string) => void;
  onSignOut?: () => void;
  currentUser?: UserProfile;
  onOpenProfile?: () => void;
  canSwitchRole?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeRole,
  onOpenRoleSwitcher,
  activeTab,
  onSelectTab,
  bookingCount = 9,
  customerShipmentsCount = 6,
  purchasedFleetCount = 3,
  pendingRequestsCount = 4,
  onTriggerPilotPrompt,
  onSignOut,
  currentUser,
  onOpenProfile,
  canSwitchRole = true
}) => {
  const [pilotDrawerOpen, setPilotDrawerOpen] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Rotating Live Sync status
  const syncStatuses = [
    "Live Socket: Synced",
    "Supabase Cloud: Connected",
    "L-Band GPS: 18 ms (Active)",
    "QpiAI Quantum: Converged",
    "Telemetry Heartbeat: Healthy"
  ];
  const [syncStatusIndex, setSyncStatusIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSyncStatusIndex((prev) => (prev + 1) % syncStatuses.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [syncStatuses.length]);

  // CUSTOMER Navigation Items (Customer suite with QpiAi Copilot)
  const customerNavItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
  }> = [
    { id: 'customer-shipments', label: 'My Shipments', icon: Package, badge: customerShipmentsCount },
    { id: 'customer-unified-booking', label: 'Cargo, Haul & Fleet Booking', icon: Layers, badge: 'UNIFIED' },
    { id: 'corridor-simulation', label: 'Corridor & Simulator', icon: Navigation, badge: 'LIVE' },
    { id: 'customer-tracking', label: 'Live GPS Radar', icon: Radio, badge: 'LIVE' },
    { id: 'qpiai-pilot', label: 'QpiAi Copilot', icon: Bot, badge: 'AI' },
    { id: 'customer-fleet', label: 'My Rented Fleet', icon: ShoppingBag, badge: purchasedFleetCount }
  ];

  // ADMIN Navigation Items Grouped
  const adminSharedItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
  }> = [
    { id: 'admin-all-requests', label: 'All Booking Requests', icon: Inbox, badge: pendingRequestsCount || 'PENDING' },
    { id: 'admin-drivers', label: 'Driver Fleet & Roster', icon: UserCheck, badge: 'ROSTER' },
    { id: 'admin-all-shipments', label: 'All Shipments', icon: Package, badge: bookingCount },
    { id: 'corridor-simulation', label: 'Corridor & Simulator', icon: Navigation },
    { id: 'admin-fleet-radar', label: 'Fleet GPS Radar', icon: Radio, badge: 'LIVE' },
    { id: 'admin-truck-inventory', label: 'Truck Fleet Inventory', icon: Truck }
  ];

  const adminYardItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
  }> = [
    { id: 'admin-yard-slot-map', label: 'Yard & Gate Slot Map', icon: SquareParking, badge: '24 BAYS' }
  ];

  const adminOnlyItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
  }> = [
    { id: 'xgboost-ml', label: 'XGBoost ML Model', icon: Cpu },
    { id: 'qpiai-quantum', label: 'QpiAI Quantum', icon: Atom },
    { id: 'qpiai-pilot', label: 'QpiAi Copilot', icon: Bot },
    { id: 'admin-users-roles', label: 'Users & Roles', icon: Users },
    { id: 'admin-audit-log', label: 'Audit Log', icon: FileText }
  ];

  const quickPromptChips = [
    'Where is my active shipment?',
    'Any rain or traffic delays?',
    'Book a haul from Mumbai to Pune',
    'Book a truck from Bengaluru to Chennai'
  ];

  const handleSendQuick = (textToSend?: string) => {
    const query = textToSend || quickInput;
    if (!query.trim()) return;
    setIsTyping(true);
    setQuickInput(query);
    if (onTriggerPilotPrompt) {
      onTriggerPilotPrompt(query);
    }
    setTimeout(() => {
      setIsTyping(false);
      onSelectTab('qpiai-pilot');
    }, 600);
  };

  const userInitials = currentUser?.full_name
    ? currentUser.full_name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : (activeRole === 'admin' ? 'RG' : 'AV');

  const displayName = currentUser?.full_name || (activeRole === 'admin' ? 'Admin' : 'Ananya Verma');
  const displayCompany = currentUser?.company || (activeRole === 'admin' ? 'admin@gmail.com' : 'Vikas Intermodal Corp');

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside 
        className="hidden md:flex flex-col w-[264px] min-w-[264px] max-w-[264px] shrink-0 sticky top-4 left-4 h-[calc(100vh-32px)] z-30 p-3.5 glass-panel rounded-[28px] overflow-hidden justify-between shadow-[0_16px_50px_rgba(8,25,58,0.08)]"
        aria-label="Sidebar Navigation"
      >
        {/* Top Section: Brand + Navigation */}
        <div className="flex flex-col gap-3 min-h-0 flex-1 overflow-hidden">
          {/* Brand Wordmark & Role Mode Pill */}
          <div className="px-2 pt-1 flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[20px] tracking-tight text-[#08193A]">
                FREIGHT<span className="text-[#1B3A7A]">IQ</span>
              </span>
              {activeRole === 'admin' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#08193A] text-[#A7F3D0] border border-[#34D399]/40 shadow-xs flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-[#34D399]" />
                  <span>ADMIN OPERATIONS</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#1B3A7A]/15 text-[#1B3A7A] border border-[#1B3A7A]/30">
                  SHIPPER PORTAL
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#5B6B86] font-medium tracking-wide">
              {activeRole === 'admin' 
                ? 'Autonomous Quantum & Weather Engine' 
                : 'Commercial Freight Logistics Portal'}
            </p>
          </div>

          {/* User Profile Card */}
          <div 
            onClick={onOpenProfile}
            title="Click to view & edit your organization profile"
            className="p-2.5 rounded-[18px] bg-white/45 hover:bg-white/70 border border-white/80 shadow-xs flex items-center justify-between gap-2 shrink-0 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#08193A] via-[#1B3A7A] to-[#34D399] p-[2px] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-[#08193A]">
                  {userInitials}
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold text-[#08193A] truncate">
                    {displayName}
                  </p>
                  <span className="text-[9px] text-[#34D399] opacity-0 group-hover:opacity-100 transition-opacity font-mono font-bold">✎</span>
                </div>
                <p className="text-[10px] text-[#5B6B86] truncate">
                  {displayCompany}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSignOut) onSignOut();
              }}
              title="Sign Out"
              aria-label="Sign Out"
              className="px-2 py-1 rounded-full text-[10px] font-semibold text-[#F26D6D] border border-[#F26D6D]/40 hover:bg-[#F26D6D]/10 liquid-btn shrink-0 cursor-pointer"
            >
              Exit
            </button>
          </div>

          {/* Primary Navigation Pills Container (Scrollable if many admin items) */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {/* CUSTOMER NAVIGATION */}
            {activeRole === 'customer' && (
              <nav className="flex flex-col gap-1.5" aria-label="Customer Navigation">
                {customerNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id || (
                    item.id === 'customer-unified-booking' && (
                      activeTab === 'customer-unified-booking' || 
                      activeTab === 'cargo-bookings' || 
                      activeTab === 'customer-book' || 
                      activeTab === 'marketplace'
                    )
                  );
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 liquid-btn relative cursor-pointer ${
                        isActive
                          ? 'bg-[#08193A] text-white shadow-[0_4px_16px_rgba(8,25,58,0.25),inset_0_0_12px_rgba(52,211,153,0.35)]'
                          : 'text-[#08193A]/80 hover:bg-white/70 hover:text-[#08193A] hover:shadow-[0_2px_12px_rgba(52,211,153,0.2)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#6EE7B7]' : 'text-[#5B6B86]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                            isActive
                              ? 'bg-[#34D399] text-[#08193A]'
                              : 'bg-white/80 text-[#08193A] border border-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            )}

            {/* ADMIN NAVIGATION (Grouped: CONTROL TOWER first, SHARED, YARD, ADMIN ONLY) */}
            {activeRole === 'admin' && (
              <nav className="flex flex-col gap-3" aria-label="Admin Navigation">
                {/* Group 1: EXCEPTION CONTROL TOWER (FIRST ITEM IN ADMIN) */}
                <div className="space-y-1">
                  <div className="px-2 py-1 flex items-center justify-between text-[9px] font-mono font-bold tracking-wider text-[#5B6B86] uppercase">
                    <span>CONTROL TOWER</span>
                    <AdminBadge />
                  </div>
                  <button
                    onClick={() => onSelectTab('admin-exception-tower')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 liquid-btn relative cursor-pointer ${
                      activeTab === 'admin-exception-tower'
                        ? 'bg-[#08193A] text-white shadow-[0_4px_16px_rgba(8,25,58,0.25),inset_0_0_12px_rgba(52,211,153,0.35)]'
                        : 'text-[#08193A]/80 hover:bg-white/70 hover:text-[#08193A]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ShieldAlert className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'admin-exception-tower' ? 'text-[#6EE7B7]' : 'text-[#5B6B86]'}`} />
                      <span className="truncate">Exception Control Tower</span>
                    </div>
                    <AdminBadge />
                  </button>
                </div>

                {/* Group 2: SHARED VIEWS */}
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[9px] font-mono font-bold tracking-wider text-[#5B6B86] uppercase">
                    SHARED VIEWS
                  </div>
                  {adminSharedItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 liquid-btn relative cursor-pointer ${
                          isActive
                            ? 'bg-[#08193A] text-white shadow-[0_4px_16px_rgba(8,25,58,0.25),inset_0_0_12px_rgba(52,211,153,0.35)]'
                            : 'text-[#08193A]/80 hover:bg-white/70 hover:text-[#08193A]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#6EE7B7]' : 'text-[#5B6B86]'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-colors shrink-0 ${
                              isActive
                                ? 'bg-[#34D399] text-[#08193A]'
                                : 'bg-white/80 text-[#08193A] border border-white'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Group 2: GATE & YARD */}
                <div className="space-y-1">
                  <div className="px-2 py-1 flex items-center justify-between text-[9px] font-mono font-bold tracking-wider text-[#5B6B86] uppercase">
                    <span>GATE & YARD</span>
                    <AdminBadge />
                  </div>
                  {adminYardItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 liquid-btn relative cursor-pointer ${
                          isActive
                            ? 'bg-[#08193A] text-white shadow-[0_4px_16px_rgba(8,25,58,0.25),inset_0_0_12px_rgba(52,211,153,0.35)]'
                            : 'text-[#08193A]/80 hover:bg-white/70 hover:text-[#08193A]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#6EE7B7]' : 'text-[#5B6B86]'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <AdminBadge />
                      </button>
                    );
                  })}
                </div>

                {/* Group 3: ADMIN ONLY */}
                <div className="space-y-1">
                  <div className="px-2 py-1 flex items-center justify-between text-[9px] font-mono font-bold tracking-wider text-[#5B6B86] uppercase">
                    <span>ADMIN ONLY</span>
                    <AdminBadge />
                  </div>
                  {adminOnlyItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 liquid-btn relative cursor-pointer ${
                          isActive
                            ? 'bg-[#08193A] text-white shadow-[0_4px_16px_rgba(8,25,58,0.25),inset_0_0_12px_rgba(52,211,153,0.35)]'
                            : 'text-[#08193A]/80 hover:bg-white/70 hover:text-[#08193A]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#6EE7B7]' : 'text-[#5B6B86]'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <AdminBadge />
                      </button>
                    );
                  })}
                </div>
              </nav>
            )}
          </div>
        </div>

        {/* Bottom Section: Demo Switcher + Rotating Live Sync */}
        <div className="flex flex-col gap-2 pt-2 shrink-0 border-t border-black/5">
          {/* Operating Console Access Tier Switcher */}
          {DEMO_MODE && canSwitchRole && (
            <div className="p-1.5 rounded-xl bg-white/50 border border-white/80 flex items-center justify-between text-[10px]">
              <span className="text-[#5B6B86] font-medium">Access Tier:</span>
              <button
                onClick={onOpenRoleSwitcher}
                className="px-2.5 py-1 rounded-full text-[9px] font-bold font-mono bg-[#08193A] text-[#A7F3D0] hover:bg-[#1B3A7A] transition-all flex items-center gap-1 cursor-pointer"
                title="Switch Operating Console"
              >
                <Repeat className="w-2.5 h-2.5" />
                <span>{activeRole === 'admin' ? 'Admin Console' : 'Shipper Portal'}</span>
              </button>
            </div>
          )}

          {/* Live System Status Capsule */}
          <div className="px-3 py-1.5 rounded-full bg-white/60 border border-white/80 flex items-center gap-2 shadow-xs transition-all">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-mint-pulse shrink-0" />
            <span className="text-[10px] font-bold text-[#08193A] truncate font-mono">
              Live Sync: {syncStatuses[syncStatusIndex]}
            </span>
          </div>

          {/* Collapsible QpiAi Pilot Quick-Assistant (Available to both Customer & Admin) */}
          <div className="rounded-[18px] bg-white/50 border border-white/80 overflow-hidden shadow-xs transition-all">
            <button
              onClick={() => setPilotDrawerOpen(!pilotDrawerOpen)}
              className="w-full px-3 py-1.5 flex items-center justify-between text-xs font-semibold text-[#08193A] hover:bg-white/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#34D399]" />
                <span className="text-[10px] uppercase tracking-wider font-bold">QpiAi Quick</span>
              </div>
              {pilotDrawerOpen ? <ChevronDown className="w-3 h-3 text-[#5B6B86]" /> : <ChevronUp className="w-3 h-3 text-[#5B6B86]" />}
            </button>

            {pilotDrawerOpen && (
              <div className="p-2 pt-0 flex flex-col gap-1.5 border-t border-white/50">
                <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
                  {quickPromptChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuick(chip)}
                      className="text-left text-[9px] font-medium px-2 py-1 rounded-full bg-white/75 hover:bg-white text-[#1B3A7A] truncate transition-all cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div className="relative mt-0.5">
                  <input
                    type="text"
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendQuick()}
                    placeholder="Ask QpiAi Copilot..."
                    className="w-full pl-2.5 pr-6 py-1 rounded-full text-[10px] glass-input text-[#08193A]"
                  />
                  <button
                    onClick={() => handleSendQuick()}
                    aria-label="Send query"
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[#08193A]"
                  >
                    <Send className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Floating Capsule Bar */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 glass-panel rounded-full px-2 py-1.5 shadow-[0_12px_40px_rgba(8,25,58,0.18)] flex items-center justify-around border border-white/80">
        {(activeRole === 'customer' ? customerNavItems : adminSharedItems).slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (
            item.id === 'customer-unified-booking' && (
              activeTab === 'customer-unified-booking' || 
              activeTab === 'cargo-bookings' || 
              activeTab === 'customer-book' || 
              activeTab === 'marketplace'
            )
          );
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-full transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#08193A] text-white shadow-xs'
                  : 'text-[#5B6B86] hover:text-[#08193A]'
              }`}
              title={item.label}
              aria-label={item.label}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#6EE7B7]' : ''}`} />
            </button>
          );
        })}

        {DEMO_MODE && canSwitchRole && (
          <button
            onClick={onOpenRoleSwitcher}
            className="flex flex-col items-center justify-center p-2 rounded-full text-[#08193A]"
            title="Switch Operating Console"
            aria-label="Switch Operating Console"
          >
            <Repeat className="w-5 h-5 text-[#34D399]" />
          </button>
        )}

        {onOpenProfile && (
          <button
            onClick={onOpenProfile}
            className="flex flex-col items-center justify-center p-1.5 rounded-full text-[#08193A]"
            title="My Account Profile"
            aria-label="My Account Profile"
          >
            <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#08193A] to-[#34D399] text-white flex items-center justify-center text-[10px] font-bold">
              {userInitials}
            </span>
          </button>
        )}
      </div>
    </>
  );
};
