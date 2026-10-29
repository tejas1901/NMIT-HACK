import React, { useState } from 'react';
import { X, Plus, Sparkles, Check, AlertTriangle, ShieldCheck, CreditCard, Clock } from 'lucide-react';
import { Consignment, RiskLevel, PaymentStatus } from '../types';

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
  const [origin, setOrigin] = useState('Bengaluru Logistics Park (NH-48)');
  const [destination, setDestination] = useState('Mumbai JNPT Intermodal Yard');
  const [department, setDepartment] = useState('Industrial Goods');
  const [weightLbs, setWeightLbs] = useState(38000);
  const [valueUsd, setValueUsd] = useState(140000);
  const [mode, setMode] = useState('First Class');
  
  // Payment Option State: 'advance70' | 'full100' | 'deferred0'
  const [paymentOption, setPaymentOption] = useState<'advance70' | 'full100' | 'deferred0'>('advance70');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Calculate estimated freight invoice in INR
  const baseRate = mode.includes('Priority') || mode.includes('First') ? 4.8 : 3.6;
  const estimatedFreightInr = Math.round((weightLbs * baseRate) + 25000);
  const required70AdvanceInr = Math.round(estimatedFreightInr * 0.7);

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

      // Determine payment & delay status based on chosen option
      let amountPaidInr = 0;
      let paymentStatus: PaymentStatus = 'UNPAID';
      let isDispatchHeldForPayment = false;
      let transportDelayHours = 0;
      let status: Consignment['status'] = 'CONFIRMED';
      let eta = '07h 30m';
      let notes = '';

      if (paymentOption === 'advance70') {
        amountPaidInr = required70AdvanceInr;
        paymentStatus = 'DISPATCH_CLEARED';
        isDispatchHeldForPayment = false;
        transportDelayHours = 0;
        status = 'CONFIRMED';
        eta = '07h 30m';
        notes = '70% advance deposit paid upfront. Carrier cleared for departure with zero delay.';
      } else if (paymentOption === 'full100') {
        amountPaidInr = estimatedFreightInr;
        paymentStatus = 'FULLY_PAID';
        isDispatchHeldForPayment = false;
        transportDelayHours = 0;
        status = 'CONFIRMED';
        eta = '06h 45m (Priority Transit)';
        notes = '100% full invoice settled. Vehicle priority expedited clearance.';
      } else {
        // Deferred 0% payment
        amountPaidInr = 0;
        paymentStatus = 'UNPAID';
        isDispatchHeldForPayment = true;
        transportDelayHours = 24;
        status = 'HOLD_PAYMENT';
        eta = '07h 30m (+24h Transport Delay)';
        notes = 'Carrier dispatch withheld at origin terminal. Advance payment <70%. Dwell delay active.';
      }

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
        status,
        eta,
        notes,
        totalInvoiceInr: estimatedFreightInr,
        amountPaidInr,
        paymentStatus,
        isDispatchHeldForPayment,
        transportDelayHours,
        paymentDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: paymentOption === 'deferred0' ? 'Pending Clearance' : 'Instant UPI / Direct Clearance'
      });
      setIsSubmitting(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-xl glass-panel rounded-[28px] p-6 shadow-[0_20px_60px_rgba(8,25,58,0.25)] border border-white/80 animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#08193A]/10">
          <div>
            <h3 className="text-base font-bold text-[#08193A]">Book Commercial Cargo</h3>
            <p className="text-xs text-[#5B6B86]">70% Advance Settlement Enforced for Terminal Dispatch Clearance</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-[#5B6B86] hover:text-[#08193A] cursor-pointer"
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
                <option value="Pharmaceuticals (Cold-Chain)">Pharmaceuticals (Cold-Chain)</option>
                <option value="Perishable Foodstuff">Perishable Foodstuff</option>
                <option value="Consumer Electronics">Consumer Electronics</option>
                <option value="Medical Equipment">Medical Equipment</option>
                <option value="Apparel & Textiles">Apparel & Textiles</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B6B86] mb-1">
                Shipping Service Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold glass-input text-[#08193A]"
              >
                <option value="First Class">First Class (Expedited Bypass)</option>
                <option value="Same Day Priority">Same Day Priority</option>
                <option value="Second Class">Second Class (Standard Highway)</option>
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
                min="1000"
                max="80000"
                step="500"
                value={weightLbs}
                onChange={(e) => setWeightLbs(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold glass-input text-[#08193A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B6B86] mb-1">
                Declared Cargo Value (USD)
              </label>
              <input
                type="number"
                min="5000"
                max="2000000"
                step="5000"
                value={valueUsd}
                onChange={(e) => setValueUsd(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold glass-input text-[#08193A]"
              />
            </div>
          </div>

          {/* PAYMENT TERMS & 70% ADVANCE SELECTION */}
          <div className="pt-2 border-t border-[#08193A]/10">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#08193A] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#1B3A7A]" />
                Cargo Payment Terms & Clearance (Estimated: ₹{estimatedFreightInr.toLocaleString('en-IN')})
              </label>
              <span className="text-[10px] font-bold text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#F59E5B]/40">
                70% Advance Policy
              </span>
            </div>

            <div className="space-y-2">
              {/* Option 1: 70% Advance */}
              <label
                onClick={() => setPaymentOption('advance70')}
                className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentOption === 'advance70'
                    ? 'border-[#08193A] bg-[#08193A]/5 shadow-xs'
                    : 'border-black/10 hover:border-black/20'
                }`}
              >
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentOption === 'advance70'}
                  onChange={() => setPaymentOption('advance70')}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#08193A] flex items-center gap-1.5">
                      Pay 70% Required Advance Now
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#34D399]/30 text-[#065F46]">
                        RECOMMENDED
                      </span>
                    </span>
                    <span className="font-extrabold text-xs text-[#08193A]">
                      ₹{required70AdvanceInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#059669] mt-0.5 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Clears carrier dispatch immediately. Zero departure delay.
                  </p>
                </div>
              </label>

              {/* Option 2: 100% Full Payment */}
              <label
                onClick={() => setPaymentOption('full100')}
                className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentOption === 'full100'
                    ? 'border-[#08193A] bg-[#08193A]/5 shadow-xs'
                    : 'border-black/10 hover:border-black/20'
                }`}
              >
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentOption === 'full100'}
                  onChange={() => setPaymentOption('full100')}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#08193A]">
                      Pay Full Amount (100%)
                    </span>
                    <span className="font-extrabold text-xs text-[#08193A]">
                      ₹{estimatedFreightInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5B6B86] mt-0.5">
                    Full invoice settled. Priority express transit green lane clearance.
                  </p>
                </div>
              </label>

              {/* Option 3: Deferred (0% Paid) */}
              <label
                onClick={() => setPaymentOption('deferred0')}
                className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentOption === 'deferred0'
                    ? 'border-[#F26D6D] bg-[#F26D6D]/10 shadow-xs'
                    : 'border-black/10 hover:border-black/20'
                }`}
              >
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentOption === 'deferred0'}
                  onChange={() => setPaymentOption('deferred0')}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#DC2626] flex items-center gap-1.5">
                      Book Now, Pay Later (0% Paid)
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#F26D6D]/30 text-[#DC2626]">
                        CARRIER DELAY INCL.
                      </span>
                    </span>
                    <span className="font-extrabold text-xs text-[#DC2626]">
                      ₹0 Paid
                    </span>
                  </div>
                  <p className="text-[11px] text-[#991B1B] mt-0.5 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <strong>Delay Notice:</strong> Transport held at terminal hub (+24h delay) until at least 70% (₹{required70AdvanceInr.toLocaleString('en-IN')}) is paid.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#08193A]/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#5B6B86] hover:text-[#08193A] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Confirming Dispatch...' : 'Confirm Commercial Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
