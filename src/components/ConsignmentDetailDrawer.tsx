import React, { useState } from 'react';
import { X, ShieldAlert, Truck, FileText, CheckCircle2, ArrowRight, Activity, DollarSign, Calendar, MapPin } from 'lucide-react';
import { Consignment } from '../types';
import { formatInr } from '../lib/currency';

interface ConsignmentDetailDrawerProps {
  consignment: Consignment | null;
  onClose: () => void;
  onRerunRisk: (id: string) => void;
  onReassignCarrier: (id: string) => void;
}

export const ConsignmentDetailDrawer: React.FC<ConsignmentDetailDrawerProps> = ({
  consignment,
  onClose,
  onRerunRisk,
  onReassignCarrier
}) => {
  const [activeTab, setActiveTab] = useState<'shipping' | 'risk' | 'carrier' | 'documents'>('shipping');

  if (!consignment) return null;

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return { color: 'text-[#F26D6D]', bg: 'bg-[#F26D6D]/15', border: 'border-[#F26D6D]/40', dot: 'bg-[#F26D6D]' };
      case 'HIGH':
        return { color: 'text-[#F59E5B]', bg: 'bg-[#F59E5B]/15', border: 'border-[#F59E5B]/40', dot: 'bg-[#F59E5B]' };
      case 'MODERATE':
        return { color: 'text-[#F6C65B]', bg: 'bg-[#F6C65B]/15', border: 'border-[#F6C65B]/40', dot: 'bg-[#F6C65B]' };
      default:
        return { color: 'text-[#34D399]', bg: 'bg-[#34D399]/15', border: 'border-[#34D399]/40', dot: 'bg-[#34D399]' };
    }
  };

  const riskStyle = getRiskBadge(consignment.delayRiskLevel);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[540px] h-full glass-panel shadow-[0_20px_70px_rgba(8,25,58,0.22)] border-l border-white/80 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300"
        style={{ borderRadius: '28px 0 0 28px' }}
      >
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#08193A]/10">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-lg text-[#08193A] tracking-tight">
                {consignment.id}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${riskStyle.bg} ${riskStyle.color} ${riskStyle.border}`}>
                <span className={`w-2 h-2 rounded-full ${riskStyle.dot}`} />
                {consignment.delayRiskLevel} {consignment.delayRiskPercent.toFixed(1)}%
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close consignment drawer"
              className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-[#5B6B86] hover:text-[#08193A] hover:bg-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Master Detail Segmented Tabs (Reference A) */}
          <div className="grid grid-cols-4 p-1 rounded-full bg-[#08193A]/5 border border-white/60 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('shipping')}
              className={`py-1.5 rounded-full transition-all liquid-btn ${
                activeTab === 'shipping' ? 'bg-[#08193A] text-white shadow-xs' : 'text-[#5B6B86] hover:text-[#08193A]'
              }`}
            >
              Shipping Info
            </button>
            <button
              onClick={() => setActiveTab('risk')}
              className={`py-1.5 rounded-full transition-all liquid-btn ${
                activeTab === 'risk' ? 'bg-[#08193A] text-white shadow-xs' : 'text-[#5B6B86] hover:text-[#08193A]'
              }`}
            >
              Risk Analysis
            </button>
            <button
              onClick={() => setActiveTab('carrier')}
              className={`py-1.5 rounded-full transition-all liquid-btn ${
                activeTab === 'carrier' ? 'bg-[#08193A] text-white shadow-xs' : 'text-[#5B6B86] hover:text-[#08193A]'
              }`}
            >
              Carrier
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-1.5 rounded-full transition-all liquid-btn ${
                activeTab === 'documents' ? 'bg-[#08193A] text-white shadow-xs' : 'text-[#5B6B86] hover:text-[#08193A]'
              }`}
            >
              Documents
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            {activeTab === 'shipping' && (
              <div className="space-y-4">
                {/* Route Box */}
                <div className="p-4 rounded-[20px] bg-white/70 border border-white/90 shadow-xs space-y-3">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
                    Routing Corridor
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-3 h-3 rounded-full border-2 border-[#08193A] bg-[#34D399]" />
                      <div className="w-0.5 h-6 bg-gradient-to-b from-[#08193A] to-[#34D399]" />
                      <div className="w-3 h-3 rounded-full border-2 border-[#08193A] bg-[#08193A]" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="text-[10px] text-[#5B6B86] uppercase font-bold tracking-wide">Origin Hub</p>
                        <p className="text-sm font-semibold text-[#08193A]">{consignment.origin}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#5B6B86] uppercase font-bold tracking-wide">Destination Yard</p>
                        <p className="text-sm font-semibold text-[#08193A]">{consignment.destination}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-[18px] bg-white/60 border border-white/80">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">Department</p>
                    <p className="text-sm font-bold text-[#08193A] mt-1">{consignment.department}</p>
                  </div>
                  <div className="p-3.5 rounded-[18px] bg-white/60 border border-white/80">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">Shipping Mode</p>
                    <p className="text-sm font-bold text-[#08193A] mt-1">{consignment.mode}</p>
                  </div>
                  <div className="p-3.5 rounded-[18px] bg-white/60 border border-white/80">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">Total Weight</p>
                    <p className="text-sm font-bold text-[#08193A] mt-1 font-mono">{consignment.weightLbs.toLocaleString()} lbs</p>
                  </div>
                  <div className="p-3.5 rounded-[18px] bg-white/60 border border-white/80">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">Cargo Valuation</p>
                    <p className="text-sm font-bold text-[#08193A] mt-1 font-mono">{formatInr(consignment.valueUsd)}</p>
                  </div>
                </div>

                {/* Driver Info Tile */}
                <div className="p-3.5 rounded-[18px] bg-white/60 border border-white/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold tracking-wider uppercase text-[#5B6B86]">Assigned Driver</p>
                    <p className="text-sm font-bold text-[#08193A]">{consignment.driverName || 'Regional Telematics Unit'}</p>
                    <p className="text-xs text-[#5B6B86] font-mono">{consignment.driverPhone || '+91 1800 242 8000'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold tracking-wider uppercase text-[#5B6B86]">ETA Target</p>
                    <p className="text-sm font-bold text-[#34D399] font-mono">{consignment.eta}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'risk' && (
              <div className="space-y-4">
                <div className="p-4 rounded-[20px] bg-[#08193A] text-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#A7F3D0] uppercase font-bold tracking-wider">
                      XGBoost 3.2 Invariant Analysis
                    </span>
                    <span className="text-xs font-mono text-white/70">Tree Depth: 6</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[11px] text-white/60 uppercase font-bold">Predicted Late Probability</p>
                      <p className="text-3xl font-extrabold font-mono text-white">
                        {consignment.delayRiskPercent.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-white/60 uppercase font-bold">Demurrage At Risk</p>
                      <p className="text-2xl font-bold font-mono text-[#F26D6D]">
                        {formatInr(consignment.demurrageRisk)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-[20px] bg-white/70 border border-white/90 space-y-2">
                  <p className="text-xs font-bold text-[#08193A]">Risk Mitigation Recommendation</p>
                  <p className="text-xs text-[#5B6B86] leading-relaxed">
                    XGBoost model detects heavy departure bottlenecks and high cargo density. Expedited Regional carrier slot assigned via QpiAI Quantum QUBO minimizes delay penalties by <span className="font-bold text-[#34D399]">+{formatInr(consignment.netSavings)}</span>.
                  </p>
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => onRerunRisk(consignment.id)}
                      className="px-3.5 py-2 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn"
                    >
                      Re-run XGBoost Analysis
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'carrier' && (
              <div className="space-y-4">
                <div className="p-4 rounded-[20px] bg-white/70 border border-white/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B86]">
                      QpiAI Quantum QUBO Selection
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40">
                      Optimal Ground State |010⟩
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#08193A]">{consignment.carrierName}</p>
                    <p className="text-xs font-mono text-[#5B6B86] mt-0.5">{consignment.circuitFile}</p>
                  </div>
                  <div className="pt-2 border-t border-[#08193A]/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#5B6B86]">Net Savings Generated</p>
                      <p className="text-lg font-bold font-mono text-[#34D399]">
                        +{formatInr(consignment.netSavings)}
                      </p>
                    </div>
                    <button
                      onClick={() => onReassignCarrier(consignment.id)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold text-[#08193A] border border-[#08193A]/30 hover:bg-[#08193A]/5 liquid-btn"
                    >
                      Reassign Carrier
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-[18px] bg-white/60 border border-white/80 flex items-center justify-between hover:bg-white/80 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#1B3A7A]" />
                    <div>
                      <p className="text-xs font-bold text-[#08193A]">Bill of Lading ({consignment.id}.pdf)</p>
                      <p className="text-[10px] text-[#5B6B86]">Signed electronic manifest · 244 KB</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#1B3A7A]">View</span>
                </div>
                <div className="p-3.5 rounded-[18px] bg-white/60 border border-white/80 flex items-center justify-between hover:bg-white/80 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#34D399]" />
                    <div>
                      <p className="text-xs font-bold text-[#08193A]">QpiAI Quantum Certificate (.qasm)</p>
                      <p className="text-[10px] text-[#5B6B86]">{consignment.circuitFile} · Verified</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#34D399]">Export</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-[#08193A]/10 flex items-center justify-between gap-3">
          <button
            onClick={() => onRerunRisk(consignment.id)}
            className="flex-1 py-2.5 rounded-full text-xs font-bold text-[#08193A] border border-[#08193A]/30 hover:bg-white transition-all liquid-btn text-center"
          >
            Re-run Risk
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn text-center shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
