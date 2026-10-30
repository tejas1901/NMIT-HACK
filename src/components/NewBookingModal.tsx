import React, { useState, useEffect } from 'react';
import { X, Sparkles, Building2, MapPin, Phone, AlertCircle, ShieldCheck } from 'lucide-react';
import { Consignment, RiskLevel } from '../types';

export const CARRIER_COMPANIES = [
  {
    name: 'FreightIQ Intermodal Command',
    code: 'FIQ',
    adminEmail: 'admin@gmail.com',
    corridor: 'NH-48 (Mumbai - Bengaluru)',
    rating: '4.9/5',
    availableSlots: '12 Container Slots',
    availableRoutes: ['Mumbai JNPT → Bengaluru Peenya', 'Delhi Tughlakabad → Mumbai Port']
  },
  {
    name: 'Vikas Intermodal Logistics',
    code: 'VIL',
    adminEmail: 'admin.vikas@intermodal.in',
    corridor: 'Western Industrial Freight Corridor',
    rating: '4.8/5',
    availableSlots: '8 Multi-axle Units',
    availableRoutes: ['JNPT Nhava Sheva → Pune Chakan', 'Surat Textile Hub → Mumbai JNPT']
  },
  {
    name: 'Blue Dart Express Freight',
    code: 'BDE',
    adminEmail: 'ops@bluedart.in',
    corridor: 'Southern Coastal Freight Trunk',
    rating: '4.9/5',
    availableSlots: '6 Cold-Chain Reefers',
    availableRoutes: ['Chennai Harbour → Bengaluru Whitefield', 'Hyderabad Cherlapally → Chennai']
  },
  {
    name: 'Container Corp of India (CONCOR)',
    code: 'CCR',
    adminEmail: 'admin@concor.gov.in',
    corridor: 'National Golden Rail Quadrilateral',
    rating: '4.7/5',
    availableSlots: '24 Double-Stack Rail Wagons',
    availableRoutes: ['Tughlakabad ICD → Nhava Sheva', 'Nagpur Multi-Modal Hub → Kolkata Port']
  },
  {
    name: 'Navata Road Transport',
    code: 'NRT',
    adminEmail: 'dispatch@navata.in',
    corridor: 'Deccan Regional Logistics Highway',
    rating: '4.6/5',
    availableSlots: '15 Heavy Commercial Rigs',
    availableRoutes: ['Hyderabad → Vijayawada Autonagar', 'Bengaluru Hub → Visakhapatnam Port']
  }
];

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: Partial<Consignment>) => void;
  defaultCarrierCompany?: string;
  currentUser?: {
    company?: string;
    phone?: string;
    address?: string;
    full_name?: string;
    email?: string;
  };
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultCarrierCompany = 'FreightIQ Intermodal Command',
  currentUser
}) => {
  // Carrier Company Selection
  const [carrierCompany, setCarrierCompany] = useState<string>(defaultCarrierCompany);

  // Mandatory Shipper Company Details
  const [shipperCompany, setShipperCompany] = useState(currentUser?.company || 'Vikas Intermodal Corp');
  const [shipperAddress, setShipperAddress] = useState(currentUser?.address || 'Plot 42, Peenya Industrial Area, Phase 3, Bengaluru - 560058');
  const [shipperPhone, setShipperPhone] = useState(currentUser?.phone || '+91 98201 55194');

  // Cargo & Route Details
  const [origin, setOrigin] = useState('Nhava Sheva (JNPT) Terminal, Mumbai');
  const [destination, setDestination] = useState('Peenya Logistics Park, Bengaluru');
  const [department, setDepartment] = useState('Industrial Goods');
  const [weightLbs, setWeightLbs] = useState(38000);
  const [valueUsd, setValueUsd] = useState(12096000);
  const [mode, setMode] = useState('First Class Intermodal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultCarrierCompany) {
      setCarrierCompany(defaultCarrierCompany);
    }
  }, [defaultCarrierCompany]);

  useEffect(() => {
    if (currentUser?.company) setShipperCompany(currentUser.company);
    if (currentUser?.phone) setShipperPhone(currentUser.phone);
    if (currentUser?.address) setShipperAddress(currentUser.address);
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation: Company Name, Address, and Phone Number are strictly mandatory
    if (!shipperCompany.trim()) {
      setValidationError('Customer Company Name is mandatory before booking.');
      return;
    }
    if (!shipperAddress.trim() || shipperAddress.trim().length < 5) {
      setValidationError('Customer Physical / Facility Address is mandatory before booking.');
      return;
    }
    if (!shipperPhone.trim() || shipperPhone.trim().length < 8) {
      setValidationError('Customer Phone Number is mandatory before booking.');
      return;
    }

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
        carrierName: carrierCompany,
        carrierCompany: carrierCompany,
        shipperCompany: shipperCompany.trim(),
        shipperAddress: shipperAddress.trim(),
        shipperPhone: shipperPhone.trim(),
        shipperName: currentUser?.full_name || 'Shipper Lead',
        shipperEmail: currentUser?.email || 'shipper@cargo.in',
        circuitFile: `qpiai_circuit_${circuitId}.qasm`,
        netSavings,
        // MUST BE PENDING APPROVAL until the company's admin accepts
        status: 'PENDING_APPROVAL',
        eta: 'Awaiting Admin Approval',
        notes: `Order submitted by ${shipperCompany.trim()} (${shipperPhone.trim()}). Awaiting acceptance by ${carrierCompany} Admin.`
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-xl glass-panel rounded-[28px] p-6 shadow-[0_24px_70px_rgba(8,25,58,0.35)] border border-white/80 animate-in zoom-in-95 duration-200 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#08193A]/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#34D399]" />
                <span>CARRIER ROUTING & DISPATCH</span>
              </span>
              <span className="text-[10px] text-[#5B6B86] font-semibold">Admin Approval Flow</span>
            </div>
            <h3 className="text-lg font-bold text-[#08193A]">Book Commercial Cargo Capacity</h3>
            <p className="text-xs text-[#5B6B86]">
              Order request will be dispatched directly to the target company's administrator for approval.
            </p>
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
          {/* Section 1: Carrier Company Selection */}
          <div className="p-3.5 rounded-2xl bg-[#08193A]/5 border border-[#08193A]/10 space-y-2">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#08193A] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#1B3A7A]" />
              <span>Select Carrier Company (Order Request Recipient)</span>
            </label>
            <select
              value={carrierCompany}
              onChange={(e) => setCarrierCompany(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold glass-input text-[#08193A] border-white/60 focus:outline-hidden"
            >
              {CARRIER_COMPANIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.corridor}) • {c.availableSlots}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#5B6B86]">
              Admin of <strong className="text-[#08193A]">{carrierCompany}</strong> will receive notification to accept and confirm your shipment.
            </p>
          </div>

          {/* Section 2: MANDATORY Customer Shipper Information */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-xs font-bold text-[#08193A]">
                Customer Verification (Mandatory Before Booking)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B6B86] mb-1">
                  Your Company Name *
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-[#5B6B86] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={shipperCompany}
                    onChange={(e) => setShipperCompany(e.target.value)}
                    placeholder="Enter legal company name..."
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold glass-input text-[#08193A] placeholder-[#5B6B86]/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B6B86] mb-1">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#5B6B86] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={shipperPhone}
                    onChange={(e) => setShipperPhone(e.target.value)}
                    placeholder="+91 98201 55194"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold glass-input text-[#08193A] placeholder-[#5B6B86]/60"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5B6B86] mb-1">
                Pickup / Facility Physical Address *
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-[#5B6B86] absolute left-3 top-2.5" />
                <textarea
                  rows={2}
                  value={shipperAddress}
                  onChange={(e) => setShipperAddress(e.target.value)}
                  placeholder="Enter complete facility address, gate number, postal code..."
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium glass-input text-[#08193A] placeholder-[#5B6B86]/60"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Cargo Route & Parameters */}
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
                <option value="First Class Intermodal">First Class Intermodal</option>
                <option value="Second Class Highway">Second Class Highway</option>
                <option value="Same Day Priority Express">Same Day Priority Express</option>
                <option value="Standard Freight">Standard Freight</option>
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
                max={50000000}
                required
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold font-mono glass-input text-[#08193A]"
              />
            </div>
          </div>

          {validationError && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Predictive Banner */}
          <div className="p-3 rounded-2xl bg-[#A7F3D0]/30 border border-[#34D399]/40 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#08193A] shrink-0" />
            <p className="text-[11px] text-[#08193A] font-medium leading-tight">
              Order will be lodged with status <strong>Pending Approval</strong>. The admin of {carrierCompany} will review and accept dispatch.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#08193A]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#5B6B86] hover:text-[#08193A] hover:bg-white/60 transition-all liquid-btn cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Transmitting Request...' : `Submit Order to ${carrierCompany} Admin`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
