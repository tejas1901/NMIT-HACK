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
  CornerDownLeft,
  CreditCard,
  Shield,
  UserCheck
} from 'lucide-react';
import { NavTab } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  bookingCount?: number;
  heldPaymentCount?: number;
  userRole?: string;
  userName?: string;
  userEmail?: string;
  onTriggerPilotPrompt?: (prompt: string) => void;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  bookingCount = 9,
  heldPaymentCount = 2,
  userRole = 'customer',
  userName = 'Customer Shipper',
  userEmail = 'customer@freightiq.ai',
  onTriggerPilotPrompt,
  onSignOut
}) => {
  const [pilotDrawerOpen, setPilotDrawerOpen] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const isAdmin = userRole === 'admin';

  // Rotating Live Sync status
  const syncStatuses = isAdmin
    ? ["Supabase connected", "SQLite synced", "WebSocket: 24 ms", "QpiAI Solver: Online"]
    : ["Supabase connected", "70% Advance Policy Active", "Live GPS Telemetry: OK"];
  const [syncStatusIndex, setSyncStatusIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSyncStatusIndex((prev) => (prev + 1) % syncStatuses.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [syncStatuses.length]);

  // Role-Based Navigation: Admin gets EVERYTHING, Customer gets business features ONLY
  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
  }> = isAdmin
    ? [
        { id: 'cargo-bookings', label: 'Fleet Cargo Bookings', icon: Package, badge: bookingCount },
        { id: 'corridor-simulation', label: 'Corridor & Simulation', icon: Navigation },
        { id: 'xgboost-ml', label: 'XGBoost ML Model', icon: Cpu },
        { id: 'qpiai-quantum', label: 'QpiAI Quantum QUBO', icon: Atom },
        { id: 'qpiai-pilot', label: 'QpiAi Pilot AI', icon: Bot },
        { id: 'payments', label: 'Payment Ledger & Audit', icon: CreditCard, badge: heldPaymentCount ? `${heldPaymentCount} Held` : undefined }
      ]
    : [
        { id: 'cargo-bookings', label: 'My Cargo Bookings', icon: Package, badge: bookingCount },
        { id: 'payments', label: 'Payments & Invoices', icon: CreditCard, badge: heldPaymentCount ? `${heldPaymentCount} Held` : '70% Policy' },
        { id: 'qpiai-pilot', label: 'Shipping AI Assistant', icon: Bot }
      ];

  const quickPromptChips = [
    'High weather risk shipments?',
    'Heavy rain segments on highway routes?',
    'NH-48 Corridor Weather Analysis',
    'Open-Meteo Radar Status'
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

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside 
        className="hidden md:flex flex-col w-[260px] min-w-[260px] max-w-[260px] shrink-0 sticky top-4 self-start max-h-[calc(100vh-32px)] z-30 p-3.5 glass-panel rounded-[28px] overflow-y-auto overflow-x-hidden justify-between shadow-[0_16px_50px_rgba(8,25,58,0.08)]"
        aria-label="Sidebar Navigation"
      >
        {/* Top Section: Brand + Profile */}
        <div className="flex flex-col gap-4">
          {/* Brand Wordmark & Pill */}
          <div className="px-2 pt-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[20px] tracking-tight text-[#08193A]">
                FREIGHT<span className="text-[#1B3A7A]">IQ</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#A7F3D0]/70 text-[#08193A] border border-[#6EE7B7]/50 shadow-xs">
                UNIFIED INTELLIGENCE
              </span>
            </div>
            <p className="text-[11px] text-[#5B6B86] font-medium tracking-wide">
              Autonomous Quantum & Weather Engine
            </p>
          </div>

          {/* User Profile Card */}
          <div className="p-2.5 rounded-[18px] bg-white/45 border border-white/80 shadow-xs flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#08193A] via-[#1B3A7A] to-[#34D399] p-[2px] shadow-xs shrink-0">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-[#08193A]">
                  {isAdmin ? 'AD' : (userName.slice(0, 2).toUpperCase() || 'CU')}
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-[#08193A] truncate">
                    {userName}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase ${
                    isAdmin ? 'bg-[#08193A] text-white' : 'bg-[#34D399]/30 text-[#065F46]'
                  }`}>
                    {isAdmin ? 'ADMIN' : 'CUSTOMER'}
                  </span>
                  <p className="text-[10px] text-[#5B6B86] truncate">
                    {userEmail}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onSignOut}
              title="Sign Out"
              aria-label="Sign Out"
              className="px-2 py-1 rounded-full text-[10px] font-semibold text-[#F26D6D] border border-[#F26D6D]/40 hover:bg-[#F26D6D]/10 liquid-btn shrink-0 cursor-pointer"
            >
              Sign Out
            </button>
          </div>

          {/* Primary Navigation Pills */}
          <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
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
        </div>

        {/* Bottom Section: Rotating Live Sync Status + Collapsible Quick Drawer */}
        <div className="flex flex-col gap-2.5 pt-2">
          {/* Live System Status Capsule with rotating status */}
          <div className="px-3 py-1.5 rounded-full bg-white/60 border border-white/80 flex items-center gap-2 shadow-xs transition-all">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-mint-pulse shrink-0" />
            <span className="text-[10px] font-bold text-[#08193A] truncate font-mono">
              Live Sync: {syncStatuses[syncStatusIndex]}
            </span>
          </div>

          {/* Collapsible QpiAi Pilot Quick-Assistant Drawer */}
          <div className="rounded-[20px] bg-white/50 border border-white/80 overflow-hidden shadow-xs transition-all">
            <button
              onClick={() => setPilotDrawerOpen(!pilotDrawerOpen)}
              className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-[#08193A] hover:bg-white/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
                <span className="text-[11px] uppercase tracking-wider font-bold">QpiAi Pilot Quick</span>
              </div>
              {pilotDrawerOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#5B6B86]" /> : <ChevronUp className="w-3.5 h-3.5 text-[#5B6B86]" />}
            </button>

            {pilotDrawerOpen && (
              <div className="p-2.5 pt-0 flex flex-col gap-2 border-t border-white/50">
                <p className="text-[10px] text-[#5B6B86] font-medium">
                  Trigger automated dispatch intelligence:
                </p>
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
                  {quickPromptChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuick(chip)}
                      className="text-left text-[10px] font-medium px-2.5 py-1.5 rounded-full bg-white/75 hover:bg-white hover:text-[#08193A] text-[#1B3A7A] border border-white/90 shadow-2xs truncate transition-all liquid-btn cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div className="relative mt-1">
                  <input
                    type="text"
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendQuick()}
                    placeholder="Ask QpiAi Pilot..."
                    className="w-full pl-3 pr-7 py-1.5 rounded-full text-[11px] glass-input placeholder-[#5B6B86]/70 text-[#08193A]"
                  />
                  <button
                    onClick={() => handleSendQuick()}
                    aria-label="Send query"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#08193A] hover:bg-[#A7F3D0] transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>

                {isTyping && (
                  <div className="flex items-center gap-1.5 text-[9px] text-[#5B6B86] pt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-bounce" />
                    <span>QpiAi Pilot analyzing telemetry...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Floating Capsule Bar (iOS 26 Style) */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 glass-panel rounded-full px-2 py-1.5 shadow-[0_12px_40px_rgba(8,25,58,0.18)] flex items-center justify-around border border-white/80">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
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
      </div>
    </>
  );
};
