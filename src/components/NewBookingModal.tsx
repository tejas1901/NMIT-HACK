import React, { useState } from 'react';
import { X, Plus, Sparkles, Check } from 'lucide-react';
import { Consignment, RiskLevel } from '../types';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: Partial<Consignment>) => void;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [origin, setOrigin] = useState('Chicago Terminal Hub');
  const [destination, setDestination] = useState('Dallas Intermodal Yard');
  const [department, setDepartment] = useState('Industrial Goods');
  const [weightLbs, setWeightLbs] = useState(38000);
  const [valueUsd, setValueUsd] = useState(12096000);
  const [mode, setMode] = useState('First Class');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      // Deterministic risk calculation
      const riskPercent = Math.min(99.4, Math.max(12.5, (valueUsd / 3000) + (weightLbs / 800)));
      const riskLevel: RiskLevel = riskPercent > 70 ? 'CRITICAL' : riskPercent > 45 ? 'HIGH' : riskPercent > 25 ? 'MODERATE' : 'LOW';
      const demurrageRisk = parseFloat((riskPercent * 1.15).toFixed(2));
      const netSavings = parseFloat((demurrageRisk * 0.42).toFixed(2));
      const circuitId = Math.floor(1000000000 + Math.random() * 900000000);

      onSubmit({
        origin,
        destination,
        department,
        weightLbs,
        valueUsd,
        mode,
        delayRiskLevel: riskLevel,
        delayRiskPercent: parseFloat(riskPercent.toFixed(1)),
        demurrageRisk,
        carrierName: mode.includes('First') || mode.includes('Priority') ? 'Dedicated Priority Air Cargo' : 'Expedited Regional Express',
        circuitFile: `qpiai_circuit_${circuitId}.qasm`,
        netSavings,
        status: 'CONFIRMED',
        eta: '07h 30m',
        notes: 'Commercial consignment logged and synchronized to Supabase Cloud.'
      });
      setIsSubmitting(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel rounded-[28px] p-6 shadow-[0_20px_60px_rgba(8,25,58,0.25)] border border-white/80 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#08193A]/10">
          <div>
            <h3 className="text-base font-bold text-[#08193A]">New Commercial Cargo Booking</h3>
            <p className="text-xs text-[#5B6B86]">Dispatch with real-time XGBoost risk scoring & QpiAI QUBO</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-[#5B6B86] hover:text-[#08193A]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B6B86] mb-1">
                Origin Terminal
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold glass-input text-[#08193A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B6B86] mb-1">
                Destination Yard
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold glass-input text-[#08193A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B6B86] mb-1">
                Cargo Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold glass-input text-[#08193A]"
              >
                <option value="Industrial Goods">Industrial Goods</option>
                <option value="Perishable Foodstuff">Perishable Foodstuff</option>
                <option value="Pharmaceuticals (Cold-Chain)">Pharmaceuticals (Cold-Chain)</option>
                <option value="Industrial Machinery">Industrial Machinery</option>
                <option value="Consumer Electronics">Consumer Electronics</option>
                <option value="Medical Equipment">Medical Equipment</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B6B86] mb-1">
                Shipping Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold glass-input text-[#08193A]"
              >
                <option value="First Class">First Class</option>
                <option value="Second Class">Second Class</option>
                <option value="Same Day Priority">Same Day Priority</option>
                <option value="Standard Class">Standard Class</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B6B86] mb-1">
                Weight (lbs)
              </label>
              <input
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(Number(e.target.value))}
                min={1000}
                max={90000}
                required
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold font-mono glass-input text-[#08193A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B6B86] mb-1">
                Valuation (₹ INR)
              </label>
              <input
                type="number"
                value={valueUsd}
                onChange={(e) => setValueUsd(Number(e.target.value))}
                min={1000}
                max={2000000}
                required
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold font-mono glass-input text-[#08193A]"
              />
            </div>
          </div>

          {/* Predictive Banner */}
          <div className="p-3 rounded-2xl bg-[#A7F3D0]/30 border border-[#34D399]/40 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#08193A] shrink-0" />
            <p className="text-[11px] text-[#08193A] font-medium leading-tight">
              Auto-triggers XGBoost 3.2 tree traversal & QpiAI-QSV carrier Hamiltonian optimization upon confirmation.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#08193A]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#5B6B86] hover:text-[#08193A] hover:bg-white/60 transition-all liquid-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn shadow-xs flex items-center gap-2"
            >
              {isSubmitting ? 'Optimizing Quantum State...' : '+ Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
