import React, { useState, useEffect } from 'react';
import { Radio, AlertCircle, CheckCircle2, CloudRain } from 'lucide-react';
import { Role } from '../types';

interface LiveEventTickerProps {
  onTriggerToast?: (msg: string) => void;
  role?: Role;
}

export const LiveEventTicker: React.FC<LiveEventTickerProps> = ({ 
  onTriggerToast,
  role = 'customer'
}) => {
  const customerEvents = [
    { text: "Weather Advisory: Khandala Ghat pass light drizzle detected. Safe governor speed active.", icon: CloudRain, color: "text-[#F6C65B]" },
    { text: "Western Corridor NH-48: Traffic flow normal at 68 km/h. Clear skies reported.", icon: CheckCircle2, color: "text-[#34D399]" },
    { text: "Consignment CRG-24551: L-Band satellite GPS beacon active at KM 82 Ghat Pass.", icon: Radio, color: "text-[#34D399]" },
    { text: "Delivery Progress: Pune Chakan terminal clear. Autonomous relay corridor on schedule.", icon: CheckCircle2, color: "text-[#6EE7B7]" }
  ];

  const adminEvents = [
    { text: "Unit #8809 DTC P0299 raised: Turbocharger underboost logged to CAN-bus diagnostics.", icon: AlertCircle, color: "text-[#F59E5B]" },
    { text: "Governor limit enforced: Khandala Ghat mountain pass speed cap locked at 55 km/h.", icon: CloudRain, color: "text-[#F6C65B]" },
    { text: "QpiAI Quantum QUBO re-converged: Ground state |010⟩ saved ₹34,800 INR demurrage.", icon: CheckCircle2, color: "text-[#34D399]" },
    { text: "JNPT ICEGATE customs hold cleared: Autonomous bypass corridor authorization issued.", icon: CheckCircle2, color: "text-[#6EE7B7]" },
    { text: "Open-Meteo REST API batch: 5/5 NH-48 waypoints resampled with 0% data loss.", icon: Radio, color: "text-[#34D399]" }
  ];

  const events = role === 'admin' ? adminEvents : customerEvents;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsAgo, setSecondsAgo] = useState(3);

  useEffect(() => {
    setCurrentIndex(0);
  }, [role]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
      setSecondsAgo(0);
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length]);

  useEffect(() => {
    const secTimer = setInterval(() => {
      setSecondsAgo((s) => s + 1);
    }, 1000);
    return () => clearInterval(secTimer);
  }, []);

  const currentEvent = events[currentIndex] || events[0];
  const Icon = currentEvent.icon;

  return (
    <div className="w-full mb-6 p-2.5 px-4 rounded-full glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs border border-white/80">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 flex items-center gap-1.5 shrink-0 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-heartbeat" />
          <span>{role === 'admin' ? 'SYSTEM TELEMETRY FEED' : 'LIVE CONSIGNMENT RADAR'}</span>
        </span>

        <div className="flex items-center gap-2 truncate text-xs font-semibold text-[#08193A]">
          <Icon className={`w-3.5 h-3.5 shrink-0 ${currentEvent.color}`} />
          <span className="truncate">{currentEvent.text}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-[11px] font-mono text-[#5B6B86]">
        <span className="flex items-center gap-1 text-[#34D399]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
          <span>Updated {secondsAgo}s ago</span>
        </span>
      </div>
    </div>
  );
};
