import { X, Calendar, MapPin, Music } from 'lucide-react';
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
  musicGenres: string[];
  battleLevel: string;
  freeEntry: boolean;
  vibes: string[];
}

const MUSIC_GENRES = [
  'Electro', 'Techno', 'Melodic Techno', 'Afro House', 'House',
  'Hardstyle', 'Trance', 'Rave', 'Breakbeat', 'Club / Open Format'
];

const EVENT_TYPES = [
  'Dance Battle', 'Workshop', 'Festival', 'Club Night',
  'Opening / Closing Party', 'Fashion Event'
];


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
      musicGenres: [],
      battleLevel: '',
      freeEntry: false,
      vibes: [],
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const toggleMusicGenre = (genre: string) => {
    setFilters({
      ...filters,
      musicGenres: filters.musicGenres.includes(genre)
        ? filters.musicGenres.filter(g => g !== genre)
        : [...filters.musicGenres, genre]
    });
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
              <Music className="w-4 h-4 text-streetiz-red" />
              Music Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {MUSIC_GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleMusicGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filters.musicGenres.includes(genre)
                      ? 'bg-streetiz-red text-white'
                      : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#282828] hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#333]"></div>

          <div>
            <label className="flex items-center gap-2 text-white font-bold text-sm mb-3">
              <Calendar className="w-4 h-4 text-streetiz-red" />
              Event Types
            </label>
            <div className="space-y-2">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilters({ ...filters, eventType: filters.eventType === type ? '' : type })}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-bold text-left transition-all ${
                    filters.eventType === type
                      ? 'bg-streetiz-red text-white'
                      : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#282828] hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#333]"></div>

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
