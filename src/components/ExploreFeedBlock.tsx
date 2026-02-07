import { useRef, useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Play, Download, ExternalLink, FileText, Music2, Youtube } from 'lucide-react';

interface FilterState {
  tab: string;
  genres: string[];
  platforms: string[];
  moods: string[];
  sort: string;
  search: string;
}

interface FeedItem {
  id: string;
  type: 'track' | 'playlist' | 'remix' | 'free_download' | 'dj_set' | 'podcast' | 'article' | 'pack';
  title: string;
  artist?: string;
  coverUrl: string;
  tags?: string[];
  platform?: string;
  duration?: number;
  description?: string;
  isVideo?: boolean;
  onPlay?: () => void;
  onDownload?: () => void;
  externalUrl?: string;
}

interface ExploreFeedBlockProps {
  feedItems: FeedItem[];
  onFilterChange: (filters: FilterState) => void;
}

const TABS = [
  'All',
  'New',
  'Remixes',
  'DJ Sets',
  'Free DL',
  'Podcasts',
  'Articles',
  'Packs',
];

const GENRES = ['Electro', 'Techno', 'Afro House', 'House', 'Breakbeat'];
const PLATFORMS = ['YouTube', 'SoundCloud', 'Spotify', 'Deezer', 'Beatport'];
const MOODS = ['Dark', 'Rave', 'Chill', 'Melodic'];
const SORT_OPTIONS = ['Newest', 'Trending', 'Most Played'];

export default function ExploreFeedBlock({ feedItems, onFilterChange }: ExploreFeedBlockProps) {
  const [filters, setFilters] = useState<FilterState>({
    tab: 'All',
    genres: [],
    platforms: [],
    moods: [],
    sort: 'Newest',
    search: '',
  });
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

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleArrayFilter = (key: 'genres' | 'platforms' | 'moods', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const resetFilters = () => {
    const defaultFilters = {
      tab: 'All',
      genres: [],
      platforms: [],
      moods: [],
      sort: 'Newest',
      search: '',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setShowAdvancedFilters(false);
  };

  const getActiveFilterText = () => {
    const parts = ['Browsing:', filters.tab];
    if (filters.genres.length > 0) parts.push(...filters.genres);
    if (filters.platforms.length > 0) parts.push(...filters.platforms);
    if (filters.moods.length > 0) parts.push(...filters.moods);
    parts.push(filters.sort);
    return parts.join(' · ');
  };

  const hasActiveFilters =
    filters.genres.length > 0 ||
    filters.platforms.length > 0 ||
    filters.moods.length > 0 ||
    filters.search !== '';

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'podcast':
        return <Music2 className="w-5 h-5" />;
      case 'article':
        return <FileText className="w-5 h-5" />;
      default:
        return <Play className="w-5 h-5" />;
    }
  };

  const getPlatformIcon = (platform?: string) => {
    if (!platform) return null;

    switch (platform.toLowerCase()) {
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'soundcloud':
        return <Music2 className="w-4 h-4" />;
      case 'spotify':
        return <Music2 className="w-4 h-4" />;
      default:
        return <Music2 className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform?: string) => {
    if (!platform) return 'bg-gray-600';

    switch (platform.toLowerCase()) {
      case 'youtube':
        return 'bg-red-600';
      case 'soundcloud':
        return 'bg-orange-600';
      case 'spotify':
        return 'bg-green-600';
      case 'deezer':
        return 'bg-blue-600';
      case 'beatport':
        return 'bg-cyan-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white mb-1">Explore Feed</h2>
        <p className="text-gray-400 text-sm">All music, videos, and content in one place</p>
      </div>

      <div className="relative mb-6 group">
        <button
          onClick={() => scroll(tabsRef, 'left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-[#181818] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <div
          ref={tabsRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => updateFilter('tab', tab)}
              className={`flex-shrink-0 px-6 py-3 rounded-full text-sm font-bold transition-all ${
                filters.tab === tab
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

      <div className="relative mb-6 group">
        <button
          onClick={() => scroll(filtersRef, 'left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-[#181818] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        <div
          ref={filtersRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleArrayFilter('genres', genre)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filters.genres.includes(genre)
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
                filters.platforms.includes(platform)
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
                filters.moods.includes(mood)
                  ? 'bg-blue-600 text-white'
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

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search tracks, artists, labels..."
            className="w-full bg-[#181818] border border-[#282828] rounded-full py-3 pl-12 pr-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-streetiz-red transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-[#181818] hover:bg-[#282828] text-white rounded-full text-sm font-bold transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">More Filters</span>
          </button>

          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="px-4 py-3 bg-[#181818] border border-[#282828] text-white rounded-full text-sm font-bold focus:outline-none focus:border-streetiz-red transition-colors cursor-pointer"
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
              className="p-3 bg-[#181818] hover:bg-[#282828] rounded-full transition-colors"
              title="Reset filters"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {(hasActiveFilters || filters.tab !== 'All') && (
        <div className="mb-6 text-sm text-gray-400 bg-[#181818] rounded-lg px-4 py-3">
          {getActiveFilterText()}
        </div>
      )}

      {showAdvancedFilters && (
        <div className="mb-6 p-6 bg-[#181818] rounded-xl border border-[#282828]">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feedItems.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="text-gray-500 text-lg mb-2">No items found</div>
            <p className="text-gray-600 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          feedItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#181818] rounded-xl overflow-hidden hover:bg-[#202020] transition-all group"
            >
              <div className="relative aspect-square">
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={item.onPlay}
                    className="w-14 h-14 bg-streetiz-red rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  >
                    {item.isVideo ? (
                      <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                    ) : (
                      getItemIcon(item.type)
                    )}
                  </button>
                </div>

                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {item.tags && item.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {item.platform && (
                  <div className="absolute top-3 right-3">
                    <div className={`${getPlatformColor(item.platform)} p-1.5 rounded-lg backdrop-blur-sm`}>
                      {getPlatformIcon(item.platform)}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-white font-bold text-sm truncate mb-1 group-hover:text-streetiz-red transition-colors">
                  {item.title}
                </h3>
                {item.artist && (
                  <p className="text-gray-400 text-xs truncate mb-3">{item.artist}</p>
                )}

                <div className="flex items-center gap-2">
                  {item.externalUrl && (
                    <button
                      onClick={() => window.open(item.externalUrl, '_blank')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#282828] hover:bg-[#383838] rounded-lg transition-colors text-xs font-bold text-gray-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open</span>
                    </button>
                  )}
                  {item.onDownload && (
                    <button
                      onClick={item.onDownload}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#282828] hover:bg-green-600 rounded-lg transition-colors text-xs font-bold text-gray-300 hover:text-white"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Free DL</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
