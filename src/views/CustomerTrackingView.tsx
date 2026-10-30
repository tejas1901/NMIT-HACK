import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight,
  ArrowLeft,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  FileText,
  RotateCcw
} from 'lucide-react';
import { Consignment } from '../types';

interface CustomerTrackingViewProps {
  consignments: Consignment[];
  selectedConsignmentId?: string;
  onOpenDriverCall: (driverName?: string, phone?: string) => void;
  onOpenDriverChat: (driverName?: string) => void;
  onNavigateToShipments: () => void;
}

const ROUTE_PATH_DATA = "M 60 140 C 180 150, 260 60, 380 90 C 490 120, 580 70, 640 60";

export const CustomerTrackingView: React.FC<CustomerTrackingViewProps> = ({
  consignments = [],
  selectedConsignmentId,
  onOpenDriverCall,
  onOpenDriverChat,
  onNavigateToShipments
}) => {
  const fallbackConsignment: Consignment = {
    id: 'CRG-24551',
    origin: 'Bengaluru Logistics Park, Hub #01',
    destination: 'Mumbai JNPT Port Terminal, CFS 3',
    department: 'Commercial Freight',
    weightLbs: 14200,
    valueUsd: 85000,
    mode: 'First Class High Speed',
    delayRiskLevel: 'LOW',
    delayRiskPercent: 12,
    demurrageRisk: 0,
    carrierName: 'FreightIQ Logistics Carrier',
    circuitFile: 'circuits/qcloud_opt.qasm',
    netSavings: 4200,
    status: 'CONFIRMED',
    eta: 'Tomorrow, 14:00 IST',
    driverName: 'Vikram Malhotra',
    driverPhone: '+91 98201 55194',
    driverLicense: 'KA-05-2018-0098412',
    driverRating: 4.92,
    truckUnitId: 'Unit #4021',
    vehicleModel: 'Volvo FM420 6x4 Heavy Puller',
    vehiclePlate: 'KA-01-MJ-4021',
    vehicleVin: 'YV2RT40C8MA491023',
    vehicleCapacity: '40 Metric Tons'
  };

  const safeConsignments = Array.isArray(consignments) && consignments.length > 0 ? consignments : [fallbackConsignment];

  const activeConsignment = 
    safeConsignments.find(c => c.id === selectedConsignmentId) || 
    safeConsignments.find(c => c.status === 'CONFIRMED' || c.status === 'DISPATCHED' || c.status === 'AT RISK') || 
    safeConsignments[0];

  const [activeShipmentId, setActiveShipmentId] = useState<string>(activeConsignment?.id || 'CRG-24551');
  const [copiedText, setCopiedText] = useState(false);

  const currentItem = safeConsignments.find(c => c.id === activeShipmentId) || activeConsignment;

  // Driver details fallback
  const driverName = currentItem?.driverName || 'Vikram Malhotra';
  const driverPhone = currentItem?.driverPhone || '+91 98201 55194';
  const driverLicense = currentItem?.driverLicense || 'KA-05-2018-0098412';
  const driverRating = currentItem?.driverRating || 4.92;
  const vehicleUnit = currentItem?.truckUnitId || 'Unit #4021';
  const vehicleModel = currentItem?.vehicleModel || 'Volvo FM420 6x4 Heavy Puller';
  const vehiclePlate = currentItem?.vehiclePlate || 'KA-01-MJ-4021';
  const vehicleVin = currentItem?.vehicleVin || 'YV2RT40C8MA491023';
  const vehicleCapacity = currentItem?.vehicleCapacity || '40 Metric Tons';

  // SVG animated ping-pong vehicle state
  const pathRef = useRef<SVGPathElement | null>(null);
  const [progress, setProgress] = useState(0.45);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = Origin -> Dest, -1 = Dest -> Origin
  const [truckPos, setTruckPos] = useState({ x: 380, y: 90, angle: 0 });
  const [totalPathLen, setTotalPathLen] = useState(700);

  // Ping-Pong continuous motion effect
  useEffect(() => {
    let animId: number;
    let currProg = 0.45;
    let currDir: 1 | -1 = 1;
    const speed = 0.0016; // smooth cruising speed

    const tick = () => {
      currProg += currDir * speed;

      // When reaching destination point (1.0), bounce back to starting point
      if (currProg >= 1.0) {
        currProg = 1.0;
        currDir = -1;
        setDirection(-1);
      } 
      // When reaching starting point (0.0), bounce back to destination
      else if (currProg <= 0.0) {
        currProg = 0.0;
        currDir = 1;
        setDirection(1);
      }

      setProgress(currProg);

      if (pathRef.current) {
        const pathLen = pathRef.current.getTotalLength();
        if (totalPathLen !== pathLen) setTotalPathLen(pathLen);
        const dist = currProg * pathLen;
        const pt = pathRef.current.getPointAtLength(dist);

        // Compute tangent angle for truck orientation
        const lookAheadDelta = currDir === 1 ? 4 : -4;
        const lookAheadDist = Math.max(0, Math.min(pathLen, dist + lookAheadDelta));
        const ptAhead = pathRef.current.getPointAtLength(lookAheadDist);
        const dx = ptAhead.x - pt.x;
        const dy = ptAhead.y - pt.y;
        let deg = Math.atan2(dy, dx) * (180 / Math.PI);
        if (currDir === -1) {
          deg = Math.atan2(-dy, -dx) * (180 / Math.PI);
        }

        setTruckPos({ x: pt.x, y: pt.y, angle: deg });
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Distance calculation based on ping-pong progress
  const totalCorridorKm = 980;
  const currentKm = Math.round(progress * totalCorridorKm);
  const remainingKm = direction === 1 ? totalCorridorKm - currentKm : currentKm;

  // Waypoints along the corridor
  const waypoints = [
    { title: 'Origin Freight Terminal', loc: currentItem?.origin || 'Bengaluru Logistics Park, Hub #01', time: '04:30 IST', status: 'COMPLETED' },
    { title: 'Corridor Checkpoint A (Hubballi)', loc: 'NH-48 Golden Quadrilateral, KM 410', time: '08:45 IST', status: progress > 0.4 ? 'COMPLETED' : 'ACTIVE' },
    { title: 'Current Live GPS Waypoint', loc: direction === 1 ? 'Pune Chakan Highway Corridor, Node 14' : 'Return Transit Corridor (Inbound Backhaul)', time: 'LIVE BEACON', status: 'ACTIVE' },
    { title: 'Intermediate Mountain Pass', loc: 'Khandala Ghat Safety Overpass, KM 910', time: '12:00 IST (Est.)', status: progress > 0.85 ? 'COMPLETED' : 'PENDING' },
    { title: 'Final Destination Depot', loc: currentItem?.destination || 'Mumbai JNPT Port Terminal, CFS 3', time: `ETA: ${currentItem?.eta || '14:20 IST'}`, status: progress >= 0.98 ? 'COMPLETED' : 'PENDING' }
  ];

  const copyFullAllocationText = () => {
    const text = `--- OFFICIAL FREIGHT ALLOCATION RECORD ---
Order ID: ${currentItem?.id || 'CRG-24551'}
Dispatch Status: ${currentItem?.status || 'CONFIRMED'}
Origin: ${currentItem?.origin || 'Bengaluru Logistics Park'}
Destination: ${currentItem?.destination || 'Mumbai JNPT Port Terminal'}
Current Movement: ${direction === 1 ? 'Outbound Delivery (Origin → Destination)' : 'Inbound Backhaul (Destination → Origin)'}
Corridor Progress: ${currentKm} KM of 980 KM (${Math.round(progress * 100)}%)

[DRIVER DETAILS]
Driver Name: ${driverName}
Phone / VoIP: ${driverPhone}
Commercial Driving License: ${driverLicense}
Safety SLA Rating: ${driverRating} / 5.0

[VEHICLE SPECIFICATIONS]
Vehicle Unit: ${vehicleUnit}
Vehicle Model: ${vehicleModel}
Registration Plate: ${vehiclePlate}
Chassis / VIN: ${vehicleVin}
Payload Capacity: ${vehicleCapacity}
CAN-Bus Telemetry: Active (L-Band GPS Lock)
`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

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
            Continuous sub-meter GPS tracking along the freight corridor with real-time ping-pong vehicle transit simulation and verified driver credentials.
          </p>
        </div>

        {/* Consignment Selector Dropdown / Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#5B6B86]">Active Haul:</span>
          {consignments.slice(0, 4).map((c) => (
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
            All Shipments →
          </button>
        </div>
      </div>

      {/* Main Radar Card + Interactive Waypoints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High-Fidelity Radar Map Simulation with Ping-Pong Truck */}
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
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                  direction === 1 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                }`}>
                  {direction === 1 ? 'OUTBOUND TO DESTINATION' : 'INBOUND RETURN (BACKHAUL)'}
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                Driver: <strong>{driverName}</strong> • {vehicleUnit} ({vehicleModel})
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#34D399]/20 text-[#A7F3D0] border border-[#34D399]/30">
                SPEED: 68 KM/H
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-white/10 text-white border border-white/15">
                KM {currentKm} / {totalCorridorKm}
              </span>
            </div>
          </div>

          {/* Interactive SVG Radar Map Display with Ping-Pong Vehicle Loop */}
          <div className="relative z-10 w-full h-[300px] sm:h-[350px] rounded-2xl bg-[#0B2150]/60 border border-white/15 p-4 flex flex-col justify-between overflow-hidden">
            {/* Top map overlay tags */}
            <div className="flex items-center justify-between text-[11px] font-mono text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                NH-48 Golden Quadrilateral Corridor (Bengaluru ↔ Mumbai JNPT)
              </span>
              <span className="flex items-center gap-1 text-emerald-300">
                <RotateCcw className="w-3 h-3 animate-spin" />
                Continuous Ping-Pong Loop Active
              </span>
            </div>

            {/* SVG Visualized Route with Animated Vehicle */}
            <div className="relative w-full h-[220px] flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 700 200" fill="none">
                {/* Background Grid Lines */}
                <line x1="0" y1="50" x2="700" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="700" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="150" x2="700" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                
                {/* Full Route Path Track */}
                <path
                  ref={pathRef}
                  d={ROUTE_PATH_DATA}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                
                {/* Dynamic Trajectory Path (Glowing Mint) */}
                <path
                  d={ROUTE_PATH_DATA}
                  stroke="#34D399"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${totalPathLen}`}
                  strokeDashoffset={`${(1 - progress) * totalPathLen}`}
                  className="filter drop-shadow-[0_0_8px_#34D399]"
                />

                {/* Origin Point */}
                <circle cx="60" cy="140" r="9" fill="#1B3A7A" stroke="#FFFFFF" strokeWidth="3" />
                <text x="60" y="172" fill="white" fontSize="11" textAnchor="middle" fontWeight="bold">
                  Origin (Bengaluru)
                </text>

                {/* Waypoint 1: Hubballi */}
                <circle cx="230" cy="98" r="6" fill="#34D399" stroke="#08193A" strokeWidth="2" />
                <text x="230" y="80" fill="rgba(255,255,255,0.8)" fontSize="10" textAnchor="middle">
                  Hubballi (KM 410)
                </text>

                {/* Waypoint 2: Pune */}
                <circle cx="490" cy="108" r="6" fill="#34D399" stroke="#08193A" strokeWidth="2" />
                <text x="490" y="132" fill="rgba(255,255,255,0.8)" fontSize="10" textAnchor="middle">
                  Pune Chakan (KM 840)
                </text>

                {/* Destination Point */}
                <circle cx="640" cy="60" r="9" fill="#F59E5B" stroke="#FFFFFF" strokeWidth="3" />
                <text x="640" y="92" fill="white" fontSize="11" textAnchor="middle" fontWeight="bold">
                  Destination (JNPT)
                </text>

                {/* Continuous Moving Ping-Pong Truck Marker */}
                <g transform={`translate(${truckPos.x}, ${truckPos.y})`}>
                  {/* Pulsing Radar Aura */}
                  <circle cx="0" cy="0" r="20" fill="rgba(52,211,153,0.22)" className="animate-ping" />
                  <circle cx="0" cy="0" r="12" fill="#34D399" stroke="#FFFFFF" strokeWidth="3" className="filter drop-shadow-md" />

                  {/* Directional Truck Body */}
                  <g transform={`rotate(${truckPos.angle})`}>
                    <rect x="-8" y="-4" width="16" height="8" rx="2" fill="#08193A" stroke="#34D399" strokeWidth="1" />
                    <circle cx="5" cy="0" r="1.5" fill="#34D399" />
                  </g>

                  {/* Floating Info Pill Above Vehicle */}
                  <g transform="translate(0, -32)">
                    <rect x="-55" y="-12" width="110" height="22" rx="11" fill="#08193A" stroke="#34D399" strokeWidth="1.5" />
                    <text x="0" y="3" fill="#34D399" fontSize="9.5" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                      {direction === 1 ? '▶ OUTBOUND 68KM/H' : '◀ RETURNING 68KM/H'}
                    </text>
                  </g>
                </g>
              </svg>
            </div>

            {/* Bottom Radar Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
              <div>
                <span className="text-white/60 text-[10px] uppercase font-mono">Distance to Next Turn</span>
                <p className="font-mono font-bold text-white text-sm">{remainingKm} km</p>
              </div>
              <div>
                <span className="text-white/60 text-[10px] uppercase font-mono">Movement Vector</span>
                <p className="font-bold text-[#A7F3D0] text-sm">
                  {direction === 1 ? 'Outbound Forward' : 'Return Backhaul'}
                </p>
              </div>
              <div>
                <span className="text-white/60 text-[10px] uppercase font-mono">Corridor Speed</span>
                <p className="font-bold text-white text-sm font-mono">68 km/h (SLA Locked)</p>
              </div>
              <div>
                <span className="text-white/60 text-[10px] uppercase font-mono">Route Weather</span>
                <p className="font-bold text-[#34D399] text-sm">Clear Sky • 28°C</p>
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
                {(currentItem?.weightLbs || 14200).toLocaleString()} lbs
              </p>
              <span className="text-[10px] text-white/50">{vehicleCapacity} rated</span>
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

        {/* Right Col: Driver Direct Bridge + Waypoint Timeline + Official Text Allocation Form */}
        <div className="space-y-6">
          {/* Driver Direct Card */}
          <div className="p-6 rounded-[30px] glass-panel space-y-4 shadow-sm border border-white/80">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5B6B86]">
                Assigned Truck Operator
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#065F46] border border-[#34D399]/40">
                ACTIVE ON CAB
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#08193A] text-[#34D399] flex items-center justify-center font-extrabold text-base shadow-sm">
                {driverName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-extrabold text-[#08193A] text-sm">
                  {driverName}
                </h4>
                <p className="text-xs text-[#5B6B86]">
                  Master Heavy Haul Specialist • {driverRating} ★
                </p>
                <p className="text-[11px] font-mono text-[#08193A] font-medium mt-0.5">
                  Lic: {driverLicense} • {driverPhone}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => onOpenDriverCall(driverName, driverPhone)}
                className="py-2.5 px-3 rounded-xl text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Call Driver</span>
              </button>

              <button
                onClick={() => onOpenDriverChat(driverName)}
                className="py-2.5 px-3 rounded-xl text-xs font-bold bg-white text-[#08193A] hover:bg-white/90 border border-black/10 transition-all liquid-btn flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#1B3A7A]" />
                <span>Direct Chat</span>
              </button>
            </div>
          </div>

          {/* OFFICIAL DRIVER & VEHICLE ALLOCATION DETAILS IN TEXT FORM */}
          <div className="p-6 rounded-[30px] glass-panel space-y-4 shadow-sm border border-emerald-300/40 bg-gradient-to-b from-white to-emerald-50/20">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#065F46]" />
                <span className="text-xs font-extrabold text-[#08193A] uppercase tracking-wider">
                  Driver & Vehicle Details (Text Form)
                </span>
              </div>
              <button
                onClick={copyFullAllocationText}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#08193A]/5 hover:bg-[#08193A]/10 text-[#08193A] flex items-center gap-1 transition-all cursor-pointer"
                title="Copy all text to clipboard"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-[#5B6B86]" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            {/* Formatted Clean Text Rows */}
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white/80 border border-black/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5B6B86] tracking-wider block">Assigned Commercial Driver</span>
                <p className="font-bold text-[#08193A] text-sm">{driverName}</p>
                <div className="flex justify-between text-[11px] text-[#5B6B86] font-mono pt-0.5">
                  <span>Phone: <strong className="text-[#08193A]">{driverPhone}</strong></span>
                  <span>Rating: <strong className="text-amber-600">★ {driverRating}</strong></span>
                </div>
                <p className="text-[11px] font-mono text-[#5B6B86]">Govt License: {driverLicense}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 border border-black/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5B6B86] tracking-wider block">Assigned Freight Vehicle</span>
                <p className="font-mono font-extrabold text-[#08193A]">{vehicleUnit} — {vehicleModel}</p>
                <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-[#5B6B86] pt-0.5">
                  <div>Plate: <strong className="text-[#08193A]">{vehiclePlate}</strong></div>
                  <div>Capacity: <strong className="text-[#08193A]">{vehicleCapacity}</strong></div>
                </div>
                <p className="text-[10px] font-mono text-[#5B6B86] truncate" title={vehicleVin}>
                  Chassis VIN: {vehicleVin}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-[#065F46] space-y-0.5">
                <div className="flex items-center justify-between font-bold">
                  <span>Dispatch Status:</span>
                  <span className="font-mono">{currentItem?.status || 'CONFIRMED'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span>Movement:</span>
                  <span className="font-mono">{direction === 1 ? 'Outbound to Destination' : 'Return to Depot'}</span>
                </div>
              </div>
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
