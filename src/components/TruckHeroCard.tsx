import React, { useState, useRef, useEffect } from 'react';
import { 
  Clock, 
  PhoneCall, 
  MessageSquare, 
  Wind, 
  Radio, 
  Gauge, 
  Zap, 
  ShieldCheck, 
  Fuel, 
  CheckCircle, 
  TrendingUp,
  Activity
} from 'lucide-react';
import { TelemetryUnit } from '../types';

interface TruckHeroCardProps {
  unit: TelemetryUnit;
  onCallDriver: () => void;
  onChatDriver: () => void;
  liveCrosswindKmh: number;
}

export const TruckHeroCard: React.FC<TruckHeroCardProps> = ({
  unit,
  onCallDriver,
  onChatDriver,
  liveCrosswindKmh
}) => {
  // 3D Tilt State
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Hotspot Popover State
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // Badge Tooltip State
  const [activeBadgeTooltip, setActiveBadgeTooltip] = useState<string | null>(null);

  // Live seconds countdown for ETA display
  const [liveSeconds, setLiveSeconds] = useState(22);
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSeconds((prev) => (prev > 0 ? prev - 1 : 59));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format live dynamic ETA
  const displayEta = unit.eta.includes(':') 
    ? unit.eta.slice(0, 6) + String(liveSeconds).padStart(2, '0')
    : unit.eta;

  // 3D Parallax Tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Disable on touch / small screens
    if (window.innerWidth < 768) return;
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 5.5; // Max 5.5 deg
    const rotateY = ((x - centerX) / centerX) * 5.5;

    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  };

  // Mock payload metadata for badge tooltips
  const badgeDetails: Record<string, { route: string; weight: string; eta: string; desc: string }> = {
    '#8824021': { route: 'Bengaluru → Pune', weight: '14,200 KG', eta: '02h 40m', desc: 'Medical Precision Equipment' },
    '#8859055': { route: 'Bengaluru → Mumbai', weight: '12,800 KG', eta: '04h 18m', desc: 'Electronic Assemblies (Cold-Chain)' },
    '#8828037': { route: 'Hubballi → JNPT Gate 3', weight: '11,500 KG', eta: '03h 55m', desc: 'High-Value Aerospace Castings' },
    '#7719204': { route: 'Chennai → Hyderabad', weight: '22,000 KG', eta: '06h 10m', desc: 'Refrigerated Vaccines' },
    '#7718992': { route: 'Chennai → Vijayawada', weight: '19,200 KG', eta: '04h 30m', desc: 'Automotive Components' },
    '#9901421': { route: 'Pune → Delhi Dadri', weight: '34,000 KG', eta: '16h 40m', desc: 'Precision CNC Machined Parts' }
  };

  return (
    <div className="p-5 md:p-7 rounded-[32px] glass-panel relative overflow-hidden shadow-[0_16px_50px_rgba(8,25,58,0.08)]">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5 relative z-20">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono font-extrabold text-2xl text-[#08193A] tracking-tight">
            {unit.unitNumber}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-mint-pulse" />
            {unit.status}
          </span>
          <span className="text-xs font-mono font-bold text-[#5B6B86] flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 border border-white/80">
            <Clock className="w-3.5 h-3.5 text-[#1B3A7A]" />
            <span>ETA {displayEta}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCallDriver}
            className="px-4 py-2 rounded-full text-xs font-bold text-[#08193A] border border-[#08193A]/30 hover:bg-white/80 transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#1B3A7A]" />
            <span>Call Driver</span>
          </button>
          <button
            onClick={onChatDriver}
            className="px-4 py-2 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Chat with Driver</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Truck Stage Div (Positioned in Percentages with Container Queries) */}
      <div 
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-[1100px] mx-auto mt-4 mb-2 rounded-[26px] p-2 md:p-4 overflow-hidden transition-transform duration-300 ease-out"
        style={{
          aspectRatio: '1252 / 835',
          minHeight: '280px',
          containerType: 'inline-size',
          background: 'linear-gradient(180deg, rgba(244, 250, 248, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%)',
          perspective: '1200px',
          transform: isHovered 
            ? `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)` 
            : 'rotateX(0deg) rotateY(0deg)'
        }}
      >
        {/* Speed Streaks behind trailer (Left/Rear of truck) */}
        <div className="absolute left-[3%] top-[34%] w-[26%] h-[20%] pointer-events-none z-0" aria-hidden="true">
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#34D399]/40 to-transparent animate-speed-streak-1 mb-2" />
          <div className="w-3/4 h-0.5 bg-gradient-to-r from-transparent via-[#1B3A7A]/30 to-transparent animate-speed-streak-2 mb-2" />
          <div className="w-4/5 h-0.5 bg-gradient-to-r from-transparent via-[#6EE7B7]/40 to-transparent animate-speed-streak-3" />
        </div>

        {/* Truck + Telemetry Panel Group (Bobs gently translateY ±3px in 6s loop) */}
        <div 
          className="relative w-full h-full animate-truck-bob"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Moving Dashed Road Line Under Truck */}
          <div className="absolute bottom-[17%] left-[6%] right-[6%] h-6 pointer-events-none z-0">
            <svg className="w-full h-full" viewBox="0 0 1000 24" preserveAspectRatio="none">
              <line 
                x1="0" y1="12" x2="1000" y2="12" 
                stroke="rgba(8, 25, 58, 0.18)" 
                strokeWidth="2.5" 
                className="animate-dash-road" 
              />
            </svg>
          </div>

          {/* Soft Elliptical Ground Shadow under wheels */}
          <div 
            className="absolute bottom-[14%] left-[8%] w-[84%] h-[6%] rounded-[100%] bg-[#08193A] blur-md pointer-events-none animate-shadow-breath z-0"
            aria-hidden="true"
          />

          {/* Faint reflection on the floor */}
          <div 
            className="absolute bottom-[8%] left-[10%] w-[80%] h-[5%] rounded-full bg-gradient-to-b from-[#34D399]/15 to-transparent blur-sm pointer-events-none z-0"
            aria-hidden="true"
          />

          {/* Truck Image: 100% contain, no white box (mix-blend-multiply), cab and wheels completely visible */}
          <img
            src="/assets/aistudio/upscalemedia-transformed_b5694985.jpeg"
            alt="Commercial Truck Profile Cab and Box Trailer"
            className="w-full h-full object-contain select-none pointer-events-none relative z-10"
            style={{ 
              mixBlendMode: 'multiply',
              filter: 'contrast(1.02) brightness(0.99)'
            }}
          />

          {/* 3. Telemetry Panel ON the Trailer (Percentage positioning with CSS variables + cqw font scaling) */}
          <div 
            className="!absolute rounded-[14px] glass-panel-dark text-white p-[1.8cqw] flex flex-col justify-between shadow-[0_12px_36px_rgba(8,25,58,0.45)] border border-white/15 transition-all duration-300 z-20 group/panel"
            style={{
              position: 'absolute',
              left: 'var(--panel-left, 33%)',
              top: 'var(--panel-top, 26%)',
              width: 'var(--panel-width, 59%)',
              height: 'var(--panel-height, 32%)',
              transform: isHovered ? 'translateZ(30px) scale(1.01)' : 'translateZ(15px)',
              boxShadow: isHovered 
                ? '0 16px 44px rgba(8,25,58,0.55), 0 0 28px rgba(52,211,153,0.3)' 
                : '0 10px 30px rgba(8,25,58,0.35)'
            }}
          >
            {/* Row 1: Micro-caps + Giant % + Mint Progress Bar with Shimmer */}
            <div>
              <div className="flex items-center justify-between">
                <span 
                  className="font-extrabold uppercase tracking-widest text-white/70"
                  style={{ fontSize: 'clamp(8px, 1.05cqw, 13px)' }}
                >
                  CURRENT CARGO CAPACITY
                </span>
                <span 
                  className="font-mono font-bold px-[0.8cqw] py-[0.2cqw] rounded-full bg-[#34D399]/20 text-[#6EE7B7] border border-[#34D399]/40 flex items-center gap-1"
                  style={{ fontSize: 'clamp(7px, 0.85cqw, 11px)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-mint-pulse" />
                  SLA OPTIMIZED
                </span>
              </div>

              <div className="flex items-baseline gap-[1cqw] my-[0.3cqw]">
                <span 
                  className="font-extrabold font-mono text-white tracking-tight tabular-nums"
                  style={{ fontSize: 'clamp(20px, 3.8cqw, 46px)' }}
                >
                  {unit.capacityPercent}%
                </span>
                <span 
                  className="text-white/60 font-semibold"
                  style={{ fontSize: 'clamp(8px, 0.95cqw, 12px)' }}
                >
                  Volumetric Utilization
                </span>
              </div>

              {/* Mint Progress Bar with Moving Shimmer */}
              <div className="w-full h-[0.7cqw] min-h-[5px] rounded-full bg-white/15 overflow-hidden relative">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#6EE7B7] to-[#34D399] transition-all duration-700 relative overflow-hidden"
                  style={{ width: `${unit.capacityPercent}%` }}
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>

            {/* Row 2: ACTIVE CONSIGNMENTS Label + Badge Pills with Pulsing Mint Dots & Tooltips */}
            <div className="flex items-center gap-[1cqw] flex-wrap py-[0.2cqw]">
              <span 
                className="font-bold uppercase tracking-wider text-white/50"
                style={{ fontSize: 'clamp(7px, 0.85cqw, 11px)' }}
              >
                ACTIVE CONSIGNMENTS:
              </span>
              <div className="flex items-center gap-[0.8cqw]">
                {unit.activeShipments.map((badge) => {
                  const details = badgeDetails[badge] || { route: unit.route, weight: '12,000 KG', eta: unit.eta, desc: 'Commercial Freight' };
                  return (
                    <div 
                      key={badge} 
                      className="relative"
                      onMouseEnter={() => setActiveBadgeTooltip(badge)}
                      onMouseLeave={() => setActiveBadgeTooltip(null)}
                    >
                      <button
                        type="button"
                        className="px-[0.9cqw] py-[0.25cqw] rounded-full font-mono font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-[0.5cqw] transition-colors cursor-pointer"
                        style={{ fontSize: 'clamp(7px, 0.85cqw, 11px)' }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-mint-pulse shrink-0" />
                        <span>{badge}</span>
                      </button>

                      {/* Floating Glass Tooltip */}
                      {activeBadgeTooltip === badge && (
                        <div 
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 rounded-xl glass-panel-dark text-white text-left shadow-xl border border-white/25 z-50 animate-in fade-in zoom-in-95 pointer-events-none"
                          style={{ fontSize: '10px' }}
                        >
                          <p className="font-bold text-[#A7F3D0]">{badge} — {details.desc}</p>
                          <p className="text-white/80 mt-1">Route: {details.route}</p>
                          <div className="flex justify-between text-white/60 mt-1 font-mono">
                            <span>Weight: {details.weight}</span>
                            <span className="text-[#34D399]">ETA {details.eta}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Current Route Assignment + Weather Chip */}
            <div className="flex items-center justify-between gap-[1cqw] border-t border-white/10 pt-[0.4cqw]">
              <span 
                className="font-semibold text-white/90 truncate"
                style={{ fontSize: 'clamp(7px, 0.9cqw, 12px)' }}
              >
                CURRENT ROUTE ASSIGNMENT: {unit.route}
              </span>

              <span 
                className={`px-[1cqw] py-[0.3cqw] rounded-full font-bold shrink-0 flex items-center gap-[0.4cqw] border ${
                  liveCrosswindKmh > 30 
                    ? 'bg-[#F6C65B]/25 text-[#F6C65B] border-[#F6C65B]/40' 
                    : 'bg-[#34D399]/20 text-[#6EE7B7] border-[#34D399]/40'
                }`}
                style={{ fontSize: 'clamp(7px, 0.85cqw, 11px)' }}
              >
                <Wind className="w-[1cqw] h-[1cqw] min-w-[10px] min-h-[10px]" />
                <span>ACTIVE WEATHER SEGMENT · Crosswind {liveCrosswindKmh.toFixed(1)} km/h</span>
              </span>
            </div>
          </div>

          {/* 4. Interactive Hotspots on the Truck (Pulsing mint dots with popovers) */}
          {/* Hotspot 1: Cab (Driver Status) */}
          <div 
            className="absolute left-[13%] top-[45%] z-30 group"
            onMouseEnter={() => setActiveHotspot('cab')}
            onMouseLeave={() => setActiveHotspot(null)}
          >
            <button
              aria-label="Cab status hotspot"
              className="w-4 h-4 rounded-full bg-[#08193A] border-2 border-[#34D399] flex items-center justify-center hover:scale-125 transition-transform cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-ping" />
            </button>
            {activeHotspot === 'cab' && (
              <div className="absolute left-6 top-1/2 -translate-y-1/2 w-44 p-2.5 rounded-xl glass-panel-dark text-white text-xs shadow-xl border border-white/20 z-50 animate-in fade-in">
                <p className="font-bold text-[#34D399] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Driver Status: Alert</span>
                </p>
                <p className="text-[10px] text-white/70 mt-0.5">Biometric alertness score: 98%. Eye tracking nominal.</p>
              </div>
            )}
          </div>

          {/* Hotspot 2: Fuel Tank */}
          <div 
            className="absolute left-[31%] top-[67%] z-30 group"
            onMouseEnter={() => setActiveHotspot('fuel')}
            onMouseLeave={() => setActiveHotspot(null)}
          >
            <button
              aria-label="Fuel tank hotspot"
              className="w-4 h-4 rounded-full bg-[#08193A] border-2 border-[#34D399] flex items-center justify-center hover:scale-125 transition-transform cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-ping" />
            </button>
            {activeHotspot === 'fuel' && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-40 p-2.5 rounded-xl glass-panel-dark text-white text-xs shadow-xl border border-white/20 z-50 animate-in fade-in">
                <p className="font-bold text-[#34D399] flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5" />
                  <span>Fuel Level: 72%</span>
                </p>
                <p className="text-[10px] text-white/70 mt-0.5">Range remaining: 620 KM on low-sulfur diesel.</p>
              </div>
            )}
          </div>

          {/* Hotspot 3: Rear Wheels (Tire Pressure) */}
          <div 
            className="absolute left-[70%] top-[68%] z-30 group"
            onMouseEnter={() => setActiveHotspot('wheels')}
            onMouseLeave={() => setActiveHotspot(null)}
          >
            <button
              aria-label="Tire pressure hotspot"
              className="w-4 h-4 rounded-full bg-[#08193A] border-2 border-[#34D399] flex items-center justify-center hover:scale-125 transition-transform cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-ping" />
            </button>
            {activeHotspot === 'wheels' && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-44 p-2.5 rounded-xl glass-panel-dark text-white text-xs shadow-xl border border-white/20 z-50 animate-in fade-in">
                <p className="font-bold text-[#34D399] flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Tire Pressure: 32 PSI</span>
                </p>
                <p className="text-[10px] text-white/70 mt-0.5">TPMS verified across all 6 trailer axles.</p>
              </div>
            )}
          </div>

          {/* Hotspot 4: Trailer Door (Seal Intact) */}
          <div 
            className="absolute left-[92%] top-[45%] z-30 group"
            onMouseEnter={() => setActiveHotspot('door')}
            onMouseLeave={() => setActiveHotspot(null)}
          >
            <button
              aria-label="Trailer door seal hotspot"
              className="w-4 h-4 rounded-full bg-[#08193A] border-2 border-[#34D399] flex items-center justify-center hover:scale-125 transition-transform cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-ping" />
            </button>
            {activeHotspot === 'door' && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-44 p-2.5 rounded-xl glass-panel-dark text-white text-xs shadow-xl border border-white/20 z-50 animate-in fade-in">
                <p className="font-bold text-[#34D399] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Digital Seal: Intact</span>
                </p>
                <p className="text-[10px] text-white/70 mt-0.5">Crypto tamper-lock verified via NFC sensor #991.</p>
              </div>
            )}
          </div>

          {/* 5. Floating Info Chips Around the Truck with Thin Connecting Dotted Lines */}
          {/* Chip 1: Speed (Above Cab) */}
          <div 
            className="absolute left-[10%] top-[12%] z-20 transition-all hover:scale-105"
            style={{ transform: isHovered ? 'translateZ(60px)' : 'translateZ(20px)' }}
          >
            <div className="px-3 py-1 rounded-full glass-panel shadow-md border border-white flex items-center gap-1.5 text-xs font-bold text-[#08193A]">
              <Gauge className="w-3.5 h-3.5 text-[#1B3A7A]" />
              <span className="font-mono">Speed {unit.speedKmh} km/h</span>
            </div>
            {/* Animated dotted connecting line */}
            <svg className="w-6 h-8 -mt-1 ml-4 overflow-visible pointer-events-none" viewBox="0 0 24 32">
              <line x1="12" y1="0" x2="18" y2="30" stroke="#34D399" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* Chip 2: Signal Link (Top Right Above Trailer) */}
          <div 
            className="absolute right-[8%] top-[10%] z-20 transition-all hover:scale-105 hidden sm:block"
            style={{ transform: isHovered ? 'translateZ(60px)' : 'translateZ(20px)' }}
          >
            <div className="px-3 py-1 rounded-full glass-panel shadow-md border border-white flex items-center gap-1.5 text-xs font-bold text-[#08193A]">
              <Radio className="w-3.5 h-3.5 text-[#34D399] animate-pulse" />
              <span>Signal {unit.signalStrength.split(' ')[0]} · QpiAI Satellite Link</span>
            </div>
            <svg className="w-6 h-8 -mt-1 ml-8 overflow-visible pointer-events-none" viewBox="0 0 24 32">
              <line x1="12" y1="0" x2="6" y2="30" stroke="#34D399" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* Chip 3: ETA Live Countdown (Top Center) */}
          <div 
            className="absolute left-[44%] top-[8%] z-20 transition-all hover:scale-105"
            style={{ transform: isHovered ? 'translateZ(60px)' : 'translateZ(20px)' }}
          >
            <div className="px-3 py-1 rounded-full glass-panel shadow-md border border-white flex items-center gap-1.5 text-xs font-bold text-[#08193A]">
              <Clock className="w-3.5 h-3.5 text-[#1B3A7A]" />
              <span className="font-mono">ETA {displayEta}</span>
            </div>
          </div>

          {/* Chip 4: Efficiency (Bottom Left) */}
          <div 
            className="absolute left-[4%] bottom-[6%] z-20 transition-all hover:scale-105 hidden sm:block"
            style={{ transform: isHovered ? 'translateZ(50px)' : 'translateZ(10px)' }}
          >
            <div className="px-3 py-1 rounded-full glass-panel shadow-md border border-white flex items-center gap-1.5 text-xs font-bold text-[#08193A]">
              <Zap className="w-3.5 h-3.5 text-[#34D399]" />
              <span className="font-mono">Efficiency {unit.efficiencyKmL} KM/L</span>
            </div>
          </div>

          {/* Chip 5: Total Weight (Bottom Right) */}
          <div 
            className="absolute right-[4%] bottom-[6%] z-20 transition-all hover:scale-105"
            style={{ transform: isHovered ? 'translateZ(50px)' : 'translateZ(10px)' }}
          >
            <div className="px-3 py-1 rounded-full glass-panel shadow-md border border-white flex items-center gap-1.5 text-xs font-bold text-[#08193A]">
              <TrendingUp className="w-3.5 h-3.5 text-[#1B3A7A]" />
              <span className="font-mono">Weight {unit.weightKg.toLocaleString()} KG</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
