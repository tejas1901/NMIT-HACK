import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Gauge, 
  Wind, 
  ShieldCheck, 
  PhoneCall, 
  MessageSquare, 
  Clock, 
  Radio, 
  Sparkles,
  ArrowUpRight,
  Truck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Consignment } from '../types';

interface CustomerTrackingViewProps {
  consignments: Consignment[];
  selectedConsignmentId?: string;
  onOpenDriverCall: (driverName?: string, phone?: string) => void;
  onOpenDriverChat: (driverName?: string) => void;
  onNavigateToShipments: () => void;
}

export const CustomerTrackingView: React.FC<CustomerTrackingViewProps> = ({
  consignments,
  selectedConsignmentId,
  onOpenDriverCall,
  onOpenDriverChat,
  onNavigateToShipments
}) => {
  const activeConsignment = 
    consignments.find(c => c.id === selectedConsignmentId) || 
    consignments.find(c => c.status === 'DISPATCHED' || c.status === 'AT RISK') || 
    consignments[0];

  const [activeShipmentId, setActiveShipmentId] = useState<string>(activeConsignment?.id || 'CRG-24551');

  const currentItem = consignments.find(c => c.id === activeShipmentId) || activeConsignment;

  // Waypoints along the corridor
  const waypoints = [
    { title: 'Origin Freight Terminal', loc: currentItem?.origin || 'Nhava Sheva Port, Terminal 4', time: '06:30 IST', status: 'COMPLETED' },
    { title: 'Corridor Checkpoint A (Ghat Pass)', loc: 'Khandala Expressway Overpass, KM 82', time: '09:45 IST', status: 'COMPLETED' },
    { title: 'Current Satellite Waypoint', loc: 'Chakan Industrial Corridor, Node 14', time: '11:15 IST (LIVE)', status: 'ACTIVE' },
    { title: 'Intermediate Logistics Hub', loc: 'Pune East Freight Terminal', time: '13:00 IST (Est.)', status: 'PENDING' },
    { title: 'Final Destination Depot', loc: currentItem?.destination || 'Whitefield Technology Park, Bay 12', time: `ETA: ${currentItem?.eta || '14:20 IST'}`, status: 'PENDING' }
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Shipment Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-[#34D399] animate-pulse" />
              <span>LIVE SATELLITE RADAR</span>
            </span>
            <span className="text-xs text-[#5B6B86] font-medium">• L-Band GPS Telemetry (2.4 GHz)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
            Consignment GPS Radar & Telemetry
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-2xl">
            Sub-meter precision tracking with multi-modal sensor telemetry, autonomous corridor safety monitoring, and instant driver link.
          </p>
        </div>

        {/* Consignment Selector Dropdown / Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#5B6B86]">Active Haul:</span>
          {consignments.slice(0, 3).map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveShipmentId(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all liquid-btn cursor-pointer ${
                activeShipmentId === c.id
                  ? 'bg-[#08193A] text-white shadow-xs'
                  : 'bg-white/60 text-[#5B6B86] hover:bg-white border border-white'
              }`}
            >
              {c.id}
            </button>
          ))}
          <button
            onClick={onNavigateToShipments}
            className="text-xs font-bold text-[#1B3A7A] hover:underline ml-2"
          >
            View All Shipments →
          </button>
        </div>
      </div>

      {/* Main Radar Card + Interactive Waypoints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High-Fidelity Radar Map Simulation */}
        <div className="lg:col-span-2 p-6 rounded-[30px] glass-panel-dark text-white space-y-6 shadow-xl relative overflow-hidden">
          {/* Subtle Radar Background Grid */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#34D399_1px,transparent_1px)] [background-size:24px_24px]" />
          
          {/* Radar Header */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] animate-ping" />
                <span className="font-mono text-sm font-bold text-[#A7F3D0]">
                  RADAR BEACON LOCK: {currentItem?.id}
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                Carrier: {currentItem?.carrierName} • Unit #4021 (Heavy Hauler Semi)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#34D399]/20 text-[#A7F3D0] border border-[#34D399]/30">
                SPEED: 68 KM/H
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-white/10 text-white border border-white/15">
                LAT: 18.5204° N, 73.8567° E
              </span>
            </div>
          </div>

          {/* Interactive SVG Radar Map Display */}
          <div className="relative z-10 w-full h-[280px] sm:h-[340px] rounded-2xl bg-[#0B2150]/60 border border-white/15 p-4 flex flex-col justify-between overflow-hidden">
            {/* Top map overlay tags */}
            <div className="flex items-center justify-between text-[11px] font-mono text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                Western Dedicated Freight Corridor (Golden Quadrilateral)
              </span>
              <span>ELEVATION: 580m MSL</span>
            </div>

            {/* SVG Visualized Route with Waypoints */}
            <div className="relative w-full h-[200px] flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 700 200" fill="none">
                {/* Background Grid Lines */}
                <line x1="0" y1="50" x2="700" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="700" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="150" x2="700" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                
                {/* Full Route Path */}
                <path
                  d="M 60 140 C 180 150, 260 60, 380 90 C 490 120, 580 70, 640 60"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                
                {/* Completed Trajectory Path (Glowing Mint) */}
                <path
                  d="M 60 140 C 180 150, 260 60, 380 90"
                  stroke="#34D399"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_8px_#34D399]"
                />

                {/* Origin Point */}
                <circle cx="60" cy="140" r="8" fill="#1B3A7A" stroke="#FFFFFF" strokeWidth="2.5" />
                <text x="60" y="175" fill="white" fontSize="11" textAnchor="middle" fontWeight="bold">Origin Port</text>

                {/* Ghat Pass Point */}
                <circle cx="230" cy="98" r="6" fill="#34D399" stroke="#08193A" strokeWidth="2" />
                <text x="230" y="80" fill="rgba(255,255,255,0.8)" fontSize="10" textAnchor="middle">Ghat Pass (KM 82)</text>

                {/* Active Truck Beacon (Positioned at 380, 90) */}
                <circle cx="380" cy="90" r="18" fill="rgba(52,211,153,0.25)" className="animate-ping" />
                <circle cx="380" cy="90" r="10" fill="#34D399" stroke="#FFFFFF" strokeWidth="3" />
                <rect x="345" y="45" width="70" height="24" rx="12" fill="#08193A" stroke="#34D399" strokeWidth="1.5" />
                <text x="380" y="61" fill="#34D399" fontSize="10" textAnchor="middle" fontWeight="bold" fontFamily="monospace">TRUCK LIVE</text>

                {/* Destination Point */}
                <circle cx="640" cy="60" r="8" fill="#F59E5B" stroke="#FFFFFF" strokeWidth="2.5" />
                <text x="640" y="95" fill="white" fontSize="11" textAnchor="middle" fontWeight="bold">Depot ETA</text>
              </svg>
            </div>

            {/* Bottom Radar Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
              <div>
                <span className="text-white/60 text-[10px] uppercase font-mono">Distance Remaining</span>
                <p className="font-mono font-bold text-white text-sm">184.2 km</p>
              </div>
              <div>
                <span className="text-white/60 text-[10px] uppercase font-mono">Current Corridor</span>
                <p className="font-bold text-[#A7F3D0] text-sm">Expressway NH-48</p>
              </div>
              <div>
                <span className="text-white/60 text-[10px] uppercase font-mono">Autonomous Governor</span>
                <p className="font-bold text-white text-sm">ENGAGED (Optimal)</p>
              </div>
              <div>
                <span className="text-white/60 text-[10px] uppercase font-mono">Weather Corridor</span>
                <p className="font-bold text-[#34D399] text-sm">Clear • 28°C</p>
              </div>
            </div>
          </div>

          {/* Real-Time Sensor Telemetry Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-[11px] font-semibold mb-1">
                <Gauge className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Payload Weight</span>
              </div>
              <p className="font-mono text-lg font-bold text-white">
                {currentItem?.weightLbs.toLocaleString()} lbs
              </p>
              <span className="text-[10px] text-white/50">Capacity: 78%</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-[11px] font-semibold mb-1">
                <Wind className="w-3.5 h-3.5 text-[#6EE7B7]" />
                <span>Cargo Temp</span>
              </div>
              <p className="font-mono text-lg font-bold text-white">
                4.2° C
              </p>
              <span className="text-[10px] text-[#A7F3D0]">Cold-chain locked</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-[11px] font-semibold mb-1">
                <Clock className="w-3.5 h-3.5 text-[#F6C65B]" />
                <span>Delay Risk Score</span>
              </div>
              <p className="font-mono text-lg font-bold text-[#34D399]">
                {currentItem?.delayRiskPercent}% (Low)
              </p>
              <span className="text-[10px] text-white/50">XGBoost ML v4</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-[11px] font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Demurrage Risk</span>
              </div>
              <p className="font-mono text-lg font-bold text-white">
                ₹0.00
              </p>
              <span className="text-[10px] text-[#34D399]">100% SLA Protected</span>
            </div>
          </div>
        </div>

        {/* Right Col: Driver Direct Bridge + Waypoint Timeline */}
        <div className="space-y-6">
          {/* Driver Direct Card */}
          <div className="p-6 rounded-[30px] glass-panel space-y-4 shadow-sm border border-white/80">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5B6B86]">
                Assigned Truck Operator
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#08193A]">
                ACTIVE ON CAB
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#08193A] text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                VM
              </div>
              <div>
                <h4 className="font-extrabold text-[#08193A] text-sm">
                  {currentItem?.driverName || 'Vikram Malhotra'}
                </h4>
                <p className="text-xs text-[#5B6B86]">
                  Master Heavy Haul Specialist (12 yrs exp)
                </p>
                <p className="text-[11px] font-mono text-[#5B6B86] mt-0.5">
                  ID: DVR-4021-IN • {currentItem?.driverPhone || '+1 (312) 555-0194'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => onOpenDriverCall(currentItem?.driverName, currentItem?.driverPhone)}
                className="py-2.5 px-3 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Call Driver</span>
              </button>

              <button
                onClick={() => onOpenDriverChat(currentItem?.driverName)}
                className="py-2.5 px-3 rounded-full text-xs font-bold bg-white text-[#08193A] hover:bg-white/90 border border-black/10 transition-all liquid-btn flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#1B3A7A]" />
                <span>Direct Chat</span>
              </button>
            </div>
          </div>

          {/* Waypoint Timeline */}
          <div className="p-6 rounded-[30px] glass-panel space-y-4 shadow-sm border border-white/80">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5B6B86]">
                Corridor Waypoints
              </span>
              <span className="text-[11px] font-mono text-[#08193A] font-bold">
                ETA: {currentItem?.eta || '14:20 IST'}
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {waypoints.map((wp, idx) => {
                const isCompleted = wp.status === 'COMPLETED';
                const isActive = wp.status === 'ACTIVE';

                return (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {/* Line connector */}
                    {idx < waypoints.length - 1 && (
                      <div 
                        className={`absolute left-[11px] top-6 w-0.5 h-10 ${
                          isCompleted ? 'bg-[#34D399]' : 'bg-black/10'
                        }`} 
                      />
                    )}

                    {/* Node Dot */}
                    <div className="relative z-10 mt-0.5">
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-[#34D399] flex items-center justify-center text-white shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      ) : isActive ? (
                        <div className="w-6 h-6 rounded-full bg-[#08193A] flex items-center justify-center text-white ring-4 ring-[#34D399]/30">
                          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-ping" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-white border-2 border-black/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-black/30" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${isActive ? 'text-[#08193A]' : isCompleted ? 'text-[#08193A]' : 'text-[#5B6B86]'}`}>
                          {wp.title}
                        </span>
                        <span className="font-mono text-[10px] text-[#5B6B86]">{wp.time}</span>
                      </div>
                      <p className="text-[11px] text-[#5B6B86] mt-0.5">
                        {wp.loc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
