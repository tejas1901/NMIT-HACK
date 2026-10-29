import React, { useState } from 'react';
import { 
  Radio, 
  MapPin, 
  Layers, 
  Navigation, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  BellRing, 
  CheckCircle2, 
  Sliders, 
  Sparkles, 
  Truck,
  Eye,
  EyeOff
} from 'lucide-react';
import { TelemetryUnit, RiskLevel } from '../types';
import { AdminBadge } from '../components/AdminBadge';

interface AdminFleetRadarViewProps {
  units: Record<string, TelemetryUnit>;
  onOpenTruckIntelligence: (unitNumber: string) => void;
  onOpenDriverCall: (driverName?: string, phone?: string) => void;
  onTriggerToast: (msg: string) => void;
}

export const AdminFleetRadarView: React.FC<AdminFleetRadarViewProps> = ({
  units,
  onOpenTruckIntelligence,
  onOpenDriverCall,
  onTriggerToast
}) => {
  const [selectedUnitKey, setSelectedUnitKey] = useState<string>('Unit #4021');

  // Toggleable Layer States
  const [layers, setLayers] = useState({
    weather: true,
    risk: true,
    traffic: true,
    geofences: true,
    customers: true
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const unitList = Object.values(units);
  const currentUnit = units[selectedUnitKey] || unitList[0];

  const getRiskColor = (risk?: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL': return '#F26D6D';
      case 'HIGH': return '#F59E5B';
      case 'MODERATE': return '#F6C65B';
      case 'LOW':
      default:
        return '#34D399';
    }
  };

  // Map coordinates relative positions for SVG
  const mapCoordinates: Record<string, { cx: number; cy: number }> = {
    'Unit #4021': { cx: 480, cy: 110 },
    'Unit #8809': { cx: 320, cy: 80 },
    'Unit #1052': { cx: 580, cy: 60 },
    'Unit #6120': { cx: 210, cy: 150 },
    'Unit #5088': { cx: 120, cy: 90 }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#08193A] text-[#A7F3D0] border border-[#34D399]/40 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-[#34D399] animate-pulse" />
              <span>FLEET GPS RADAR • MULTI-UNIT</span>
            </span>
            <AdminBadge label="FLEET COMMAND" />
            <span className="text-xs text-[#5B6B86] font-medium">• L-Band Sub-Meter Positioning</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
            Fleet GPS Radar & Telemetry Overlay
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-3xl">
            Simultaneous real-time tracking of all active commercial rigs with 2-hour breadcrumb trails, geofence boundary monitoring, and direct cab alert dispatch.
          </p>
        </div>

        {/* Layer Toggles Pill Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/70 border border-white shadow-xs flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6B86] px-2">Layers:</span>
          {[
            { id: 'weather', label: 'Weather' },
            { id: 'risk', label: 'Risk' },
            { id: 'traffic', label: 'Traffic' },
            { id: 'geofences', label: 'Geofences' },
            { id: 'customers', label: 'Customers' }
          ].map(l => {
            const isEnabled = layers[l.id as keyof typeof layers];
            return (
              <button
                key={l.id}
                onClick={() => toggleLayer(l.id as keyof typeof layers)}
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all liquid-btn cursor-pointer ${
                  isEnabled
                    ? 'bg-[#08193A] text-[#34D399] shadow-2xs'
                    : 'bg-white/60 text-[#5B6B86] hover:bg-white'
                }`}
              >
                {isEnabled ? '✓ ' : '✕ '}{l.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Multi-Unit Radar Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High-Res SVG Fleet Radar Canvas */}
        <div className="lg:col-span-2 p-6 rounded-[30px] glass-panel-dark text-white space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#34D399_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Radar Header */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] animate-ping" />
              <span className="font-mono text-sm font-bold text-[#A7F3D0]">
                ACTIVE RADAR NODES: {unitList.length} UNITS ONLINE
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#A7F3D0] border border-[#34D399]/30">
                L-BAND LATENCY: 18 MS
              </span>
              <AdminBadge />
            </div>
          </div>

          {/* Interactive Multi-Unit SVG Map */}
          <div className="relative z-10 w-full h-[320px] sm:h-[400px] rounded-2xl bg-[#0B2150]/70 border border-white/15 p-4 flex flex-col justify-between overflow-hidden">
            {/* Top map info */}
            <div className="flex items-center justify-between text-[11px] font-mono text-white/70">
              <span>CORRIDORS: NH-48, I-84, WESTERN DEDICATED FREIGHT LINK</span>
              <span>GEO-PROJECTION: WGS84</span>
            </div>

            {/* SVG Visualized Multi-Unit Network */}
            <div className="relative w-full h-[260px] flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 700 240" fill="none">
                {/* Background Grid */}
                <line x1="0" y1="60" x2="700" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="700" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="180" x2="700" y2="180" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                {/* Geofences Layer */}
                {layers.geofences && (
                  <>
                    {/* Khandala Ghat Geofence Zone */}
                    <rect x="420" y="80" width="120" height="70" rx="16" fill="rgba(246,198,91,0.12)" stroke="rgba(246,198,91,0.4)" strokeDasharray="4 4" />
                    <text x="480" y="75" fill="#F6C65B" fontSize="9" textAnchor="middle" fontFamily="monospace">GEOFENCE: GHAT PASS</text>

                    {/* Chakan Auto Hub Geofence Zone */}
                    <rect x="260" y="50" width="100" height="60" rx="16" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.3)" strokeDasharray="4 4" />
                    <text x="310" y="45" fill="#34D399" fontSize="9" textAnchor="middle" fontFamily="monospace">GEOFENCE: CHAKAN AUTO</text>
                  </>
                )}

                {/* Weather Warning Zone */}
                {layers.weather && (
                  <path
                    d="M 380 90 Q 440 60, 500 110 Q 460 140, 380 90 Z"
                    fill="rgba(56,189,248,0.08)"
                    stroke="rgba(56,189,248,0.3)"
                  />
                )}

                {/* Highway Backbone Path */}
                <path
                  d="M 80 180 C 180 190, 240 90, 360 110 C 460 130, 560 70, 640 50"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                {/* Breadcrumbs Trails Layer (Last 2 hours) */}
                <path
                  d="M 80 180 C 140 185, 200 130, 320 80"
                  stroke="rgba(52,211,153,0.3)"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
                <path
                  d="M 320 80 C 380 100, 420 105, 480 110"
                  stroke="rgba(52,211,153,0.6)"
                  strokeWidth="3"
                />

                {/* Render Unit Pins */}
                {unitList.map((u) => {
                  const pos = mapCoordinates[u.unitNumber] || { cx: 480, cy: 110 };
                  const isSelected = selectedUnitKey === u.unitNumber;
                  const color = getRiskColor(u.riskLevel);

                  return (
                    <g 
                      key={u.id}
                      onClick={() => setSelectedUnitKey(u.unitNumber)}
                      className="cursor-pointer"
                    >
                      {/* Selection Ring */}
                      {isSelected && (
                        <circle cx={pos.cx} cy={pos.cy} r="20" fill="none" stroke="#34D399" strokeWidth="2" className="animate-ping" />
                      )}
                      {/* Pulse Circle */}
                      <circle cx={pos.cx} cy={pos.cy} r="14" fill={`${color}33`} />
                      {/* Pin Center */}
                      <circle cx={pos.cx} cy={pos.cy} r="8" fill={color} stroke="#08193A" strokeWidth="2.5" />
                      {/* Label Tag */}
                      <rect 
                        x={pos.cx - 32} 
                        y={pos.cy - 24} 
                        width="64" 
                        height="16" 
                        rx="8" 
                        fill="#08193A" 
                        stroke={color} 
                        strokeWidth="1" 
                      />
                      <text 
                        x={pos.cx} 
                        y={pos.cy - 13} 
                        fill="white" 
                        fontSize="8.5" 
                        fontWeight="bold" 
                        textAnchor="middle" 
                        fontFamily="monospace"
                      >
                        {u.unitNumber}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Map Legend */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-mono text-white/60">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#34D399]" /> Low Risk
                <span className="w-2 h-2 rounded-full bg-[#F6C65B] ml-2" /> Moderate
                <span className="w-2 h-2 rounded-full bg-[#F59E5B] ml-2" /> High
                <span className="w-2 h-2 rounded-full bg-[#F26D6D] ml-2" /> Critical
              </span>
              <span>Click any pin to inspect rig telemetry</span>
            </div>
          </div>
        </div>

        {/* Right Col: Selected Unit Overview & Command Actions */}
        <div className="space-y-5">
          {/* Unit Telemetry Card */}
          <div className="p-6 rounded-[30px] glass-panel space-y-4 shadow-sm border border-white/80">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <span className="font-mono font-extrabold text-xl text-[#08193A] block">
                  {currentUnit.unitNumber}
                </span>
                <span className="text-xs text-[#5B6B86] font-mono">
                  {currentUnit.plateNumber || 'MH-12-FK-9901'}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                <span>{currentUnit.status}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/60 border border-white/80">
                <span className="text-[10px] text-[#5B6B86] uppercase font-mono block">Velocity</span>
                <p className="font-mono font-bold text-lg text-[#08193A] mt-0.5">{currentUnit.speedKmh} km/h</p>
                <span className="text-[10px] text-[#34D399]">Governor 70 km/h</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/60 border border-white/80">
                <span className="text-[10px] text-[#5B6B86] uppercase font-mono block">Fuel Efficiency</span>
                <p className="font-mono font-bold text-lg text-[#08193A] mt-0.5">{currentUnit.efficiencyKmL} km/L</p>
                <span className="text-[10px] text-[#5B6B86]">Optimal drag</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 space-y-1 text-xs">
              <span className="text-[10px] text-[#5B6B86] uppercase font-mono block">Active Freight Route</span>
              <p className="font-bold text-[#08193A] leading-snug">{currentUnit.route}</p>
              <p className="text-[10px] font-mono text-[#1B3A7A] mt-1">Live ETA: {currentUnit.eta}</p>
            </div>

            {/* Admin Command Actions on Unit */}
            <div className="space-y-2 pt-2 border-t border-black/5">
              <button
                onClick={() => onOpenTruckIntelligence(currentUnit.unitNumber)}
                className="w-full py-3 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn flex items-center justify-center gap-2 cursor-pointer shadow-md font-mono"
              >
                <Cpu className="w-4 h-4 text-[#34D399]" />
                <span>Open Full Truck Intelligence</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onTriggerToast(`Transmitted audio wake alert chime to cab of ${currentUnit.unitNumber}`)}
                  className="py-2.5 px-3 rounded-full text-xs font-bold bg-amber-500/20 text-amber-900 hover:bg-amber-500/30 transition-all liquid-btn flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BellRing className="w-3.5 h-3.5 text-amber-600" />
                  <span>Send Alert</span>
                </button>

                <button
                  onClick={() => onTriggerToast(`Sent biometric check-in ping to cab of ${currentUnit.unitNumber}`)}
                  className="py-2.5 px-3 rounded-full text-xs font-bold bg-white text-[#08193A] hover:bg-white/80 border border-black/10 transition-all liquid-btn flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Check-In</span>
                </button>
              </div>
            </div>
          </div>

          {/* Unit Selector Strip */}
          <div className="p-4 rounded-[26px] glass-panel space-y-2 shadow-xs border border-white/80 text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#5B6B86]">Switch Monitored Rig:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {unitList.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUnitKey(u.unitNumber)}
                  className={`px-3 py-1.5 rounded-full font-mono text-xs font-bold transition-all liquid-btn cursor-pointer whitespace-nowrap ${
                    selectedUnitKey === u.unitNumber
                      ? 'bg-[#08193A] text-[#34D399] shadow-xs'
                      : 'bg-white/60 text-[#5B6B86] hover:bg-white border border-white'
                  }`}
                >
                  {u.unitNumber}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
