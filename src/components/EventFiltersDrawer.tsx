import { X, DollarSign, Calendar, MapPin, Navigation } from 'lucide-react';
import { useState } from 'react';

interface EventFiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: AdvancedFilters) => void;
  currentFilters: AdvancedFilters;
}

export interface AdvancedFilters {
  priceMin: number;
  priceMax: number;
  startDate: string;
  endDate: string;
  eventType: string;
  city: string;
  distance: number;
}

export default function EventFiltersDrawer({ isOpen, onClose, onApplyFilters, currentFilters }: EventFiltersDrawerProps) {
  const [filters, setFilters] = useState<AdvancedFilters>(currentFilters);

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: AdvancedFilters = {
      priceMin: 0,
      priceMax: 500,
      startDate: '',
      endDate: '',
      eventType: '',
      city: '',
      distance: 50,
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#111] z-50 shadow-2xl border-l border-[#222] transform transition-transform duration-300 ease-out overflow-y-auto drawer-enter">
        <div className="sticky top-0 bg-[#111] z-10 border-b border-[#222] px-6 py-5 flex items-center justify-between">
          <h2 className="text-white font-black text-xl">Advanced Filters</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#1a1a1a] hover:bg-[#282828] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-white font-bold text-sm mb-3">
              <DollarSign className="w-4 h-4 text-streetiz-red" />
              Price Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Min</label>
                <input
                  type="number"
                  value={filters.priceMin}
                  onChange={(e) => setFilters({ ...filters, priceMin: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-streetiz-red transition-colors"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Max</label>
                <input
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({ ...filters, priceMax: parseInt(e.target.value) || 500 })}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-streetiz-red transition-colors"
                  placeholder="500"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              value={filters.priceMax}
              onChange={(e) => setFilters({ ...filters, priceMax: parseInt(e.target.value) })}
              className="w-full mt-3 accent-streetiz-red"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>€{filters.priceMin}</span>
              <span>€{filters.priceMax}</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-white font-bold text-sm mb-3">
              <Calendar className="w-4 h-4 text-streetiz-red" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">From</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-streetiz-red transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">To</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-streetiz-red transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-white font-bold text-sm mb-3">
              <MapPin className="w-4 h-4 text-streetiz-red" />
              Location
            </label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="Enter city name"
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-streetiz-red transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-white font-bold text-sm mb-3">
              <Navigation className="w-4 h-4 text-streetiz-red" />
              Distance (km)
            </label>
            <input
              type="range"
              min="5"
              max="200"
              value={filters.distance}
              onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
              className="w-full accent-streetiz-red"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 km</span>
              <span className="font-bold text-white">{filters.distance} km</span>
              <span>200 km</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#111] border-t border-[#222] p-6 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 bg-[#1a1a1a] hover:bg-[#282828] text-white font-bold py-3 rounded-xl transition-all"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 bg-streetiz-red hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-500/20"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
