import { useEffect, useState, useRef } from 'react';
import { Search, Music2, Heart, Download, ShoppingCart, Play, Eye, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import InlineAudioPlayer from '../components/InlineAudioPlayer';
import AudioPlayer from '../components/AudioPlayer';
import ModalPlayer from '../components/ModalPlayer';
import FloatingMiniPlayer from '../components/FloatingMiniPlayer';

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  audio_url: string;
  genre: string;
  duration: number;
  plays: number;
  likes: number;
  buy_url?: string;
  download_url?: string;
  is_featured: boolean;
}

interface DJSet {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  video_url?: string;
  audio_url?: string;
  description: string;
  genre: string;
  duration: number;
  plays: number;
  likes: number;
  is_live: boolean;
  event_location?: string;
}

interface Release {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  audio_url: string;
  description: string;
  genre: string;
  label?: string;
  release_date: string;
  buy_url?: string;
  download_url?: string;
  is_exclusive: boolean;
}

interface MusicArticle {
  id: string;
  title: string;
  content: string;
  cover_url: string;
  artist?: string;
  genre: string;
  audio_url?: string;
  video_url?: string;
  is_featured: boolean;
}

export default function MusicPage() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [djSets, setDjSets] = useState<DJSet[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [articles, setArticles] = useState<MusicArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<'Newest' | 'Trending' | 'Most viewed'>('Newest');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedModal, setSelectedModal] = useState<{
    title: string;
    artist: string;
    videoUrl?: string;
    audioUrl?: string;
    description?: string;
  } | null>(null);

  const [floatingPlayer, setFloatingPlayer] = useState<{
    title: string;
    artist: string;
    coverUrl: string;
    isPlaying: boolean;
  } | null>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const genres = ['All', 'House', 'Techno', 'Electro', 'Afro House', 'Breakbeat', 'DJ Sets', 'Tracks'];
  const sortOptions: Array<'Newest' | 'Trending' | 'Most viewed'> = ['Newest', 'Trending', 'Most viewed'];
  const itemsPerPage = 9;

  useEffect(() => {
    loadAllContent();
  }, []);

  useEffect(() => {
    setupInfiniteScroll();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [tracks, djSets, releases]);

  const loadAllContent = async () => {
    setLoading(true);
    try {
      const [tracksData, djSetsData, releasesData, articlesData] = await Promise.all([
        supabase.from('music_tracks').select('*').order('created_at', { ascending: false }),
        supabase.from('music_dj_sets').select('*').order('created_at', { ascending: false }),
        supabase.from('music_releases').select('*').order('created_at', { ascending: false }),
        supabase.from('music_articles').select('*').order('created_at', { ascending: false }),
      ]);

      if (tracksData.data) setTracks(tracksData.data);
      if (djSetsData.data) setDjSets(djSetsData.data);
      if (releasesData.data) setReleases(releasesData.data);
      if (articlesData.data) setArticles(articlesData.data);
    } catch (error) {
      console.error('Error loading music content:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupInfiniteScroll = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
  };

  const filterContent = <T extends { genre: string; title: string; artist: string }>(items: T[]): T[] => {
    let filtered = [...items];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.artist.toLowerCase().includes(query) ||
          item.genre.toLowerCase().includes(query)
      );
    }

    if (selectedGenre !== 'All') {
      if (selectedGenre === 'Tracks') {
        return [] as T[];
      } else if (selectedGenre === 'DJ Sets') {
        return [] as T[];
      } else {
        filtered = filtered.filter((item) => item.genre === selectedGenre);
      }
    }

    return filtered;
  };

  const filteredTracks = filterContent(tracks);
  const filteredDjSets = filterContent(djSets);
  const filteredReleases = filterContent(releases);

  const displayedTracks =
    selectedGenre === 'Tracks' || selectedGenre === 'All'
      ? filteredTracks.slice(0, currentPage * itemsPerPage)
      : [];

  const displayedDjSets =
    selectedGenre === 'DJ Sets' || selectedGenre === 'All'
      ? filteredDjSets.slice(0, currentPage * itemsPerPage)
      : [];

  const displayedReleases =
    selectedGenre === 'All' ? filteredReleases.slice(0, currentPage * itemsPerPage) : [];

  const handleDJSetClick = (djSet: DJSet) => {
    setSelectedModal({
      title: djSet.title,
      artist: djSet.artist,
      videoUrl: djSet.video_url,
      audioUrl: djSet.audio_url,
      description: djSet.description,
    });
  };

  const handleTrackPlay = (trackId: string) => {
    const track = tracks.find((t) => t.id === trackId);
    if (track) {
      setFloatingPlayer({
        title: track.title,
        artist: track.artist,
        coverUrl: track.cover_url,
        isPlaying: true,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#222] border-t-streetiz-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] pt-24 pb-32">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-streetiz-red/10 border border-streetiz-red/20 px-4 py-1.5 rounded-full mb-4">
            <Music2 className="w-4 h-4 text-streetiz-red mr-2" />
            <span className="text-streetiz-red text-sm font-bold">MUSIQUE</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4">
            <span className="text-white">STREET</span>
            <span className="text-streetiz-red drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">MUSIC</span>
          </h1>
          <p className="text-xl text-[#888] max-w-3xl mx-auto mb-6">
            Découvrez les meilleurs tracks, DJ sets et productions de la scène électronique.
          </p>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[#666]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher tracks, artistes, labels…"
                className="w-full bg-[#111] border-2 border-[#333] rounded-2xl py-5 pl-14 pr-6 text-white text-lg placeholder-[#666] focus:outline-none focus:border-streetiz-red transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-30 bg-[#0D0D0D]/98 backdrop-blur-sm py-5 mb-12 -mx-4 px-4 border-b border-[#222]">
          <div className="flex items-center justify-between gap-4 flex-wrap max-w-[1800px] mx-auto">
            <div className="flex items-center gap-3 flex-wrap flex-1">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => {
                    setSelectedGenre(genre);
                    setCurrentPage(1);
                  }}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    selectedGenre === genre
                      ? 'bg-streetiz-red text-white shadow-lg shadow-streetiz-red/30'
                      : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#222] hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#666] text-sm font-semibold">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'Newest' | 'Trending' | 'Most viewed')}
                className="bg-[#1a1a1a] text-white border border-[#333] rounded-full px-4 py-2 text-sm font-semibold focus:outline-none focus:border-streetiz-red transition-colors cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-8">
            {(selectedGenre === 'All' || selectedGenre === 'Tracks') && displayedTracks.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-white mb-6">Latest Tracks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayedTracks.map((track) => (
                    <div key={track.id} className="bg-[#111] rounded-2xl overflow-hidden border border-[#222] hover:border-streetiz-red/50 transition-all group">
                      <div className="relative aspect-square">
                        <img
                          src={track.cover_url}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-streetiz-red px-3 py-1 rounded-full text-xs font-bold text-white">
                            {track.genre}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-white font-bold text-lg mb-1 truncate">{track.title}</h3>
                        <p className="text-[#888] text-sm mb-4 truncate">{track.artist}</p>

                        <InlineAudioPlayer
                          audioUrl={track.audio_url}
                          onPlay={() => handleTrackPlay(track.id)}
                        />

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#222]">
                          <div className="flex items-center gap-3">
                            <button className="p-2 hover:bg-[#222] rounded-lg transition-colors group">
                              <Heart className="w-4 h-4 text-[#666] group-hover:text-streetiz-red transition-colors" />
                            </button>
                            <span className="text-[#666] text-xs">{track.likes}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {track.download_url && (
                              <button className="p-2 hover:bg-[#222] rounded-lg transition-colors">
                                <Download className="w-4 h-4 text-[#666] hover:text-white" />
                              </button>
                            )}
                            {track.buy_url && (
                              <button className="p-2 hover:bg-[#222] rounded-lg transition-colors">
                                <ShoppingCart className="w-4 h-4 text-[#666] hover:text-white" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(selectedGenre === 'All' || selectedGenre === 'DJ Sets') && displayedDjSets.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-white mb-6">DJ Sets & Lives</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayedDjSets.map((djSet) => (
                    <div
                      key={djSet.id}
                      onClick={() => handleDJSetClick(djSet)}
                      className="bg-[#111] rounded-2xl overflow-hidden border border-[#222] hover:border-streetiz-red/50 transition-all cursor-pointer group"
                    >
                      <div className="relative aspect-video">
                        <img
                          src={djSet.cover_url}
                          alt={djSet.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 bg-streetiz-red rounded-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                          </div>
                        </div>
                        <div className="absolute top-3 left-3 flex gap-2">
                          {djSet.is_live && (
                            <span className="bg-streetiz-red px-3 py-1 rounded-full text-xs font-bold text-white animate-pulse">
                              LIVE
                            </span>
                          )}
                          <span className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                            {djSet.genre}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                          {Math.floor(djSet.duration / 60)}m
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-white font-bold text-lg mb-1">{djSet.title}</h3>
                        <p className="text-streetiz-red text-sm font-semibold mb-3">{djSet.artist}</p>
                        <p className="text-[#888] text-sm line-clamp-2 mb-4">{djSet.description}</p>
                        <div className="flex items-center justify-between text-xs text-[#666]">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{djSet.plays.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              <span>{djSet.likes.toLocaleString()}</span>
                            </div>
                          </div>
                          {djSet.event_location && (
                            <span className="truncate max-w-[150px]">{djSet.event_location}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {selectedGenre === 'All' && displayedReleases.length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-white mb-6">Featured Releases</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayedReleases.map((release) => (
                    <div key={release.id} className="bg-[#111] rounded-2xl overflow-hidden border border-[#222] hover:border-streetiz-red/50 transition-all group">
                      <div className="relative aspect-square">
                        <img
                          src={release.cover_url}
                          alt={release.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          {release.is_exclusive && (
                            <span className="bg-streetiz-red px-3 py-1 rounded-full text-xs font-bold text-white">
                              EXCLUSIVE
                            </span>
                          )}
                          <span className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                            {release.genre}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-white font-bold text-lg mb-1">{release.title}</h3>
                        <p className="text-streetiz-red text-sm font-semibold mb-2">{release.artist}</p>
                        {release.label && (
                          <p className="text-[#666] text-xs mb-3">{release.label}</p>
                        )}
                        <p className="text-[#888] text-sm line-clamp-3 mb-4">{release.description}</p>

                        <InlineAudioPlayer audioUrl={release.audio_url} />

                        <div className="flex gap-2 mt-4">
                          {release.buy_url && (
                            <a
                              href={release.buy_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-streetiz-red hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Buy
                            </a>
                          )}
                          {release.download_url && (
                            <a
                              href={release.download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-[#222] hover:bg-[#333] text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {selectedGenre === 'All' && articles.filter((a) => a.is_featured).length > 0 && (
              <section>
                <h2 className="text-3xl font-black text-white mb-6">Streetiz Exclusive</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {articles
                    .filter((a) => a.is_featured)
                    .slice(0, 3)
                    .map((article) => (
                      <div
                        key={article.id}
                        className="bg-[#111] rounded-2xl overflow-hidden border border-[#222] hover:border-streetiz-red/50 transition-all group cursor-pointer"
                      >
                        <div className="relative aspect-video">
                          <img
                            src={article.cover_url}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-streetiz-red px-3 py-1 rounded-full text-xs font-bold text-white">
                              EXCLUSIVE
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                            {article.title}
                          </h3>
                          {article.artist && (
                            <p className="text-streetiz-red text-sm font-semibold mb-3">
                              {article.artist}
                            </p>
                          )}
                          <p className="text-[#888] text-sm line-clamp-3 mb-4">{article.content}</p>
                          {article.audio_url && (
                            <InlineAudioPlayer audioUrl={article.audio_url} />
                          )}
                          <button className="mt-4 text-streetiz-red text-sm font-semibold hover:underline">
                            Lire plus →
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
              {!loading && (
                <div className="w-8 h-8 border-2 border-[#333] border-t-streetiz-red rounded-full animate-spin" />
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div className="bg-[#111] rounded-2xl p-5 border border-[#222]">
              <h3 className="text-streetiz-red font-black text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                TRENDING TRACKS
              </h3>
              <div className="space-y-3">
                {tracks.slice(0, 5).map((track, index) => (
                  <div
                    key={track.id}
                    onClick={() => handleTrackPlay(track.id)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1a1a1a] transition-all cursor-pointer group"
                  >
                    <div className="w-8 text-[#666] font-bold text-sm text-center">
                      {index + 1}
                    </div>
                    <img
                      src={track.cover_url}
                      alt={track.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-semibold truncate group-hover:text-streetiz-red transition-colors">
                        {track.title}
                      </h4>
                      <p className="text-[#666] text-xs truncate">{track.artist}</p>
                    </div>
                    <div className="text-[#666] text-xs flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      <span>{(track.plays / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111] rounded-2xl p-5 border border-[#222]">
              <h3 className="text-streetiz-red font-black text-lg mb-4 flex items-center gap-2">
                <Play className="w-5 h-5" />
                TOP DJ SETS
              </h3>
              <div className="space-y-4">
                {djSets.slice(0, 3).map((djSet) => (
                  <div
                    key={djSet.id}
                    onClick={() => handleDJSetClick(djSet)}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                      <img
                        src={djSet.cover_url}
                        alt={djSet.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 bg-streetiz-red rounded-full flex items-center justify-center">
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <h4 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-streetiz-red transition-colors">
                      {djSet.title}
                    </h4>
                    <p className="text-[#666] text-xs mt-1">{djSet.artist}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111] rounded-2xl p-5 border border-[#222]">
              <h3 className="text-streetiz-red font-black text-lg mb-4 flex items-center gap-2">
                <Music2 className="w-5 h-5" />
                NEW RELEASES
              </h3>
              <div className="space-y-3">
                {releases.slice(0, 5).map((release) => (
                  <div
                    key={release.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1a1a1a] transition-all cursor-pointer group"
                  >
                    <img
                      src={release.cover_url}
                      alt={release.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-semibold truncate group-hover:text-streetiz-red transition-colors">
                        {release.title}
                      </h4>
                      <p className="text-[#666] text-xs truncate">{release.artist}</p>
                    </div>
                    <Music2 className="w-4 h-4 text-streetiz-red" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-streetiz-red/10 to-transparent rounded-2xl p-5 border border-streetiz-red/30">
              <h3 className="text-streetiz-red font-black text-lg mb-4">
                STREETIZ RADIO
              </h3>
              <AudioPlayer />
            </div>
          </aside>
        </div>
      </div>

      {selectedModal && (
        <ModalPlayer
          isOpen={true}
          onClose={() => setSelectedModal(null)}
          title={selectedModal.title}
          artist={selectedModal.artist}
          videoUrl={selectedModal.videoUrl}
          audioUrl={selectedModal.audioUrl}
          description={selectedModal.description}
        />
      )}

      {floatingPlayer && (
        <FloatingMiniPlayer
          isVisible={true}
          isPlaying={floatingPlayer.isPlaying}
          title={floatingPlayer.title}
          artist={floatingPlayer.artist}
          coverUrl={floatingPlayer.coverUrl}
          onPlayPause={() =>
            setFloatingPlayer(
              floatingPlayer
                ? { ...floatingPlayer, isPlaying: !floatingPlayer.isPlaying }
                : null
            )
          }
          onClose={() => setFloatingPlayer(null)}
        />
      )}
    </div>
  );
}
