import React, { useState, useEffect } from 'react';
import { NavTab, Consignment, WaypointWeather, TelemetryUnit, BackhaulPairing, FreightException, DevLogMessage } from './types';
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
import { CheckCircle2, Sparkles, Bell } from 'lucide-react';

export default function App() {
  // Skeleton Loading on First Load (~600ms)
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('cargo-bookings');

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

  // PART 2: LIVE DATA ENGINE (simulated WebSocket tick every 2–4s)
  // Pauses when tab is hidden to save battery & CPU
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
          const newWind = parseFloat(Math.max(10, Math.min(60, wp.windKmh + deltaWind)).toFixed(1));
          const deltaTemp = (Math.random() - 0.5) * 0.3;
          const newTemp = parseFloat((wp.tempC + deltaTemp).toFixed(1));
          return {
            ...wp,
            windKmh: newWind,
            tempC: newTemp
          };
        })
      );

      // 3. Micro update on random consignment risk %
      setConsignments((prev) => {
        const randIdx = Math.floor(Math.random() * prev.length);
        return prev.map((c, i) => {
          if (i === randIdx) {
            const delta = (Math.random() - 0.5) * 0.5;
            const newRisk = Math.min(99.9, Math.max(10.0, c.delayRiskPercent + delta));
            return {
              ...c,
              delayRiskPercent: parseFloat(newRisk.toFixed(1))
            };
          }
          return c;
        });
      });

      // 4. Log telemetry tick
      addDevLog('WS', `Telemetry heartbeat: Waypoint & fleet state re-synced (Ping: ${Math.floor(2 + Math.random() * 4)}ms)`);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  // Force Weather Refresh Handler
  const handleForceWeatherRefresh = () => {
    setIsWeatherRefreshing(true);
    addDevLog('WEATHER', 'Triggered manual Open-Meteo REST API re-sampling for NH-48 corridor');
    setTimeout(() => {
      setWaypoints((prev) =>
        prev.map((wp) => ({
          ...wp,
          windKmh: parseFloat((wp.windKmh + (Math.random() - 0.5) * 2).toFixed(1)),
          tempC: parseFloat((wp.tempC + (Math.random() - 0.5) * 0.6).toFixed(1))
        }))
      );
      setIsWeatherRefreshing(false);
      showToast('Open-Meteo: 5/5 waypoints successfully updated');
      addDevLog('WEATHER', 'Open-Meteo batch response received: 200 OK across 5 geocoded points');
    }, 750);
  };

  // Backhaul Pairing Handler
  const handlePairBackhaul = (id: string) => {
    setBackhauls((prev) =>
      prev.map((bh) => (bh.id === id ? { ...bh, paired: true } : bh))
    );
    const item = backhauls.find((b) => b.id === id);
    showToast(`✓ Backhaul Paired: +₹${item?.netInr.toLocaleString('en-IN')} net savings generated!`);
    addDevLog('INFO', `Backhaul matching engine paired cargo for ${item?.route}`);
  };

  // Resolve Exception Handler
  const handleResolveException = (id: string) => {
    setExceptions((prev) =>
      prev.map((exc) => (exc.id === id ? { ...exc, resolved: true } : exc))
    );
    const exc = exceptions.find((e) => e.id === id);
    showToast(`✓ Exception resolved for ${exc?.unit}: AI Bypass route cleared`);
    addDevLog('ML', `Algorithmic exception bypass executed for ${exc?.unit} (saved ₹${exc?.penaltyInr})`);
  };

  // Add Exception Handler
  const handleAddException = (newExc: FreightException) => {
    setExceptions((prev) => [newExc, ...prev]);
    showToast(`New freight exception logged for ${newExc.unit}`);
    addDevLog('INFO', `New exception registered: ${newExc.title} at ${newExc.location}`);
  };

  // Consignment Action Handlers
  const handleRerunRisk = (id: string) => {
    setConsignments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updatedRisk = parseFloat(Math.min(99.8, Math.max(14.0, c.delayRiskPercent + (Math.random() - 0.5) * 5)).toFixed(1));
          return {
            ...c,
            delayRiskPercent: updatedRisk,
            delayRiskLevel: updatedRisk > 75 ? 'CRITICAL' : updatedRisk > 45 ? 'HIGH' : updatedRisk > 25 ? 'MODERATE' : 'LOW'
          };
        }
        return c;
      })
    );
    showToast(`XGBoost re-evaluated delay probability for ${id}`);
    addDevLog('ML', `Re-evaluated gradient boosted trees for manifest ${id}`);
  };

  const handleReassignCarrier = (id: string) => {
    const carriers = ['Dedicated Priority Air Cargo', 'Expedited Regional Express', 'Ground Priority Freight'];
    setConsignments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextCarrier = carriers[(carriers.indexOf(c.carrierName) + 1) % carriers.length];
          return {
            ...c,
            carrierName: nextCarrier,
            netSavings: parseFloat((c.netSavings + 12.5).toFixed(2))
          };
        }
        return c;
      })
    );
    showToast(`QpiAI QUBO assigned optimal carrier for ${id}`);
    addDevLog('QUANTUM', `QpiAI-QSV circuit executed: carrier allocation updated for ${id}`);
  };

  // New Booking Handler
  const handleNewBookingSubmit = (newBooking: Partial<Consignment>) => {
    const fullBooking: Consignment = {
      id: `CRG-${Math.floor(25000 + Math.random() * 5000)}`,
      origin: newBooking.origin || 'Chicago Terminal Hub',
      destination: newBooking.destination || 'Dallas Intermodal Yard',
      department: newBooking.department || 'Industrial Goods',
      weightLbs: newBooking.weightLbs || 38000,
      valueUsd: newBooking.valueUsd || 140000,
      mode: newBooking.mode || 'First Class',
      delayRiskLevel: newBooking.delayRiskLevel || 'MODERATE',
      delayRiskPercent: newBooking.delayRiskPercent || 38.4,
      demurrageRisk: newBooking.demurrageRisk || 65.4,
      carrierName: newBooking.carrierName || 'Expedited Regional Express',
      circuitFile: newBooking.circuitFile || 'qpiai_circuit_1793229999.qasm',
      netSavings: newBooking.netSavings || 34.5,
      status: 'CONFIRMED',
      eta: newBooking.eta || '07h 45m',
      notes: newBooking.notes
    };

    setConsignments((prev) => [fullBooking, ...prev]);
    showToast(`Consignment ${fullBooking.id} confirmed and synced to Supabase`);
    addDevLog('INFO', `New commercial booking ${fullBooking.id} registered`);
  };

  // Open Driver Chat from Corridor hero card
  const handleOpenDriverChat = (unit: string) => {
    setActiveTab('qpiai-pilot');
    setPilotPrompt(`Query status and route telemetry for ${unit} along NH-48 corridor.`);
  };

  return (
    <div className="relative min-h-screen text-[#08193A] flex flex-col antialiased select-none font-sans">
      {/* Background with Ambient Drifting Blobs & Interactive Particle Canvas */}
      <LiquidBackground />

      {/* Primary Dashboard Two-Column Workspace */}
      <div className="flex flex-col md:flex-row flex-1 w-full min-h-screen relative z-10">
        {/* Floating Glass Sidebar (left 264px, inset 16px from frame edge, radius 28px) */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          bookingCount={consignments.length + 2} // reflects total active consignments (9)
          onTriggerPilotPrompt={(prompt) => {
            setActiveTab('qpiai-pilot');
            setPilotPrompt(prompt);
          }}
          onSignOut={() => showToast('Dispatcher session securely locked.')}
        />

        {/* Main Content Viewport: rigid flex-1 with min-w-0; never collapses or resizes during data ticks */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-[1600px] mx-auto space-y-6">
            {/* Skeleton Shimmer on first load (~600ms) */}
            {isLoading ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-10 w-2/3 rounded-2xl bg-white/50" />
                <div className="h-12 w-full rounded-full bg-white/40" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-32 rounded-[26px] bg-white/45" />
                  ))}
                </div>
                <div className="h-96 rounded-[28px] bg-white/40" />
              </div>
            ) : (
              <>
                {/* Live Event Ticker (cycles every 5s with "Updated Xs ago" timer) */}
                <LiveEventTicker onTriggerToast={showToast} />

                {/* Tab Views */}
                {activeTab === 'cargo-bookings' && (
                  <CargoBookingsView
                    consignments={consignments}
                    onSelectConsignment={setSelectedConsignment}
                    onOpenNewBookingModal={() => setNewBookingModalOpen(true)}
                    onForceWeatherRefresh={handleForceWeatherRefresh}
                    isWeatherRefreshing={isWeatherRefreshing}
                    onRerunRisk={handleRerunRisk}
                    onReassignCarrier={handleReassignCarrier}
                  />
                )}

                {activeTab === 'corridor-simulation' && (
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

                {activeTab === 'xgboost-ml' && <XGBoostModelView />}

                {activeTab === 'qpiai-quantum' && (
                  <QpiAIQuantumView onShowToast={showToast} />
                )}

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

      {/* Floating Dev Console Button & Slide-Out Panel */}
      <DevConsole
        logs={devLogs}
        onClearLogs={() => setDevLogs([])}
        onSendMockPing={() => {
          addDevLog('WS', 'Dispatcher sent manual WebSocket heartbeat: ACK 200 OK');
          showToast('WebSocket Heartbeat ACK received (3.1ms)');
        }}
      />

      {/* Slide-In Master-Detail Drawer for Selected Consignment */}
      <ConsignmentDetailDrawer
        consignment={selectedConsignment}
        onClose={() => setSelectedConsignment(null)}
        onRerunRisk={handleRerunRisk}
        onReassignCarrier={handleReassignCarrier}
      />

      {/* Modal for + New Cargo Booking */}
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
