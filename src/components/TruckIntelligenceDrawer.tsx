import React, { useState, useEffect } from 'react';
import { 
  X, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  Gauge, 
  Fuel, 
  Thermometer, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  MessageSquare, 
  BellRing, 
  FileText, 
  MapPin, 
  Sliders, 
  Radio, 
  Truck, 
  Layers, 
  Download,
  AlertCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import { TelemetryUnit } from '../types';
import { AdminBadge } from './AdminBadge';

interface TruckIntelligenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  unit: TelemetryUnit | null;
  onCallDriver?: (name?: string, phone?: string) => void;
  onChatDriver?: (unit?: string) => void;
  onTriggerToast?: (msg: string) => void;
}

type DrawerTab = 
  | 'telemetry' 
  | 'health' 
  | 'cargo' 
  | 'driver' 
  | 'route' 
  | 'risk' 
  | 'audit';

export const TruckIntelligenceDrawer: React.FC<TruckIntelligenceDrawerProps> = ({
  isOpen,
  onClose,
  unit,
  onCallDriver,
  onChatDriver,
  onTriggerToast
}) => {
  if (!isOpen || !unit) return null;

  const [activeTab, setActiveTab] = useState<DrawerTab>('telemetry');
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);
  const [overrideSpeedInput, setOverrideSpeedInput] = useState('75');

  // Live countdown timer for ETA
  const [countdown, setCountdown] = useState(24);
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 59));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live telemetry dynamic values with micro-fluctuations
  const [liveSpeed, setLiveSpeed] = useState(unit.speedKmh);
  const [liveRpm, setLiveRpm] = useState(1340);
  const [liveOilPsi, setLiveOilPsi] = useState(48.2);
  const [liveCoolantC, setLiveCoolantC] = useState(84.5);
  const [flashParam, setFlashParam] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const speedDelta = Math.floor((Math.random() - 0.5) * 3);
      const newSpd = Math.max(45, Math.min(85, unit.speedKmh + speedDelta));
      setLiveSpeed(newSpd);
      setLiveRpm(Math.round(1280 + newSpd * 1.8));
      setLiveOilPsi(parseFloat((47.5 + Math.random() * 1.8).toFixed(1)));
      setLiveCoolantC(parseFloat((84.0 + Math.random() * 1.2).toFixed(1)));
      
      setFlashParam('speed');
      setTimeout(() => setFlashParam(null), 800);
    }, 3200);
    return () => clearInterval(interval);
  }, [unit.speedKmh]);

  const handleAlertDriver = () => {
    if (onTriggerToast) {
      onTriggerToast(`High-priority audio chime transmitted to cab of ${unit.unitNumber}`);
    }
  };

  const handleConfirmOverride = () => {
    setShowOverrideConfirm(false);
    if (onTriggerToast) {
      onTriggerToast(`Governor speed cap overridden to ${overrideSpeedInput} km/h for ${unit.unitNumber}`);
    }
  };

  const handleExportReport = () => {
    const reportText = `
========================================================================
            FREIGHTIQ ENTERPRISE TRUCK INTELLIGENCE REPORT
========================================================================
UNIT IDENTIFIER:    ${unit.unitNumber} (${unit.plateNumber || 'MH-12-FK-9901'})
TIMESTAMP:          ${new Date().toISOString()}
OPERATIONAL STATUS: ${unit.status}
CURRENT SPEED:      ${liveSpeed} km/h
EFFICIENCY:         ${unit.efficiencyKmL} km/L
ACTIVE CORRIDOR:    ${unit.route}
GROSS WEIGHT:       ${unit.weightKg.toLocaleString()} KG
CAPACITY UTILIZED:  ${unit.capacityPercent}%

DIAGNOSTIC MATRIX:
- Engine RPM:       ${liveRpm} RPM
- Coolant Temp:     ${liveCoolantC} °C
- Oil Pressure:     ${liveOilPsi} PSI
- DEF Fluid Level:  88%
- CAN-bus Status:   No Critical DTCs Active
- Telemetry Ping:   18 ms (L-Band Satellite Link)

DRIVER PROFILE:
- Operator Name:    Vikram Malhotra (ID: DVR-4021)
- License Class:    Class-A Heavy HazMat
- Current HOS:      5.4 hrs driven / 2.6 hrs remaining
- Driver Alertness: 94% (Facial Biometric Monitor Active)
========================================================================
`.trim();

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report_${unit.unitNumber.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Slide-over panel (about 70% width on desktop, full width on mobile) */}
      <div className="w-full lg:w-[72%] xl:w-[68%] h-full glass-panel-dark text-white flex flex-col justify-between shadow-[0_24px_80px_rgba(8,25,58,0.7)] border-l border-white/20 animate-in slide-in-from-right duration-300 overflow-hidden">
        
        {/* TOP FIXED BAR: Unit Plate, Status, Actions, Close */}
        <div className="p-5 md:p-6 pb-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#08193A]/80 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono font-extrabold text-2xl text-white tracking-tight">
              {unit.unitNumber}
            </span>
            <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white/10 text-white/80 border border-white/15">
              {unit.plateNumber || 'MH-12-FK-9901'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#34D399]/20 text-[#A7F3D0] border border-[#34D399]/40 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-ping" />
              <span>{unit.status}</span>
            </span>
            <span className="text-xs font-mono text-[#A7F3D0] px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
              ETA: {unit.eta.slice(0, 5)}:{String(countdown).padStart(2, '0')}
            </span>
            <AdminBadge label="ADMIN TRUCK INTELLIGENCE" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onCallDriver && onCallDriver('Vikram Malhotra', '+91 98200 44192')}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all liquid-btn flex items-center gap-1.5 cursor-pointer"
              title="Call Driver via VoIP Bridge"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#34D399]" />
              <span className="hidden sm:inline">Call Driver</span>
            </button>

            <button
              onClick={() => onChatDriver && onChatDriver(unit.unitNumber)}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all liquid-btn flex items-center gap-1.5 cursor-pointer"
              title="Chat with Driver"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#6EE7B7]" />
              <span className="hidden sm:inline">Chat</span>
            </button>

            <button
              onClick={handleAlertDriver}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all liquid-btn flex items-center gap-1.5 cursor-pointer"
              title="Broadcast Cab Alert Chime"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-400" />
              <span>Alert Driver</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer ml-1"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* HERO TRUCK VISUAL STAGE */}
        <div className="px-5 md:px-6 pt-3 pb-2 bg-gradient-to-b from-[#08193A]/90 to-transparent shrink-0">
          <div className="relative w-full rounded-2xl p-3 bg-gradient-to-b from-[#F4FAF8] to-white border border-white/30 shadow-inner flex items-center justify-center overflow-hidden aspect-[16/6] max-h-[160px]">
            <img
              src="/assets/aistudio/upscalemedia-transformed_b5694985.jpeg"
              alt="Unit Rig"
              className="w-full h-full object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
            
            {/* Telemetry panel overlay on trailer */}
            <div className="absolute right-[14%] top-[18%] bottom-[24%] w-[48%] rounded-xl bg-[#08193A]/88 backdrop-blur-md border border-white/20 p-2.5 flex items-center justify-around text-white shadow-lg pointer-events-none">
              <div className="text-center">
                <span className="text-[9px] text-white/60 uppercase font-mono block">Speed</span>
                <span className="font-mono text-sm font-bold text-[#34D399]">{liveSpeed} km/h</span>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div className="text-center">
                <span className="text-[9px] text-white/60 uppercase font-mono block">Weight</span>
                <span className="font-mono text-sm font-bold text-white">38,500 KG</span>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div className="text-center">
                <span className="text-[9px] text-white/60 uppercase font-mono block">Capacity</span>
                <span className="font-mono text-sm font-bold text-[#A7F3D0]">78% Full</span>
              </div>
            </div>

            <div className="absolute bottom-1.5 left-3 text-[10px] font-mono text-[#08193A] font-bold bg-white/80 px-2 py-0.5 rounded-md">
              NH-48 Dedicated Freight Corridor • L-Band Sat-Connected
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION BAR (7 Tabs) */}
        <div className="px-5 md:px-6 border-b border-white/10 overflow-x-auto flex items-center gap-1.5 shrink-0 bg-[#08193A]/60">
          {[
            { id: 'telemetry', label: 'Live Telemetry' },
            { id: 'health', label: 'Vehicle Health & CAN' },
            { id: 'cargo', label: 'Cargo & Load' },
            { id: 'driver', label: 'Driver & HOS' },
            { id: 'route', label: 'Route & Weather' },
            { id: 'risk', label: 'Risk & Cost ML' },
            { id: 'audit', label: 'Docs & Audit Log' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DrawerTab)}
                className={`px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-[#34D399] text-[#A7F3D0] font-bold'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT VIEWPORT */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
          
          {/* TAB 1: LIVE TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-2xl bg-white/5 border border-white/10 transition-colors ${flashParam === 'speed' ? 'ring-2 ring-[#34D399]' : ''}`}>
                  <span className="text-[10px] uppercase font-mono text-white/60 block">Speed & Governor</span>
                  <p className="font-mono text-2xl font-bold text-[#34D399] mt-1">{liveSpeed} km/h</p>
                  <span className="text-[10px] text-white/50">Cap: 70 km/h (Active)</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-mono text-white/60 block">Engine RPM</span>
                  <p className="font-mono text-2xl font-bold text-white mt-1">{liveRpm} RPM</p>
                  <span className="text-[10px] text-[#A7F3D0]">Sweet-spot 1,300 RPM</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-mono text-white/60 block">Coolant Temp</span>
                  <p className="font-mono text-2xl font-bold text-white mt-1">{liveCoolantC} °C</p>
                  <span className="text-[10px] text-[#34D399]">Normal (Nominal: 85°C)</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-mono text-white/60 block">Oil Pressure</span>
                  <p className="font-mono text-2xl font-bold text-white mt-1">{liveOilPsi} PSI</p>
                  <span className="text-[10px] text-white/50">Min: 35 PSI</span>
                </div>
              </div>

              {/* Sparklines & Secondary Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/70 font-semibold">Live Speed Velocity Trend (Last 30 mins)</span>
                    <span className="font-mono text-[#34D399]">{liveSpeed} km/h</span>
                  </div>
                  {/* SVG Sparkline */}
                  <div className="w-full h-16 flex items-center">
                    <svg className="w-full h-full" viewBox="0 0 300 60" fill="none">
                      <path
                        d="M 0 35 Q 40 20, 80 30 T 160 25 T 220 18 T 270 28 L 300 22"
                        stroke="#34D399"
                        strokeWidth="2.5"
                        fill="none"
                      />
                      <circle cx="300" cy="22" r="4" fill="#34D399" />
                    </svg>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/70 font-semibold">Instantaneous Fuel Consumption</span>
                    <span className="font-mono text-[#6EE7B7]">{unit.efficiencyKmL} km/L</span>
                  </div>
                  {/* SVG Sparkline */}
                  <div className="w-full h-16 flex items-center">
                    <svg className="w-full h-full" viewBox="0 0 300 60" fill="none">
                      <path
                        d="M 0 45 Q 50 30, 100 40 T 180 32 T 250 40 L 300 35"
                        stroke="#6EE7B7"
                        strokeWidth="2.5"
                        fill="none"
                      />
                      <circle cx="300" cy="35" r="4" fill="#6EE7B7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Full Specs List */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 block font-mono">Fuel Level & Range</span>
                  <p className="font-bold text-white mt-0.5">74% (1,776 KM range)</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 block font-mono">DEF Fluid Level</span>
                  <p className="font-bold text-white mt-0.5">88% (Adequate)</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 block font-mono">Battery Alternator</span>
                  <p className="font-bold text-white mt-0.5">27.6 V (Charging)</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 block font-mono">Total Odometer</span>
                  <p className="font-bold font-mono text-white mt-0.5">142,850 KM</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 block font-mono">Ignition State</span>
                  <p className="font-bold text-[#34D399] mt-0.5">RUNNING / HIGHWAY</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 block font-mono">Idle Time Today</span>
                  <p className="font-bold text-white mt-0.5">42 Minutes</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 block font-mono">Harsh Brake Events</span>
                  <p className="font-bold text-[#34D399] mt-0.5">0 Events</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 block font-mono">Over-Speed Events</span>
                  <p className="font-bold text-[#34D399] mt-0.5">0 Events (Compliant)</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VEHICLE HEALTH & 10-WHEEL TIRE DIAGRAM */}
          {activeTab === 'health' && (
            <div className="space-y-5">
              {/* CAN-bus Diagnostic Fault Codes (DTC) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#A7F3D0] flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#34D399]" />
                    <span>CAN-Bus Fault Codes (DTC Status)</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#34D399]">
                    100% HEALTHY
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-[#34D399]">DTC P0299</span>
                      <span className="text-white/70 ml-2">Turbocharger Underboost Condition (Historic - Cleared)</span>
                    </div>
                    <span className="text-[10px] font-mono text-white/50">RESOLVED (12h ago)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-white/80">DTC U0100</span>
                      <span className="text-white/70 ml-2">Lost Communication With ECM/PCM (Transient Ping)</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#34D399]">CLEARED</span>
                  </div>
                </div>
              </div>

              {/* 10-Wheel Tire Pressure & Temperature Diagram */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#A7F3D0]">
                    10-Wheel Tire Pressure (TPMS) & Brake Pad Temperatures
                  </h4>
                  <span className="text-[11px] font-mono text-white/60">Target: 110 PSI</span>
                </div>

                {/* Interactive Truck Chassis Diagram with 10 Wheels */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 text-xs font-mono">
                  {/* Steer Axle */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-[#34D399]/40 text-center">
                    <span className="text-[9px] text-[#A7F3D0] block">Steer Left</span>
                    <p className="font-bold text-[#34D399]">110 PSI</p>
                    <span className="text-[10px] text-white/60">32°C • Pad 120°</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-[#34D399]/40 text-center">
                    <span className="text-[9px] text-[#A7F3D0] block">Steer Right</span>
                    <p className="font-bold text-[#34D399]">112 PSI</p>
                    <span className="text-[10px] text-white/60">33°C • Pad 122°</span>
                  </div>
                  {/* Drive Axles (Duals) */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-[#34D399]/40 text-center">
                    <span className="text-[9px] text-[#A7F3D0] block">Drive Axle 1</span>
                    <p className="font-bold text-[#34D399]">109 PSI</p>
                    <span className="text-[10px] text-white/60">35°C • Pad 135°</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-[#34D399]/40 text-center">
                    <span className="text-[9px] text-[#A7F3D0] block">Drive Axle 2</span>
                    <p className="font-bold text-[#34D399]">111 PSI</p>
                    <span className="text-[10px] text-white/60">34°C • Pad 130°</span>
                  </div>
                  {/* Trailer Axles (Duals) */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-[#34D399]/40 text-center">
                    <span className="text-[9px] text-[#A7F3D0] block">Trailer Duals</span>
                    <p className="font-bold text-[#34D399]">108 PSI</p>
                    <span className="text-[10px] text-white/60">31°C • Pad 118°</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 text-[11px] text-white/70 border-t border-white/10">
                  <span>Next Routine Depot Inspection: <strong>In 4,250 KM</strong></span>
                  <span className="text-[#34D399]">Calculated Failure Probability: &lt; 0.4%</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CARGO & LOAD */}
          {activeTab === 'cargo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-mono text-white/60 block">Gross Weight</span>
                  <p className="font-mono text-xl font-bold text-white mt-1">38,500 KG</p>
                  <span className="text-[10px] text-white/50">Legal Limit: 49,000 KG</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-mono text-white/60 block">Cargo Temp (Cold-Chain)</span>
                  <p className="font-mono text-xl font-bold text-[#34D399] mt-1">4.2 °C (Locked)</p>
                  <span className="text-[10px] text-[#A7F3D0]">Humidity: 58% RH</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-mono text-white/60 block">Chassis Door Seal</span>
                  <p className="font-bold text-[#34D399] mt-1">LOCKED #SL-9921</p>
                  <span className="text-[10px] text-white/50">Tamper-Proof NFC Active</span>
                </div>
              </div>

              {/* Axle Load Distribution */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A7F3D0]">
                  Per-Axle Weight Scale Distribution:
                </h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-white/60">Steer Axle (Max 6,000 kg):</span>
                    <span className="font-bold text-white">5,400 KG (90%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-[#34D399] rounded-full" style={{ width: '90%' }} />
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="text-white/60">Drive Tandem Axles (Max 19,000 kg):</span>
                    <span className="font-bold text-white">16,800 KG (88%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-[#34D399] rounded-full" style={{ width: '88%' }} />
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="text-white/60">Trailer Tandem Axles (Max 24,000 kg):</span>
                    <span className="font-bold text-white">16,300 KG (68%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-[#34D399] rounded-full" style={{ width: '68%' }} />
                  </div>
                </div>
              </div>

              {/* Manifest IDs */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-[#A7F3D0]">
                  Active Manifest IDs Loaded on Trailer:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
                  {unit.activeShipments.map((shp) => (
                    <div key={shp} className="p-2 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                      <span className="font-bold text-white">{shp}</span>
                      <span className="text-[10px] text-[#34D399]">VERIFIED</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DRIVER & HOS */}
          {activeTab === 'driver' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#08193A] border border-white/20 flex items-center justify-center font-bold text-base text-[#34D399]">
                    VM
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">Vikram Malhotra</h4>
                    <p className="text-xs text-white/70">Master Heavy Transport Operator (12 yrs exp)</p>
                    <p className="text-[10px] font-mono text-[#A7F3D0]">CDL-A HazMat Certified • +91 98200 44192</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/50 block font-mono">Trip Safety Score</span>
                  <span className="font-mono text-2xl font-bold text-[#34D399]">98 / 100</span>
                </div>
              </div>

              {/* Hours of Service (HOS) Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 font-mono block">Driving Hours Today</span>
                  <p className="font-mono text-lg font-bold text-white mt-0.5">5.4 Hours</p>
                  <span className="text-[10px] text-white/60">Started: 06:00 IST</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 font-mono block">Driving Time Remaining</span>
                  <p className="font-mono text-lg font-bold text-[#34D399] mt-0.5">2.6 Hours</p>
                  <span className="text-[10px] text-white/60">Max 8.0h shift limit</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 font-mono block">Next Mandatory Rest Break</span>
                  <p className="font-mono text-lg font-bold text-amber-300 mt-0.5">In 1h 36m</p>
                  <span className="text-[10px] text-white/60">Designated Stop: Chakan Hub</span>
                </div>
              </div>

              {/* Driver Alertness Biometric Monitor */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white">In-Cab Facial Biometric Fatigue Monitor</h4>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    Infrared pupil dilation & head angle tracking via cab camera gateway.
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-[#34D399]/20 text-[#34D399] font-mono font-bold text-xs border border-[#34D399]/40">
                  94% ALERT
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ROUTE & WEATHER */}
          {activeTab === 'route' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#A7F3D0]">
                    Corridor Notice & Autonomous Governor
                  </span>
                  <span className="text-[10px] font-mono text-[#34D399]">GOVERNOR ACTIVE</span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  {unit.routingNote}
                </p>
              </div>

              {/* Waypoint Stepper */}
              <div className="space-y-3 pt-1">
                {[
                  { name: 'Bengaluru Logistics Park', km: 'KM 0', weather: '19.3°C • Clear Sky', status: 'COMPLETED' },
                  { name: 'Hubballi NH-48 Checkpoint', km: 'KM 410', weather: '22.2°C • Clear Sky', status: 'COMPLETED' },
                  { name: 'Pune Chakan Industrial Hub', km: 'KM 840', weather: '30.8°C • Light Drizzle', status: 'ACTIVE' },
                  { name: 'Khandala Ghat Mountain Pass', km: 'KM 910', weather: '27.0°C • High Wind (26.3 km/h)', status: 'PENDING' },
                  { name: 'Mumbai JNPT Port Terminal', km: 'KM 980', weather: '30.7°C • Clear Sky', status: 'PENDING' }
                ].map((wp, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${wp.status === 'COMPLETED' ? 'bg-[#34D399]' : wp.status === 'ACTIVE' ? 'bg-[#34D399] animate-ping' : 'bg-white/30'}`} />
                      <div>
                        <span className="font-bold text-white">{wp.name}</span>
                        <span className="text-[10px] font-mono text-white/50 ml-2">({wp.km})</span>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-[#A7F3D0]">{wp.weather}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: RISK & COST ML */}
          {activeTab === 'risk' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 font-mono block">XGBoost Delay Risk</span>
                  <p className="font-mono text-2xl font-bold text-[#34D399] mt-1">14.2%</p>
                  <span className="text-[10px] text-[#34D399]">LOW RISK CATEGORY</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 font-mono block">Demurrage Risk</span>
                  <p className="font-mono text-2xl font-bold text-white mt-1">₹0.00</p>
                  <span className="text-[10px] text-[#34D399]">100% SLA Protected</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 font-mono block">Operating Cost / KM</span>
                  <p className="font-mono text-2xl font-bold text-white mt-1">₹159.00</p>
                  <span className="text-[10px] text-white/50">Base: ₹181.40/km</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 font-mono block">Net Gross Margin</span>
                  <p className="font-mono text-2xl font-bold text-[#34D399] mt-1">28.4%</p>
                  <span className="text-[10px] text-white/50">Target: 25.0%</span>
                </div>
              </div>

              {/* Exception Control Tower Telemetry: Open Blockers & Avoidable Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/50 font-mono block uppercase">Open Blockers</span>
                    <p className="font-mono text-xl font-bold text-white mt-0.5">0 Active Blockers</p>
                    <span className="text-[10px] text-[#34D399]">Clearance verified across manifests</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#34D399]/20 text-[#34D399] flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-[#34D399]/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#A7F3D0] font-mono block uppercase">Avoidable Cost</span>
                    <p className="font-mono text-xl font-bold text-[#34D399] mt-0.5">₹14,000</p>
                    <span className="text-[10px] text-white/60">Demurrage SLA guard active</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#34D399]/20 text-[#34D399] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* QpiAI QUBO State */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-[#A7F3D0] uppercase">QpiAI Quantum QUBO Allocation Circuit:</span>
                  <span className="font-mono text-[#34D399]">|0110⟩ Converged</span>
                </div>
                <p className="text-white/70 leading-relaxed text-[11px]">
                  Hamiltonian ground-state carrier solution locks Expedited Regional Express with a net simulated savings of <strong>₹34,800 INR</strong> across NH-48 toll corridors.
                </p>
              </div>
            </div>
          )}

          {/* TAB 7: DOCUMENTS & AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">e-Way Bill EWB-88192004-KA</span>
                    <span className="text-[10px] text-white/50 font-mono">Issued by GSTN • Valid till 31 Oct</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#34D399]">VERIFIED</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">ICEGATE Customs Pre-Clearance</span>
                    <span className="text-[10px] text-white/50 font-mono">Gate 3 RFID Fast-Track Pass</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#34D399]">CLEARED</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[#A7F3D0]">
                  Unit Action Audit Timeline:
                </h4>
                <div className="space-y-2 font-mono text-[11px] text-white/75 divide-y divide-white/5">
                  <div className="pt-1.5 flex justify-between">
                    <span>11:15 IST • Telemetry handshake verified (Ping: 18ms)</span>
                    <span className="text-white/40">SYSTEM</span>
                  </div>
                  <div className="pt-1.5 flex justify-between">
                    <span>09:40 IST • Chakan corridor toll auto-debited (FastTag)</span>
                    <span className="text-white/40">GATEWAY</span>
                  </div>
                  <div className="pt-1.5 flex justify-between">
                    <span>08:12 IST • Speed governor override requested by Dispatcher</span>
                    <span className="text-[#34D399]">ADMIN: Admin Command</span>
                  </div>
                  <div className="pt-1.5 flex justify-between">
                    <span>06:00 IST • Pre-trip digital vehicle inspection cleared</span>
                    <span className="text-white/40">DRIVER: V. Malhotra</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM FIXED ADMIN ACTION BAR */}
        <div className="p-4 md:p-5 border-t border-white/10 bg-[#08193A]/90 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onTriggerToast && onTriggerToast(`AI dynamic reroute corridor authorized for ${unit.unitNumber}`)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all liquid-btn cursor-pointer"
            >
              Authorize AI Reroute
            </button>

            <button
              onClick={() => setShowOverrideConfirm(true)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all liquid-btn cursor-pointer"
            >
              Override Governor Speed
            </button>

            <button
              onClick={() => onTriggerToast && onTriggerToast(`Backup rig standby dispatched from Pune Depot for ${unit.unitNumber}`)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all liquid-btn cursor-pointer"
            >
              Dispatch Backup Truck
            </button>
          </div>

          <button
            onClick={handleExportReport}
            className="px-5 py-2 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5 text-[#08193A]" />
            <span>Export Unit Report</span>
          </button>
        </div>

      </div>

      {/* CONFIRM DIALOG FOR GOVERNOR SPEED OVERRIDE */}
      {showOverrideConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel-dark text-white rounded-[28px] p-6 shadow-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-extrabold text-base">Confirm Governor Speed Override</h3>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Adjusting the autonomous speed governor for <strong>{unit.unitNumber}</strong> overrides automated safety algorithms. Ensure corridor road conditions permit higher limits.
            </p>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-white/70">New Speed Cap (km/h):</label>
              <input
                type="number"
                min="50"
                max="90"
                value={overrideSpeedInput}
                onChange={(e) => setOverrideSpeedInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#34D399]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowOverrideConfirm(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-white/70 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOverride}
                className="px-5 py-2 rounded-full text-xs font-bold bg-amber-500 text-[#08193A] hover:bg-amber-400 cursor-pointer shadow-md"
              >
                Confirm Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
