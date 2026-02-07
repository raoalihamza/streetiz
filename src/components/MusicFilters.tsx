import { useRef, useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface FilterOptions {
  genres: string[];
  platforms: string[];
  moods: string[];
}

interface ActiveFilters {
  tab: string;
  genres: string[];
  platforms: string[];
  moods: string[];
  sort: string;
  search: string;
}

interface MusicFiltersProps {
  activeFilters: ActiveFilters;
  onFilterChange: (filters: ActiveFilters) => void;
}

const TABS = [
  'General Feed',
  'Playlists',
  'Remixes',
  'New Releases',
  'Free Downloads',
  'DJ Sets',
  'Podcasts',
  'Articles',
  'Packs',
];

const GENRES = ['Electro', 'Techno', 'Afro House', 'House', 'Breakbeat', 'Tecktonik', 'Melodic'];
const PLATFORMS = ['Spotify', 'Deezer', 'SoundCloud', 'Beatport', 'YouTube'];
const MOODS = ['Dark', 'Rave', 'Chill', 'Melodic', 'Energetic'];
const SORT_OPTIONS = ['Newest', 'Trending', 'Most Played'];

export default function MusicFilters({ activeFilters, onFilterChange }: MusicFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 200;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const updateFilter = (key: keyof ActiveFilters, value: any) => {
    onFilterChange({ ...activeFilters, [key]: value });
  };

  const toggleArrayFilter = (key: 'genres' | 'platforms' | 'moods', value: string) => {
    const current = activeFilters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const resetFilters = () => {
    onFilterChange({
      tab: 'General Feed',
      genres: [],
      platforms: [],
      moods: [],
      sort: 'Newest',
      search: '',
    });
    setShowAdvancedFilters(false);
  };

  const getActiveFilterText = () => {
    const parts = [activeFilters.tab];
    if (activeFilters.genres.length > 0) parts.push(...activeFilters.genres);
    if (activeFilters.platforms.length > 0) parts.push(...activeFilters.platforms);
    if (activeFilters.moods.length > 0) parts.push(...activeFilters.moods);
    return `You're viewing: ${parts.join(' · ')}`;
  };

  const hasActiveFilters =
    activeFilters.genres.length > 0 ||
    activeFilters.platforms.length > 0 ||
    activeFilters.moods.length > 0 ||
    activeFilters.search !== '';

  return (
    <div className="sticky top-20 z-30 bg-[#0F0F0F]/98 backdrop-blur-lg border-b border-[#282828] py-4">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mb-4 group">
          <button
            onClick={() => scroll(tabsRef, 'left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-[#181818] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div
            ref={tabsRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => updateFilter('tab', tab)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeFilters.tab === tab
                    ? 'bg-streetiz-red text-white shadow-lg shadow-streetiz-red/30'
                    : 'bg-[#181818] text-gray-400 hover:bg-[#282828] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => scroll(tabsRef, 'right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-[#181818] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative mb-4 lg:mb-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={activeFilters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Quick search..."
                className="w-full bg-[#181818] border border-[#282828] rounded-full py-3 pl-12 pr-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-streetiz-red transition-colors"
              />
            </div>

            <div className="relative group">
              <button
                onClick={() => scroll(filtersRef, 'left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-[#181818] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>

              <div
                ref={filtersRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleArrayFilter('genres', genre)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      activeFilters.genres.includes(genre)
                        ? 'bg-streetiz-red text-white'
                        : 'bg-[#181818] text-gray-400 hover:bg-[#282828] hover:text-white'
                    }`}
                  >
                    {genre}
                  </button>
                ))}

                {PLATFORMS.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => toggleArrayFilter('platforms', platform)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      activeFilters.platforms.includes(platform)
                        ? 'bg-green-600 text-white'
                        : 'bg-[#181818] text-gray-400 hover:bg-[#282828] hover:text-white'
                    }`}
                  >
                    {platform}
                  </button>
                ))}

                {MOODS.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => toggleArrayFilter('moods', mood)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      activeFilters.moods.includes(mood)
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#181818] text-gray-400 hover:bg-[#282828] hover:text-white'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>

              <button
                onClick={() => scroll(filtersRef, 'right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-[#181818] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-[#181818] hover:bg-[#282828] text-white rounded-full text-sm font-bold transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">More Filters</span>
            </button>

            <select
              value={activeFilters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="px-4 py-2 bg-[#181818] border border-[#282828] text-white rounded-full text-sm font-bold focus:outline-none focus:border-streetiz-red transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="p-2 bg-[#181818] hover:bg-[#282828] rounded-full transition-colors"
                title="Reset filters"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 text-sm text-gray-400">
            {getActiveFilterText()}
          </div>
        )}

        {showAdvancedFilters && (
          <div className="mt-4 p-6 bg-[#181818] rounded-xl border border-[#282828]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-white font-bold text-sm mb-3">BPM Range</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    className="flex-1 bg-[#0F0F0F] border border-[#282828] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-streetiz-red"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="flex-1 bg-[#0F0F0F] border border-[#282828] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-streetiz-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-bold text-sm mb-3">Year</label>
                <select className="w-full bg-[#0F0F0F] border border-[#282828] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-streetiz-red cursor-pointer">
                  <option>All Years</option>
                  <option>2025</option>
                  <option>2024</option>
                  <option>2023</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-bold text-sm mb-3">Country</label>
                <input
                  type="text"
                  placeholder="Enter country"
                  className="w-full bg-[#0F0F0F] border border-[#282828] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-streetiz-red"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
