import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Atom, 
  DollarSign, 
  Truck, 
  UserCheck, 
  Sparkles, 
  Search, 
  Building2,
  FileCheck
} from 'lucide-react';
import { HaulRequest } from '../types';
import { AdminBadge } from '../components/AdminBadge';
import { formatInr } from '../lib/currency';

interface AdminHaulQueueViewProps {
  haulRequests: HaulRequest[];
  onQuotePrice: (requestId: string, priceUsd: number) => void;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onAssignTruck: (requestId: string, truckId: string, driver: string) => void;
  onOptimizeWithQpiAI: (requestId: string) => void;
}

export const AdminHaulQueueView: React.FC<AdminHaulQueueViewProps> = ({
  haulRequests,
  onQuotePrice,
  onApproveRequest,
  onRejectRequest,
  onAssignTruck,
  onOptimizeWithQpiAI
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [quotingRequestId, setQuotingRequestId] = useState<string | null>(null);
  const [quoteInputUsd, setQuoteInputUsd] = useState('2200');

  const filtered = haulRequests.filter((req) => {
    const matchesSearch = 
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.customerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.cargoCategory.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterStatus === 'New') return req.status === 'NEW';
    if (filterStatus === 'Quoted') return req.status === 'QUOTED';
    if (filterStatus === 'Approved') return req.status === 'APPROVED';
    if (filterStatus === 'Assigned') return req.status === 'ASSIGNED';
    if (filterStatus === 'Rejected') return req.status === 'REJECTED';
    return true;
  });

  const handleApplyQuote = (id: string) => {
    onQuotePrice(id, parseFloat(quoteInputUsd));
    setQuotingRequestId(null);
  };

  const getStatusBadge = (status: HaulRequest['status']) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-900 border border-blue-500/30">NEW SUBMISSION</span>;
      case 'QUOTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-900 border border-amber-500/30">RATE QUOTED</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40">APPROVED BY CLIENT</span>;
      case 'ASSIGNED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1B3A7A]/20 text-[#1B3A7A] border border-[#1B3A7A]/30">RIG ASSIGNED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-900 border border-red-500/30">REJECTED</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#08193A] text-[#A7F3D0] border border-[#34D399]/40 flex items-center gap-1.5">
              <Package className="w-3 h-3 text-[#34D399]" />
              <span>COMMERCIAL HAUL REQUEST QUEUE</span>
            </span>
            <AdminBadge label="ADMIN DISPATCH" />
            <span className="text-xs text-[#5B6B86] font-medium">• Inbound Client Bookings</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
            Client Haul Requests & Dispatch Review
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-3xl">
            Review incoming freight haul requests from commercial shippers. Quote dynamic spot rates, trigger QpiAI QUBO carrier optimization, and allocate rigs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-[#08193A] text-white">
            Queue: {haulRequests.filter(r => r.status === 'NEW' || r.status === 'QUOTED').length} Pending
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-[24px] glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#5B6B86] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by request ID, shipper company, route..."
            className="w-full pl-9 pr-4 py-2 rounded-full text-xs font-medium glass-input text-[#08193A] placeholder-[#5B6B86]/70"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['All', 'New', 'Quoted', 'Approved', 'Assigned', 'Rejected'].map((status) => {
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all shrink-0 liquid-btn cursor-pointer ${
                  isActive
                    ? 'bg-[#08193A] text-white shadow-xs'
                    : 'bg-white/60 text-[#5B6B86] hover:bg-white hover:text-[#08193A] border border-white/80'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filtered.map((req) => (
          <div
            key={req.id}
            className="p-5 md:p-6 rounded-[28px] glass-panel hover:shadow-lg transition-all space-y-4 border border-white/80"
          >
            {/* Header: ID, Customer, Service Tier, Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono font-extrabold text-base md:text-lg text-[#08193A]">
                  {req.id}
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#08193A] text-white flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#34D399]" />
                  <span>{req.customerCompany}</span>
                </span>

                <span className="text-xs text-[#5B6B86]">
                  Contact: <strong>{req.customerName}</strong>
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#1B3A7A]/15 text-[#1B3A7A]">
                  {req.serviceTier}
                </span>

                {getStatusBadge(req.status)}
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[#5B6B86]">
                <Clock className="w-3.5 h-3.5 text-[#1B3A7A]" />
                <span>Submitted: {req.createdAt}</span>
              </div>
            </div>

            {/* Details: Route, Cargo, Weight, Quote */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5B6B86]">Route & Terminals</span>
                <p className="font-semibold text-[#08193A] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1B3A7A] shrink-0" />
                  <span>{req.origin} → {req.destination}</span>
                </p>
                <p className="text-[11px] text-[#5B6B86]">Category: {req.cargoCategory}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5B6B86]">Specifications</span>
                <p className="font-mono font-semibold text-[#08193A]">
                  Weight: {req.weightKg.toLocaleString()} KG (Declared: {formatInr(req.declaredValueUsd)})
                </p>
                {req.notes && (
                  <p className="text-[11px] text-[#5B6B86] italic">"{req.notes}"</p>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-white/60 border border-white/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5B6B86] block">Commercial Pricing Quote</span>
                {req.quotedPriceUsd ? (
                  <div>
                    <span className="font-mono font-extrabold text-base text-[#34D399]">
                      {formatInr(req.quotedPriceInr || req.quotedPriceUsd)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-mono font-bold text-amber-700">Awaiting Dispatch Spot Quote</span>
                )}
                {req.suggestedQpiAiCarrier && (
                  <p className="text-[10px] font-mono text-[#1B3A7A] flex items-center gap-1 mt-1">
                    <Atom className="w-3 h-3 text-[#1B3A7A]" />
                    <span>QUBO: {req.suggestedQpiAiCarrier}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Admin Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-black/5">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Quote Button */}
                {quotingRequestId === req.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={quoteInputUsd}
                      onChange={(e) => setQuoteInputUsd(e.target.value)}
                      placeholder="₹ INR"
                      className="w-28 px-2.5 py-1 rounded-xl text-xs font-mono glass-input text-[#08193A]"
                    />
                    <button
                      onClick={() => handleApplyQuote(req.id)}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] cursor-pointer"
                    >
                      Save Quote
                    </button>
                    <button
                      onClick={() => setQuotingRequestId(null)}
                      className="text-xs text-[#5B6B86] hover:underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setQuotingRequestId(req.id);
                      setQuoteInputUsd(String(req.quotedPriceInr || req.quotedPriceUsd || 171000));
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-white text-[#08193A] hover:bg-[#08193A] hover:text-white border border-black/10 transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{req.quotedPriceUsd ? 'Revise Quote' : 'Quote Fee (₹)'}</span>
                  </button>
                )}

                {/* Optimize with QpiAI */}
                <button
                  onClick={() => onOptimizeWithQpiAI(req.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-white text-[#08193A] hover:bg-[#1B3A7A] hover:text-white border border-black/10 transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Atom className="w-3.5 h-3.5 text-[#1B3A7A]" />
                  <span>Optimize with QpiAI</span>
                </button>

                {/* Assign Truck */}
                <button
                  onClick={() => onAssignTruck(req.id, 'Unit #4021', 'Vikram Malhotra')}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-white text-[#08193A] hover:bg-[#08193A] hover:text-white border border-black/10 transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Truck className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Assign Unit #4021</span>
                </button>
              </div>

              {/* Status Decision Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onApproveRequest(req.id)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Dispatch</span>
                </button>

                <button
                  onClick={() => onRejectRequest(req.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/10 text-red-700 hover:bg-red-500/20 border border-red-500/20 transition-all liquid-btn flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
