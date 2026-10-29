import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Edit3, 
  Plus, 
  Check, 
  ShoppingBag, 
  Sparkles, 
  Star, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  SlidersHorizontal,
  X,
  Package
} from 'lucide-react';
import { TruckListing } from '../types';
import { AdminBadge } from '../components/AdminBadge';
import { formatInr } from '../lib/currency';

interface AdminTruckInventoryViewProps {
  catalog: TruckListing[];
  onUpdateStock: (truckId: string, newStock: number) => void;
  onUpdatePrice: (truckId: string, newPriceUsd: number, newPriceInr: number) => void;
  onAddNewTruck: (newTruck: TruckListing) => void;
  onToggleReservation: (truckId: string, status: 'AVAILABLE' | 'RESERVED' | 'SOLD', customerName?: string) => void;
}

export const AdminTruckInventoryView: React.FC<AdminTruckInventoryViewProps> = ({
  catalog,
  onUpdateStock,
  onUpdatePrice,
  onAddNewTruck,
  onToggleReservation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceUsd, setEditPriceUsd] = useState('12280000');

  // New truck form state
  const [newName, setNewName] = useState('FreightIQ UltraMax Hydrogen Rig');
  const [newCategory, setNewCategory] = useState<TruckListing['category']>('Heavy Haul');
  const [newPriceUsd, setNewPriceUsd] = useState(16848000);
  const [newPayloadLbs, setNewPayloadLbs] = useState(65000);
  const [newHp, setNewHp] = useState(600);
  const [newStock, setNewStock] = useState(3);

  const categories = ['All', 'Heavy Haul', 'Electric Semi', 'Cold-Chain Reefer', 'Urban Drayage', 'Intermodal Prime'];

  const filtered = catalog.filter((truck) => {
    const matchesCategory = selectedCategory === 'All' || truck.category === selectedCategory;
    const matchesSearch = 
      truck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.powertrain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSavePrice = (truckId: string) => {
    const usd = parseFloat(editPriceUsd);
    const inr = Math.round(usd * 86.4);
    onUpdatePrice(truckId, usd, inr);
    setEditingPriceId(null);
  };

  const handleCreateTruckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: TruckListing = {
      id: `TRK-CUST-${Date.now().toString().slice(-4)}`,
      name: newName,
      tagline: 'Custom Fleet Calibrated Commercial Class 8 Rig',
      category: newCategory,
      priceUsd: Number(newPriceUsd),
      priceInr: Math.round(Number(newPriceUsd) * 86.4),
      payloadLbs: Number(newPayloadLbs),
      payloadKg: Math.round(Number(newPayloadLbs) * 0.453592),
      powertrain: 'Modular Heavy-Duty Hybrid Powertrain',
      horsepower: Number(newHp),
      efficiency: '4.1 km/L (9.6 MPG)',
      rangeKm: 2100,
      deliveryTimeline: '5 - 7 Business Days',
      inStock: Number(newStock),
      rating: 5.0,
      reviewsCount: 1,
      image: '/assets/aistudio/upscalemedia-transformed_b5694985.jpeg',
      highlights: [
        'Pre-calibrated QpiAI Autonomous Highway Governor',
        'Collision Mitigation Radar & Lane-Center Steer'
      ],
      badge: 'NEW ARRIVAL',
      accentColor: '#34D399',
      vinPrefix: '1FUJBBCK4RP',
      reservationStatus: 'AVAILABLE'
    };
    onAddNewTruck(created);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#08193A] text-[#A7F3D0] border border-[#34D399]/40 flex items-center gap-1.5">
              <Truck className="w-3 h-3 text-[#34D399]" />
              <span>TRUCK INVENTORY & SALES MANAGEMENT</span>
            </span>
            <AdminBadge label="FLEET MERCHANDISING" />
            <span className="text-xs text-[#5B6B86] font-medium">• Commercial Catalog Master</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
            Commercial Fleet Catalog & Inventory Master
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-3xl">
            Control vehicle showroom stock, edit spot price tiers in USD and INR, track client reservations, and register new commercial rig configurations.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
          <div className="px-3.5 py-1.5 rounded-full bg-white/70 border border-white flex items-center gap-1.5 text-xs font-mono font-bold text-[#08193A] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#34D399]" />
            <span>PRICING: INR (₹)</span>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] shadow-[0_4px_16px_rgba(8,25,58,0.22)] liquid-btn flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#34D399]" />
            <span>Add Truck Model</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="p-4 rounded-[24px] glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#5B6B86] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog by model, powertrain, category..."
            className="w-full pl-9 pr-4 py-2 rounded-full text-xs font-medium glass-input text-[#08193A] placeholder-[#5B6B86]/70"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all shrink-0 liquid-btn cursor-pointer ${
                  isActive
                    ? 'bg-[#08193A] text-white shadow-xs'
                    : 'bg-white/60 text-[#5B6B86] hover:bg-white hover:text-[#08193A] border border-white/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Grid with Admin Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((truck) => {
          const isReserved = truck.reservationStatus === 'RESERVED';

          return (
            <div
              key={truck.id}
              className="p-5 rounded-[30px] glass-panel hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 border border-white/80 relative"
            >
              <div>
                {/* Badge & Reservation Tag */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 shadow-2xs">
                    {truck.badge}
                  </span>

                  {/* Reservation Status Pill */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isReserved 
                      ? 'bg-amber-500/20 text-amber-900 border border-amber-500/30' 
                      : 'bg-[#34D399]/20 text-[#08193A]'
                  }`}>
                    {truck.reservationStatus || 'AVAILABLE'}
                  </span>
                </div>

                {/* Profile Image */}
                <div 
                  className="relative w-full rounded-2xl p-3 my-2 bg-gradient-to-b from-[#F4FAF8] to-white border border-white shadow-inner flex items-center justify-center overflow-hidden"
                  style={{ aspectRatio: '16 / 9' }}
                >
                  <img
                    src={truck.image}
                    alt={truck.name}
                    className="w-full h-full object-contain"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                  {truck.reservedBy && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#08193A] text-white font-mono text-[9px] flex items-center gap-1">
                      <Building2 className="w-2.5 h-2.5 text-[#34D399]" />
                      <span>{truck.reservedBy}</span>
                    </div>
                  )}
                </div>

                {/* Name & Tagline */}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#08193A] tracking-tight">
                    {truck.name}
                  </h3>
                  <p className="text-xs text-[#5B6B86] line-clamp-1">{truck.tagline}</p>
                </div>

                {/* Admin Stock Count Modifier */}
                <div className="p-3 rounded-2xl bg-white/70 border border-white/80 my-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#5B6B86] uppercase font-mono block">Showroom Stock:</span>
                    <span className="font-mono font-bold text-sm text-[#08193A]">{truck.inStock} Units In Stock</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateStock(truck.id, Math.max(0, truck.inStock - 1))}
                      className="w-7 h-7 rounded-full bg-white hover:bg-black/5 text-[#08193A] font-bold flex items-center justify-center border border-black/10 cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      onClick={() => onUpdateStock(truck.id, truck.inStock + 1)}
                      className="w-7 h-7 rounded-full bg-[#08193A] text-white hover:bg-[#1B3A7A] font-bold flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Reservation Action */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[10px] text-[#5B6B86] uppercase font-mono">Reservation Lock:</span>
                  <button
                    onClick={() => onToggleReservation(
                      truck.id, 
                      isReserved ? 'AVAILABLE' : 'RESERVED',
                      isReserved ? undefined : 'Apex Global Freight Logistics'
                    )}
                    className="text-[11px] font-bold text-[#1B3A7A] hover:underline cursor-pointer"
                  >
                    {isReserved ? 'Release to Available' : 'Mark as Reserved'}
                  </button>
                </div>
              </div>

              {/* Price & Admin Price Editor */}
              <div className="pt-3 border-t border-black/5 flex items-center justify-between gap-3">
                {editingPriceId === truck.id ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="number"
                      value={editPriceUsd}
                      onChange={(e) => setEditPriceUsd(e.target.value)}
                      className="w-28 px-2 py-1 rounded-xl text-xs font-mono glass-input text-[#08193A]"
                    />
                    <button
                      onClick={() => handleSavePrice(truck.id)}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingPriceId(null)}
                      className="text-xs text-[#5B6B86] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] text-[#5B6B86] uppercase font-semibold block">Commercial Spot Price</span>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xl font-extrabold font-mono text-[#08193A]">
                        {formatInr(truck.priceInr)}
                      </p>
                      <button
                        onClick={() => {
                          setEditingPriceId(truck.id);
                          setEditPriceUsd(String(truck.priceInr));
                        }}
                        className="p-1 rounded-full hover:bg-black/5 text-[#5B6B86] hover:text-[#08193A] cursor-pointer"
                        title="Edit Spot Price"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD TRUCK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-panel-dark text-white rounded-[28px] p-6 shadow-2xl border border-white/20 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-extrabold text-base text-white">Add New Commercial Truck Model</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTruckSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">Model Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#34D399]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#34D399]"
                  >
                    <option value="Heavy Haul">Heavy Haul</option>
                    <option value="Electric Semi">Electric Semi</option>
                    <option value="Cold-Chain Reefer">Cold-Chain Reefer</option>
                    <option value="Urban Drayage">Urban Drayage</option>
                    <option value="Intermodal Prime">Intermodal Prime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Base Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={newPriceUsd}
                    onChange={(e) => setNewPriceUsd(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-mono focus:outline-none focus:border-[#34D399]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-white/70 font-semibold mb-1">Payload (lbs)</label>
                  <input
                    type="number"
                    value={newPayloadLbs}
                    onChange={(e) => setNewPayloadLbs(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-white/70 font-semibold mb-1">Horsepower</label>
                  <input
                    type="number"
                    value={newHp}
                    onChange={(e) => setNewHp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-white/70 font-semibold mb-1">In Stock</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] shadow-md"
                >
                  Register Truck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
