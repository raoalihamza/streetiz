import { useEffect, useState, useRef, useCallback } from 'react';
import { Search, Play, Eye, MapPin, X, Map, Grid3x3, ChevronLeft, ChevronRight, Youtube, Music, Instagram, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Video {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  video_url: string;
  video_type: 'youtube' | 'vimeo' | 'tiktok' | 'instagram';
  thumbnail_url: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  year: number | null;
  video_subtype: string | null;
  views: number;
  duration?: string;
  creator?: string;
  is_vertical?: boolean;
}

interface EventPlaylist {
  id: string;
  name: string;
  city: string;
  country: string;
  coverImage: string;
  videoCount: number;
  description: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [displayedVideos, setDisplayedVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<'feed' | 'map'>('feed');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [shortsScrollPosition, setShortsScrollPosition] = useState(0);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const shortsContainerRef = useRef<HTMLDivElement>(null);

  const videosPerPage = 12;
  const categories = ['All', 'Dance', 'Battles', 'DJ Sets', 'Festivals', 'Interviews'];

  const eventPlaylists: EventPlaylist[] = [
    {
      id: '1',
      name: 'LRC',
      city: 'Lyon',
      country: 'France',
      coverImage: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg',
      videoCount: 24,
      description: 'Lyon Rap Convention',
    },
    {
      id: '2',
      name: 'E-WAVES',
      city: 'Milan',
      country: 'Italy',
      coverImage: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
      videoCount: 18,
      description: 'Electronic Music Festival',
    },
    {
      id: '3',
      name: 'E-QUEENZ',
      city: 'Paris',
      country: 'France',
      coverImage: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
      videoCount: 32,
      description: 'Urban Dance Event',
    },
  ];

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    filterAndSortVideos();
  }, [videos, searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    setupInfiniteScroll();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [displayedVideos, currentPage]);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const enrichedVideos = (data || []).map((video: any) => ({
        ...video,
        is_vertical: Math.random() > 0.7,
        creator: 'Streetiz',
        duration: video.duration || `${Math.floor(Math.random() * 10 + 1)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      }));

      setVideos(enrichedVideos);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortVideos = () => {
    let filtered = [...videos];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((video) =>
        video.title.toLowerCase().includes(query) ||
        (video.description && video.description.toLowerCase().includes(query)) ||
        (video.city && video.city.toLowerCase().includes(query)) ||
        (video.country && video.country.toLowerCase().includes(query)) ||
        (video.creator && video.creator.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((video) =>
        video.video_subtype?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        video.title.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
        break;
      case 'trending':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'mostviewed':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
    }

    setDisplayedVideos(filtered);
    setCurrentPage(1);
  };

  const setupInfiniteScroll = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMoreVideos()) {
          loadMoreVideos();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
  }, [loadingMore, currentPage, displayedVideos]);

  const hasMoreVideos = () => {
    return currentPage * videosPerPage < displayedVideos.length;
  };

  const loadMoreVideos = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setCurrentPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 500);
  };

  const openVideoModal = (video: Video) => {
    setSelectedVideo(video);
    document.body.style.overflow = 'hidden';
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedVideo) {
        closeVideoModal();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedVideo]);

  const scrollShorts = (direction: 'left' | 'right') => {
    if (shortsContainerRef.current) {
      const scrollAmount = 280;
      const newPosition = direction === 'left'
        ? Math.max(0, shortsScrollPosition - scrollAmount)
        : shortsScrollPosition + scrollAmount;

      shortsContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth',
      });
      setShortsScrollPosition(newPosition);
    }
  };

  const getPlatformIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'tiktok':
        return <Music className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const verticalVideos = displayedVideos.filter(v => v.is_vertical).slice(0, 12);
  const horizontalVideos = displayedVideos.filter(v => !v.is_vertical);
  const paginatedVideos = horizontalVideos.slice(0, currentPage * videosPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
        <div className="w-16 h-16 border-4 border-[#2a2a2a] border-t-streetiz-red rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-5xl font-black text-white">
              VIDÉOS <span className="text-streetiz-red">STREETIZ</span>
            </h1>

            <button
              onClick={() => setViewMode(viewMode === 'feed' ? 'map' : 'feed')}
              className="fixed top-24 right-8 z-40 flex items-center gap-2 px-5 py-3 bg-[#111] hover:bg-streetiz-red border border-[#333] hover:border-streetiz-red rounded-full font-bold text-white transition-all shadow-xl hover:shadow-streetiz-red/30 group"
            >
              {viewMode === 'feed' ? (
                <>
                  <Map className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Map</span>
                </>
              ) : (
                <>
                  <Grid3x3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Feed</span>
                </>
              )}
            </button>
          </div>

          <div className="relative mb-8">
            <div className="bg-[#151515] rounded-2xl p-4 border border-[#282828]">
              <div className="flex items-center gap-3 flex-wrap">
                <div
                  className={`relative flex-1 min-w-[300px] max-w-[60%] transition-all duration-300 ${
                    isSearchFocused ? 'scale-[1.02]' : 'scale-100'
                  }`}
                >
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    isSearchFocused ? 'text-streetiz-red' : 'text-[#666]'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search videos, artists, countries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className={`w-full pl-12 pr-4 py-3 bg-[#0D0D0D] border-2 rounded-full text-white placeholder-[#666] focus:outline-none transition-all duration-300 ${
                      isSearchFocused
                        ? 'border-streetiz-red shadow-lg shadow-streetiz-red/20'
                        : 'border-[#333] hover:border-[#444]'
                    }`}
                    style={{
                      backdropFilter: 'blur(10px)',
                      animation: isSearchFocused ? 'glow 2s ease-in-out infinite' : 'none',
                    }}
                  />
                  {isSearchFocused && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-streetiz-red/20 via-transparent to-streetiz-red/20 pointer-events-none animate-pulse"></div>
                  )}
                </div>

                <button
                  onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
                  className="flex items-center gap-2 px-5 py-3 bg-[#0D0D0D] border-2 border-[#333] hover:border-streetiz-red rounded-full text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-streetiz-red/20"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-5 py-3 rounded-full bg-[#0D0D0D] text-white text-sm font-bold border-2 border-[#333] hover:border-streetiz-red focus:outline-none focus:border-streetiz-red transition-all cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="trending">Trending</option>
                  <option value="mostviewed">Most Viewed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-30 bg-[#0D0D0D]/95 backdrop-blur-sm py-5 mb-8 -mx-4 px-4 border-b border-[#222]">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 transform ${
                  selectedCategory === cat
                    ? 'bg-streetiz-red text-white shadow-lg shadow-streetiz-red/40 scale-105 animate-bounce-subtle'
                    : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#222] hover:text-white hover:scale-105'
                }`}
                style={{
                  animation: selectedCategory === cat ? 'bounce-subtle 0.5s ease-out' : 'none',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'feed' ? (
          <>
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-white">
                  Shorts / <span className="text-streetiz-red">Vertical</span>
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => scrollShorts('left')}
                    className="w-10 h-10 bg-[#111] border border-[#333] rounded-full flex items-center justify-center hover:bg-streetiz-red hover:border-streetiz-red transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => scrollShorts('right')}
                    className="w-10 h-10 bg-[#111] border border-[#333] rounded-full flex items-center justify-center hover:bg-streetiz-red hover:border-streetiz-red transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <div
                ref={shortsContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {verticalVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex-shrink-0 w-[260px] cursor-pointer group"
                    onClick={() => openVideoModal(video)}
                  >
                    <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-[#111] border border-[#333] group-hover:border-streetiz-red transition-all">
                      <img
                        src={video.thumbnail_url || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>

                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-full">
                        {getPlatformIcon(video.video_type)}
                        <span className="text-xs font-bold text-white">{video.video_type.toUpperCase()}</span>
                      </div>

                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-streetiz-red rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 fill-white ml-1" />
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-sm font-bold text-white mb-1 line-clamp-2">{video.title}</h3>
                        <div className="flex items-center justify-between text-xs text-white/80">
                          <span>{video.creator}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {(video.views || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black text-white mb-6">
                Event <span className="text-streetiz-red">Playlists</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {eventPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="card-premium group cursor-pointer overflow-hidden hover:border-streetiz-red transition-all"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={playlist.coverImage}
                        alt={playlist.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                      <div className="absolute top-4 right-4 bg-streetiz-red px-3 py-1 rounded-full text-sm font-bold">
                        {playlist.videoCount} videos
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-3xl font-black text-white mb-2">{playlist.name}</h3>
                        <p className="text-sm text-white/80 mb-2">{playlist.description}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-streetiz-red" />
                          <span className="text-white font-semibold">{playlist.city}, {playlist.country}</span>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-20 h-20 bg-streetiz-red rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                          <Play className="w-10 h-10 fill-white ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-black text-white mb-6">
                Featured <span className="text-streetiz-red">Videos</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="card-premium group cursor-pointer hover:border-streetiz-red transition-all overflow-hidden"
                    onClick={() => openVideoModal(video)}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={video.thumbnail_url || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs font-bold">
                          {video.duration}
                        </div>
                      )}

                      <div className="absolute top-2 left-2">
                        <div className="flex items-center gap-1 bg-black/70 px-2 py-1 rounded-full">
                          {getPlatformIcon(video.video_type)}
                          <span className="text-xs font-bold">{video.video_type.toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-streetiz-red rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 fill-white ml-1" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-white text-sm mb-2 line-clamp-2 group-hover:text-streetiz-red transition-colors">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-[#666] mb-2">
                        <span>{video.creator}</span>
                        {video.year && <span>{video.year}</span>}
                      </div>
                      {video.city && video.country && (
                        <div className="flex items-center gap-1 text-xs text-[#666]">
                          <MapPin className="w-3 h-3" />
                          <span>{video.city}, {video.country}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-[#666] mt-1">
                        <Eye className="w-3 h-3" />
                        <span>{(video.views || 0).toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {loadingMore && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="card-premium animate-pulse">
                      <div className="aspect-video bg-[#1a1a1a] rounded-t-xl"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-[#1a1a1a] rounded w-3/4"></div>
                        <div className="h-3 bg-[#1a1a1a] rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-8">
                {!loadingMore && hasMoreVideos() && (
                  <div className="text-[#666] text-sm">Scroll to load more...</div>
                )}
                {!hasMoreVideos() && horizontalVideos.length > 0 && (
                  <div className="text-[#666] text-sm">You've seen it all</div>
                )}
              </div>

              {displayedVideos.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-[#a0a0a0] text-lg">No videos found</p>
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="card-premium p-8 min-h-[600px] flex items-center justify-center">
            <div className="text-center">
              <Map className="w-20 h-20 text-streetiz-red mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Map View Coming Soon</h3>
              <p className="text-[#a0a0a0]">Interactive world map with video markers</p>
            </div>
          </div>
        )}
      </div>

      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeVideoModal}
        >
          <button
            onClick={closeVideoModal}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div
            className="w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-black rounded-xl overflow-hidden shadow-2xl ${selectedVideo.is_vertical ? 'max-w-md mx-auto aspect-[9/16]' : 'aspect-video'}`}>
              {selectedVideo.video_url.includes('youtube.com') || selectedVideo.video_url.includes('youtu.be') ? (
                <iframe
                  src={selectedVideo.video_url.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                  title={selectedVideo.title}
                />
              ) : (
                <video
                  src={selectedVideo.video_url}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              )}
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{selectedVideo.title}</h3>
              <div className="flex items-center justify-center gap-4 text-[#a0a0a0] text-sm">
                <span>{selectedVideo.creator}</span>
                {selectedVideo.city && selectedVideo.country && (
                  <>
                    <span>•</span>
                    <span>{selectedVideo.city}, {selectedVideo.country}</span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {(selectedVideo.views || 0).toLocaleString()}
                </span>
              </div>
              <p className="text-[#a0a0a0] text-sm mt-2">Press ESC to close</p>
            </div>
          </div>
        </div>
      )}

      {showFiltersDrawer && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowFiltersDrawer(false)}
        >
          <div
            className="bg-[#111] border border-[#333] rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">More Filters</h3>
              <button
                onClick={() => setShowFiltersDrawer(false)}
                className="w-10 h-10 bg-[#1a1a1a] hover:bg-[#222] rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-3">Video Type</label>
                <div className="flex flex-wrap gap-2">
                  {['YouTube', 'TikTok', 'Instagram', 'Vimeo'].map((type) => (
                    <button
                      key={type}
                      className="px-4 py-2 bg-[#1a1a1a] hover:bg-streetiz-red border border-[#333] hover:border-streetiz-red rounded-full text-sm font-semibold text-white transition-all"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-3">Orientation</label>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-[#1a1a1a] hover:bg-streetiz-red border border-[#333] hover:border-streetiz-red rounded-lg text-sm font-semibold text-white transition-all">
                    Horizontal
                  </button>
                  <button className="flex-1 px-4 py-2 bg-[#1a1a1a] hover:bg-streetiz-red border border-[#333] hover:border-streetiz-red rounded-lg text-sm font-semibold text-white transition-all">
                    Vertical
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-3">Duration</label>
                <div className="flex flex-wrap gap-2">
                  {['Under 1 min', '1-5 min', '5-10 min', '10+ min'].map((duration) => (
                    <button
                      key={duration}
                      className="px-4 py-2 bg-[#1a1a1a] hover:bg-streetiz-red border border-[#333] hover:border-streetiz-red rounded-full text-sm font-semibold text-white transition-all"
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-3">Location</label>
                <input
                  type="text"
                  placeholder="Search by city or country..."
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#333] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowFiltersDrawer(false)}
                className="flex-1 px-6 py-3 bg-[#1a1a1a] hover:bg-[#222] rounded-lg font-bold text-white transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFiltersDrawer(false)}
                className="flex-1 px-6 py-3 bg-streetiz-red hover:bg-streetiz-red/90 rounded-lg font-bold text-white transition-colors shadow-lg shadow-streetiz-red/30"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
