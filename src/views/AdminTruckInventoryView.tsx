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
  const [editPriceInr, setEditPriceInr] = useState('38500');

  // New truck form state (stored as strings for smooth typing & easy deletion)
  const [newName, setNewName] = useState('FreightIQ Titan Hauler X1');
  const [newCategory, setNewCategory] = useState<TruckListing['category']>('Heavy Haul');
  const [newDailyRateInr, setNewDailyRateInr] = useState('5500');
  const [newPriceInr, setNewPriceInr] = useState('38500');
  const [newRentalDuration, setNewRentalDuration] = useState('7-Day Corridor Lease');
  const [newPayloadLbs, setNewPayloadLbs] = useState('68000');
  const [newHp, setNewHp] = useState('580');
  const [newStock, setNewStock] = useState('4');
  const [newPowertrain, setNewPowertrain] = useState('15.0L Cummins X15 Clean Diesel');

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
    const inr = parseFloat(editPriceInr) || 0;
    const usd = Math.round(inr / 86.4);
    onUpdatePrice(truckId, usd, inr);
    setEditingPriceId(null);
  };

  const handleCreateTruckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inr = Number(newPriceInr) || 38500;
    const usd = Math.round(inr / 86.4);
    const dailyRate = Number(newDailyRateInr) || Math.round(inr / 7);
    const payload = Number(newPayloadLbs) || 65000;
    const stockUnits = Math.max(1, Number(newStock) || 1);
    const hp = Number(newHp) || 550;

    const created: TruckListing = {
      id: `TRK-${Date.now().toString().slice(-6)}`,
      name: newName.trim() || 'FreightIQ Commercial Rig',
      tagline: 'Custom Fleet Calibrated Commercial Class 8 Rig',
      category: newCategory,
      priceUsd: usd,
      priceInr: inr,
      dailyRateInr: dailyRate,
      rentalDuration: newRentalDuration.trim() || '7-Day Corridor Lease',
      payloadLbs: payload,
      payloadKg: Math.round(payload * 0.453592),
      powertrain: newPowertrain.trim() || 'Modular Clean Diesel Hybrid Powertrain',
      horsepower: hp,
      efficiency: newCategory === 'Electric Semi' ? '1.2 kWh / km' : '3.9 km/L (9.2 MPG)',
      rangeKm: newCategory === 'Electric Semi' ? 950 : 2200,
      deliveryTimeline: 'Dispatch in 24 Hours',
      inStock: stockUnits,
      rating: 5.0,
      reviewsCount: 1,
      image: '/assets/aistudio/upscalemedia-transformed_b5694985.jpeg',
      highlights: [
        'Pre-calibrated QpiAI Autonomous Highway Governor',
        'Dual 150-Gallon Polished Aluminum Fuel Cells',
        'Collision Mitigation Radar & Lane-Center Steer'
      ],
      badge: 'NEW ARRIVAL',
      accentColor: '#34D399',
      vinPrefix: '1FUJBBCK4RP',
      reservationStatus: 'AVAILABLE'
    };

    onAddNewTruck(created);
    // Switch to All so newly added truck is immediately visible at the top!
    setSelectedCategory('All');
    setSearchQuery('');
    setIsAddModalOpen(false);

    // Reset form fields
    setNewName('FreightIQ Titan Hauler X1');
    setNewCategory('Heavy Haul');
    setNewDailyRateInr('5500');
    setNewPriceInr('38500');
    setNewRentalDuration('7-Day Corridor Lease');
    setNewPayloadLbs('68000');
    setNewHp('580');
    setNewStock('4');
    setNewPowertrain('15.0L Cummins X15 Clean Diesel');
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
                      value={editPriceInr}
                      onChange={(e) => setEditPriceInr(e.target.value)}
                      placeholder="₹ Spot Price"
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
                          setEditPriceInr(String(truck.priceInr));
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg glass-panel-dark text-white rounded-[28px] p-6 shadow-2xl border border-white/20 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#34D399]/20 border border-[#34D399]/40 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-[#34D399]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white tracking-tight">Register New Commercial Fleet Rig</h3>
                  <p className="text-[11px] text-[#A7F3D0]/80">Instantly cataloged and displayed in customer booking showroom</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTruckSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-white/80 font-bold mb-1">Rig Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FreightIQ Titan Hauler X1"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#34D399]"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-bold mb-1">Fleet Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08193A] border border-white/20 text-white focus:outline-none focus:border-[#34D399]"
                  >
                    <option value="Heavy Haul" className="bg-[#08193A] text-white">Heavy Haul</option>
                    <option value="Electric Semi" className="bg-[#08193A] text-white">Electric Semi</option>
                    <option value="Cold-Chain Reefer" className="bg-[#08193A] text-white">Cold-Chain Reefer</option>
                    <option value="Urban Drayage" className="bg-[#08193A] text-white">Urban Drayage</option>
                    <option value="Intermodal Prime" className="bg-[#08193A] text-white">Intermodal Prime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 font-bold mb-1">Powertrain / Engine</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15.0L Cummins X15 Clean Diesel"
                    value={newPowertrain}
                    onChange={(e) => setNewPowertrain(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#34D399]"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-bold mb-1">Daily Rental Rate (₹ INR / day)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="5500"
                    value={newDailyRateInr}
                    onChange={(e) => setNewDailyRateInr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono focus:outline-none focus:border-[#34D399]"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-bold mb-1">Spot / Full Lease Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="38500"
                    value={newPriceInr}
                    onChange={(e) => setNewPriceInr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono focus:outline-none focus:border-[#34D399]"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-bold mb-1">Rental Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7-Day Corridor Lease"
                    value={newRentalDuration}
                    onChange={(e) => setNewRentalDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#34D399]"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-bold mb-1">Units Available (In Stock)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="4"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono focus:outline-none focus:border-[#34D399]"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-bold mb-1">Payload Capacity (lbs)</label>
                  <input
                    type="number"
                    required
                    min="5000"
                    placeholder="68000"
                    value={newPayloadLbs}
                    onChange={(e) => setNewPayloadLbs(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono focus:outline-none focus:border-[#34D399]"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-bold mb-1">Horsepower (HP)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="580"
                    value={newHp}
                    onChange={(e) => setNewHp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono focus:outline-none focus:border-[#34D399]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] shadow-[0_4px_16px_rgba(52,211,153,0.35)] cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register Rig into Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
