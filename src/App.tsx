import React, { useState, useEffect } from 'react';
import { NavTab, Consignment, WaypointWeather, TelemetryUnit, BackhaulPairing, FreightException, DevLogMessage, UserRole } from './types';
import { 
  INITIAL_CONSIGNMENTS, 
  WAYPOINTS_WEATHER, 
  TELEMETRY_UNITS, 
  BACKHAUL_ROWS, 
  FREIGHT_EXCEPTIONS, 
  INITIAL_DEV_LOGS 
} from './data/mockData';
import { LiquidBackground } from './components/LiquidBackground';
import { Sidebar } from './components/Sidebar';
import { DevConsole } from './components/DevConsoleModal';
import { ConsignmentDetailDrawer } from './components/ConsignmentDetailDrawer';
import { NewBookingModal } from './components/NewBookingModal';
import { LiveEventTicker } from './components/LiveEventTicker';
import { CargoBookingsView } from './views/CargoBookingsView';
import { CorridorSimulationView } from './views/CorridorSimulationView';
import { XGBoostModelView } from './views/XGBoostModelView';
import { QpiAIQuantumView } from './views/QpiAIQuantumView';
import { QpiAiPilotView } from './views/QpiAiPilotView';
import { PaymentsView } from './views/PaymentsView';
import { CheckCircle2, Sparkles, Bell } from 'lucide-react';

interface UnifiedCockpitProps {
  user?: {
    email?: string;
    full_name?: string;
    company?: string;
    role?: string;
  } | null;
  onSignOut?: () => void;
}

export function UnifiedIntelligenceCockpit({ user, onSignOut }: UnifiedCockpitProps) {
  // Determine Role & Identity
  const userRole: UserRole = (user?.role?.toLowerCase() === 'admin' ? 'admin' : 'customer') as UserRole;
  const userName = user?.full_name || (userRole === 'admin' ? 'System Administrator' : 'Customer Shipper');
  const userEmail = user?.email || (userRole === 'admin' ? 'admin@freightiq.ai' : 'customer@freightiq.ai');
  const isAdmin = userRole === 'admin';

  // Skeleton Loading on First Load (~500ms)
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Navigation State with persistent tab
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    try {
      const saved = localStorage.getItem('freightiq_active_tab');
      if (saved && ['cargo-bookings', 'corridor-simulation', 'xgboost-ml', 'qpiai-quantum', 'qpiai-pilot', 'payments'].includes(saved)) {
        return saved as NavTab;
      }
    } catch {}
    return 'cargo-bookings';
  });

  useEffect(() => {
    try {
      localStorage.setItem('freightiq_active_tab', activeTab);
    } catch {}
  }, [activeTab]);

  // If a customer somehow has an admin tab selected, redirect to cargo-bookings
  useEffect(() => {
    if (!isAdmin && ['corridor-simulation', 'xgboost-ml', 'qpiai-quantum'].includes(activeTab)) {
      setActiveTab('cargo-bookings');
    }
  }, [isAdmin, activeTab]);

  // Application Data States
  const [consignments, setConsignments] = useState<Consignment[]>(INITIAL_CONSIGNMENTS);
  const [waypoints, setWaypoints] = useState<WaypointWeather[]>(WAYPOINTS_WEATHER);
  const [units, setUnits] = useState<Record<string, TelemetryUnit>>(TELEMETRY_UNITS);
  const [backhauls, setBackhauls] = useState<BackhaulPairing[]>(BACKHAUL_ROWS);
  const [exceptions, setExceptions] = useState<FreightException[]>(FREIGHT_EXCEPTIONS);
  const [devLogs, setDevLogs] = useState<DevLogMessage[]>(INITIAL_DEV_LOGS);

  // Modals & Panels
  const [selectedConsignment, setSelectedConsignment] = useState<Consignment | null>(null);
  const [newBookingModalOpen, setNewBookingModalOpen] = useState(false);
  const [isWeatherRefreshing, setIsWeatherRefreshing] = useState(false);

  // Quick Pilot trigger state
  const [pilotPrompt, setPilotPrompt] = useState<string | undefined>(undefined);

  // Toast Notification System
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Add a Dev Log
  const addDevLog = (level: DevLogMessage['level'], message: string) => {
    const newLog: DevLogMessage = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level,
      message
    };
    setDevLogs((prev) => [newLog, ...prev.slice(0, 29)]);
  };

  // Held payments count (sub-70% payments)
  const heldPaymentCount = consignments.filter(
    (c) => ((c.amountPaidInr || 0) / (c.totalInvoiceInr || 150000)) * 100 < 70
  ).length;

  // Handle Payment Update & 70% Policy Clearance
  const handleUpdatePayment = (consignmentId: string, amountToAdd: number, method: string) => {
    setConsignments((prev) =>
      prev.map((c) => {
        if (c.id !== consignmentId) return c;
        const total = c.totalInvoiceInr || 150000;
        const newPaid = (c.amountPaidInr || 0) + amountToAdd;
        const newPct = (newPaid / total) * 100;
        const isCleared = newPct >= 70;
        const isFull = newPct >= 100;

        return {
          ...c,
          amountPaidInr: newPaid,
          paymentStatus: isFull ? 'FULLY_PAID' : isCleared ? 'DISPATCH_CLEARED' : 'PARTIAL_HELD',
          isDispatchHeldForPayment: !isCleared,
          transportDelayHours: isCleared ? 0 : Math.max(0, (c.transportDelayHours || 18) - 6),
          status: isFull ? 'CONFIRMED' : isCleared ? 'CONFIRMED' : 'HOLD_PAYMENT',
          eta: isCleared ? (c.eta.includes('Delay') ? '06h 45m' : c.eta) : c.eta,
          notes: isCleared
            ? `70% advance policy met (Paid ₹${newPaid.toLocaleString('en-IN')}). Transport cleared for corridor departure.`
            : `Partial payment received (₹${newPaid.toLocaleString('en-IN')}). Transport held at terminal until ≥70% is cleared.`
        };
      })
    );

    addDevLog('INFO', `Payment of ₹${amountToAdd.toLocaleString('en-IN')} recorded for ${consignmentId} via ${method}.`);
  };

  // LIVE DATA ENGINE (simulated telemetry tick every 3s)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'hidden') return;

      // 1. Gently nudge speed (±1–2 km/h) & efficiency on active units
      setUnits((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          const deltaSpeed = Math.floor((Math.random() - 0.5) * 3);
          const newSpeed = Math.max(35, Math.min(85, updated[key].speedKmh + deltaSpeed));
          const deltaCap = (Math.random() - 0.5) * 0.3;
          const newCap = Math.min(99, Math.max(40, parseFloat((updated[key].capacityPercent + deltaCap).toFixed(1))));
          updated[key] = {
            ...updated[key],
            speedKmh: newSpeed,
            capacityPercent: newCap
          };
        });
        return updated;
      });

      // 2. Gently fluctuate waypoint wind & temp
      setWaypoints((prev) =>
        prev.map((wp) => {
          const deltaWind = (Math.random() - 0.48) * 0.9;
          const newWind = parseFloat(Math.max(8, Math.min(65, wp.windKmh + deltaWind)).toFixed(1));
          return {
            ...wp,
            windKmh: newWind
          };
        })
      );
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  // Action Handlers
  const handleForceWeatherRefresh = () => {
    setIsWeatherRefreshing(true);
    addDevLog('WEATHER', 'Open-Meteo REST poll initiated for NH-48 & NH-44 waypoints');
    setTimeout(() => {
      setWaypoints((prev) =>
        prev.map((wp) => ({
          ...wp,
          tempC: parseFloat((wp.tempC + (Math.random() - 0.5) * 0.4).toFixed(1)),
          windKmh: parseFloat((wp.windKmh + (Math.random() - 0.5) * 1.5).toFixed(1))
        }))
      );
      setIsWeatherRefreshing(false);
      showToast('Open-Meteo route weather re-synchronized (0.28s)');
      addDevLog('WEATHER', 'Forecast cache invalidated: 4 highway waypoints updated');
    }, 900);
  };

  const handleRerunRisk = (id: string) => {
    addDevLog('ML', `Re-scoring XGBoost risk vector for consignment ${id}...`);
    setTimeout(() => {
      setConsignments((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const newPercent = parseFloat(Math.max(12.4, Math.min(99.6, c.delayRiskPercent + (Math.random() - 0.5) * 4)).toFixed(1));
            return {
              ...c,
              delayRiskPercent: newPercent,
              delayRiskLevel: newPercent > 70 ? 'CRITICAL' : newPercent > 45 ? 'HIGH' : newPercent > 25 ? 'MODERATE' : 'LOW'
            };
          }
          return c;
        })
      );
      showToast(`XGBoost risk re-evaluated for ${id}`);
    }, 450);
  };

  const handleReassignCarrier = (id: string) => {
    addDevLog('QUANTUM', `Submitting QpiAI QUBO carrier reallocation for ${id}...`);
    setTimeout(() => {
      setConsignments((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const nextCarrier = c.carrierName.includes('Dedicated')
              ? 'Expedited Regional Express'
              : 'Dedicated Priority Air Cargo';
            return {
              ...c,
              carrierName: nextCarrier,
              netSavings: parseFloat((c.netSavings + 14.5).toFixed(2))
            };
          }
          return c;
        })
      );
      showToast(`QpiAI: Re-routed ${id} via optimal ground-air carrier`);
    }, 550);
  };

  const handlePairBackhaul = (id: string) => {
    setBackhauls((prev) =>
      prev.map((b) => (b.id === id ? { ...b, paired: !b.paired } : b))
    );
    showToast(`Backhaul pairing updated`);
    addDevLog('INFO', `Backhaul leg ${id} re-paired on NH-48 corridor`);
  };

  const handleResolveException = (id: string) => {
    setExceptions((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, resolved: true } : ex))
    );
    showToast('Exception marked resolved. Bypass route applied.');
    addDevLog('INFO', `Resolved road corridor bottleneck ${id}`);
  };

  const handleAddException = (exception: FreightException) => {
    setExceptions((prev) => [exception, ...prev]);
    showToast(`Logged new road exception on ${exception.unit}`);
    addDevLog('INFO', `New exception logged: ${exception.title} at ${exception.location}`);
  };

  const handleOpenDriverChat = (unitId: string) => {
    setActiveTab('qpiai-pilot');
    setPilotPrompt(`Connect me with the driver of ${unitId} and summarize current NH-48 weather advisory.`);
  };

  const handleNewBookingSubmit = (newBooking: Partial<Consignment>) => {
    const bookingId = `CRG-${Math.floor(20000 + Math.random() * 9000)}`;
    const fullBooking: Consignment = {
      id: bookingId,
      origin: newBooking.origin || 'Bengaluru Logistics Park',
      destination: newBooking.destination || 'Mumbai JNPT Port Gate',
      department: newBooking.department || 'General Industrial',
      weightLbs: newBooking.weightLbs || 38000,
      valueUsd: newBooking.valueUsd || 140000,
      mode: newBooking.mode || 'First Class',
      delayRiskLevel: newBooking.delayRiskLevel || 'MODERATE',
      delayRiskPercent: newBooking.delayRiskPercent || 35.0,
      demurrageRisk: newBooking.demurrageRisk || 65.0,
      carrierName: newBooking.carrierName || 'Expedited Regional Express',
      circuitFile: newBooking.circuitFile || 'qpiai_circuit_1793224539.qasm',
      netSavings: newBooking.netSavings || 38.0,
      status: newBooking.status || 'CONFIRMED',
      eta: newBooking.eta || '08h 15m',
      notes: newBooking.notes || 'Commercial consignment booked with 70% payment policy evaluation.',
      totalInvoiceInr: newBooking.totalInvoiceInr || 155000,
      amountPaidInr: newBooking.amountPaidInr || 0,
      paymentStatus: newBooking.paymentStatus || 'UNPAID',
      isDispatchHeldForPayment: newBooking.isDispatchHeldForPayment || false,
      transportDelayHours: newBooking.transportDelayHours || 0,
      paymentDueDate: newBooking.paymentDueDate || '2026-11-05',
      paymentMethod: newBooking.paymentMethod || 'Direct Gateway'
    };

    setConsignments((prev) => [fullBooking, ...prev]);

    if (fullBooking.isDispatchHeldForPayment) {
      showToast(`Booking ${bookingId} created! Status: DELAYED — Held until 70% payment is cleared.`);
    } else {
      showToast(`Booking ${bookingId} confirmed! 70% threshold satisfied. Dispatched on schedule.`);
    }

    addDevLog('INFO', `New commercial booking ${bookingId} created. Amount: ₹${fullBooking.totalInvoiceInr.toLocaleString('en-IN')}`);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden selection:bg-[#34D399]/30 selection:text-[#08193A]">
      {/* Dynamic Animated Liquid Glass Gradients Background */}
      <LiquidBackground />

      {/* Main Workspace Frame */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-5 md:p-6 flex flex-col gap-4 relative z-10">
        {/* Top Ambient Live Ticker inside workspace container */}
        <LiveEventTicker 
          waypoints={waypoints} 
          onTriggerWeatherRefresh={handleForceWeatherRefresh}
        />

        <div className="flex-1 flex flex-col md:flex-row gap-5 items-start">
          {/* Left Sticky Glass Sidebar with Feature Selection */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            bookingCount={consignments.length}
            heldPaymentCount={heldPaymentCount}
            userRole={userRole}
            userName={userName}
            userEmail={userEmail}
            onTriggerPilotPrompt={(prompt) => {
              setPilotPrompt(prompt);
              setActiveTab('qpiai-pilot');
            }}
            onSignOut={onSignOut}
          />

          {/* Center / Right Dynamic Content Pane */}
          <main 
            className="flex-1 min-w-0 w-full glass-panel rounded-[32px] p-4 sm:p-6 md:p-8 flex flex-col shadow-[0_20px_60px_rgba(8,25,58,0.06)] relative overflow-visible"
            aria-live="polite"
          >
          {/* Top Identity & Role Indicator Banner */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#08193A]/5">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isAdmin ? 'bg-[#1B3A7A]' : 'bg-[#34D399]'} animate-pulse`} />
              <span className="text-xs font-bold uppercase tracking-wider text-[#08193A]">
                {isAdmin ? 'Admin Master Intelligence Workspace (Full Access)' : 'Customer Business Workspace (Authorized Mode)'}
              </span>
            </div>
            {heldPaymentCount > 0 && (
              <button
                onClick={() => setActiveTab('payments')}
                className="px-3 py-1 rounded-full text-xs font-bold bg-[#F26D6D]/15 text-[#DC2626] border border-[#F26D6D]/30 flex items-center gap-1.5 hover:bg-[#F26D6D]/25 transition-all cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                {heldPaymentCount} Cargo{heldPaymentCount === 1 ? '' : 'es'} Held (&lt;70% Advance)
              </button>
            )}
          </div>

          <div className="min-w-0">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 w-64 bg-black/5 rounded-2xl" />
                <div className="h-32 w-full bg-black/5 rounded-3xl" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="h-28 bg-black/5 rounded-3xl" />
                  <div className="h-28 bg-black/5 rounded-3xl" />
                  <div className="h-28 bg-black/5 rounded-3xl" />
                  <div className="h-28 bg-black/5 rounded-3xl" />
                </div>
              </div>
            ) : (
              <>
                {/* 1. CARGO BOOKINGS VIEW (Customer & Admin) */}
                {activeTab === 'cargo-bookings' && (
                  <CargoBookingsView
                    consignments={consignments}
                    onSelectConsignment={(c) => setSelectedConsignment(c)}
                    onOpenNewBookingModal={() => setNewBookingModalOpen(true)}
                    onForceWeatherRefresh={handleForceWeatherRefresh}
                    isWeatherRefreshing={isWeatherRefreshing}
                    onRerunRisk={handleRerunRisk}
                    onReassignCarrier={handleReassignCarrier}
                  />
                )}

                {/* 2. PAYMENTS & INVOICES VIEW (Customer & Admin with 70% rule) */}
                {activeTab === 'payments' && (
                  <PaymentsView
                    consignments={consignments}
                    userRole={userRole}
                    onUpdatePayment={handleUpdatePayment}
                    onShowToast={showToast}
                    onSelectConsignment={(c) => setSelectedConsignment(c)}
                  />
                )}

                {/* 3. CORRIDOR & SIMULATION (Admin Only) */}
                {isAdmin && activeTab === 'corridor-simulation' && (
                  <CorridorSimulationView
                    waypoints={waypoints}
                    units={units}
                    backhauls={backhauls}
                    exceptions={exceptions}
                    onForceWeatherRefresh={handleForceWeatherRefresh}
                    isWeatherRefreshing={isWeatherRefreshing}
                    onPairBackhaul={handlePairBackhaul}
                    onResolveException={handleResolveException}
                    onAddException={handleAddException}
                    onOpenDriverChat={handleOpenDriverChat}
                  />
                )}

                {/* 4. XGBOOST ML MODEL (Admin Only) */}
                {isAdmin && activeTab === 'xgboost-ml' && <XGBoostModelView />}

                {/* 5. QPIAI QUANTUM QUBO (Admin Only) */}
                {isAdmin && activeTab === 'qpiai-quantum' && (
                  <QpiAIQuantumView onShowToast={showToast} />
                )}

                {/* 6. QPIAI PILOT AI (Customer & Admin) */}
                {activeTab === 'qpiai-pilot' && (
                  <QpiAiPilotView
                    initialPrompt={pilotPrompt}
                    onClearInitialPrompt={() => setPilotPrompt(undefined)}
                  />
                )}
              </>
            )}
          </div>
        </main>
        </div>
      </div>

      {/* Floating Dev Console Button & Slide-Out Panel (Admin Only) */}
      {isAdmin && (
        <DevConsole
          logs={devLogs}
          onClearLogs={() => setDevLogs([])}
          onSendMockPing={() => {
            addDevLog('WS', 'Dispatcher sent manual WebSocket heartbeat: ACK 200 OK');
            showToast('WebSocket Heartbeat ACK received (3.1ms)');
          }}
        />
      )}

      {/* Slide-In Master-Detail Drawer for Selected Consignment */}
      <ConsignmentDetailDrawer
        consignment={selectedConsignment}
        onClose={() => setSelectedConsignment(null)}
        onRerunRisk={handleRerunRisk}
        onReassignCarrier={handleReassignCarrier}
      />

      {/* Modal for + New Commercial Cargo Booking */}
      <NewBookingModal
        isOpen={newBookingModalOpen}
        onClose={() => setNewBookingModalOpen(false)}
        onSubmit={handleNewBookingSubmit}
      />

      {/* Floating Glass Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full glass-panel shadow-[0_12px_36px_rgba(8,25,58,0.18)] border border-white/90 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          <span className="text-xs font-bold text-[#08193A] tracking-tight">
            {toastMessage}
          </span>
        </div>
      )}
    </div>
  );
}

export default UnifiedIntelligenceCockpit;
