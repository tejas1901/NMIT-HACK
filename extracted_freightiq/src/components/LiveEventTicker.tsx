import React, { useState, useEffect } from 'react';
import { Radio, AlertCircle, ArrowUpRight, CheckCircle2, CloudRain, Bell } from 'lucide-react';

interface LiveEventTickerProps {
  onTriggerToast?: (msg: string) => void;
}

export const LiveEventTicker: React.FC<LiveEventTickerProps> = ({ onTriggerToast }) => {
  const events = [
    { text: "Unit #8809 cleared KM 128 Western Ghats: Traffic flow normal at 58 km/h", icon: CheckCircle2, color: "text-[#34D399]" },
    { text: "JNPT ICEGATE customs hold detected: Automated AI bypass route suggested", icon: AlertCircle, color: "text-[#F59E5B]" },
    { text: "Open-Meteo radar refreshed 12 waypoints: Clear visibility along Hubballi NH-48", icon: Radio, color: "text-[#34D399]" },
    { text: "QpiAI Quantum QUBO re-converged: Ground state |010⟩ saved ₹8,42,000 Demurrage", icon: CheckCircle2, color: "text-[#6EE7B7]" },
    { text: "Pune Chakan waypoint: Light drizzle detected, safe governor speed set to 55 km/h", icon: CloudRain, color: "text-[#F6C65B]" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsAgo, setSecondsAgo] = useState(1);

  useEffect(() => {
    // Cycle events every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % events.length;
        if (onTriggerToast && Math.random() > 0.6) {
          // Trigger subtle toast occasionally
          onTriggerToast(events[next].text);
        }
        return next;
      });
      setSecondsAgo(0);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update "seconds ago" timer every second
  useEffect(() => {
    const secTimer = setInterval(() => {
      setSecondsAgo((s) => s + 1);
    }, 1000);
    return () => clearInterval(secTimer);
  }, []);

  const currentEvent = events[currentIndex];
  const Icon = currentEvent.icon;

  return (
    <div className="w-full mb-6 p-2.5 px-4 rounded-full glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs border border-white/80">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Heartbeat LIVE capsule */}
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 flex items-center gap-1.5 shrink-0 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-heartbeat" />
          <span>LIVE TELEMETRY</span>
        </span>

        {/* Current cycling event with transition */}
        <div className="flex items-center gap-2 truncate text-xs font-semibold text-[#08193A]">
          <Icon className={`w-3.5 h-3.5 shrink-0 ${currentEvent.color}`} />
          <span className="truncate">{currentEvent.text}</span>
        </div>
      </div>

      {/* Real counting "Updated Xs ago" badge */}
      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-[11px] font-mono text-[#5B6B86]">
        <span className="flex items-center gap-1 text-[#34D399]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
          <span>Updated {secondsAgo}s ago</span>
        </span>
      </div>
    </div>
  );
};
