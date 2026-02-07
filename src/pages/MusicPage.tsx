import { useEffect, useState } from 'react';
import { Music2, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import MusicSpotlight from '../components/MusicSpotlight';
import DiscoverWeekly from '../components/DiscoverWeekly';
import MusicCarousel from '../components/MusicCarousel';
import MusicFilters from '../components/MusicFilters';
import MusicSidebar from '../components/MusicSidebar';
import ModalPlayer from '../components/ModalPlayer';

interface Spotlight {
  id: string;
  title: string;
  subtitle: string;
  cover_url: string;
  tags: string[];
  external_url?: string;
  content_type: string;
  content_id?: string;
}

interface Playlist {
  id: string;
  title: string;
  cover_url: string;
  track_count: number;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  audio_url: string;
  genre: string;
  duration: number;
  is_remix: boolean;
  is_free_download: boolean;
  platform: string;
  external_platform_url?: string;
}

interface PlatformRelease {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  platform: string;
  external_url: string;
  release_type: string;
  genres: string[];
  is_new: boolean;
}

interface DJSet {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  video_url?: string;
  audio_url?: string;
  description: string;
}

interface Article {
  id: string;
  title: string;
  cover_url: string;
  content: string;
}

interface FilterState {
  tab: string;
  genres: string[];
  platforms: string[];
  moods: string[];
  sort: string;
  search: string;
}

export default function MusicPage() {
  const [loading, setLoading] = useState(true);
  const [spotlight, setSpotlight] = useState<Spotlight | null>(null);
  const [discoverPlaylist, setDiscoverPlaylist] = useState<Playlist | null>(null);
  const [discoverTracks, setDiscoverTracks] = useState<Track[]>([]);
  const [newReleases, setNewReleases] = useState<PlatformRelease[]>([]);
  const [remixes, setRemixes] = useState<Track[]>([]);
  const [freeDownloads, setFreeDownloads] = useState<Track[]>([]);
  const [djSets, setDjSets] = useState<DJSet[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [beatportChart, setBeatportChart] = useState<Track[]>([]);
  const [streetizChart, setStreetizChart] = useState<Track[]>([]);

  const [selectedModal, setSelectedModal] = useState<{
    title: string;
    artist: string;
    videoUrl?: string;
    audioUrl?: string;
    description?: string;
  } | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    tab: 'General Feed',
    genres: [],
    platforms: [],
    moods: [],
    sort: 'Newest',
    search: '',
  });

  useEffect(() => {
    loadAllContent();
  }, []);

  const loadAllContent = async () => {
    setLoading(true);
    try {
      const [
        spotlightData,
        playlistsData,
        tracksData,
        releasesData,
        djSetsData,
        articlesData,
      ] = await Promise.all([
        supabase
          .from('music_spotlights')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('music_playlists')
          .select('*')
          .eq('playlist_type', 'discover_weekly')
          .limit(1)
          .maybeSingle(),
        supabase.from('music_tracks').select('*').order('created_at', { ascending: false }),
        supabase.from('music_platform_releases').select('*').order('release_date', { ascending: false }).limit(20),
        supabase.from('music_dj_sets').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('music_articles').select('*').order('created_at', { ascending: false }).limit(6),
      ]);

      if (spotlightData.data) setSpotlight(spotlightData.data);
      if (playlistsData.data) setDiscoverPlaylist(playlistsData.data);
      if (tracksData.data) {
        const tracks = tracksData.data;
        setAllTracks(tracks);
        setDiscoverTracks(tracks.slice(0, 20));
        setRemixes(tracks.filter((t) => t.is_remix).slice(0, 20));
        setFreeDownloads(tracks.filter((t) => t.is_free_download).slice(0, 20));
        setBeatportChart(tracks.slice(0, 10));
        setStreetizChart(tracks.slice(10, 20));
      }
      if (releasesData.data) setNewReleases(releasesData.data);
      if (djSetsData.data) setDjSets(djSetsData.data);
      if (articlesData.data) setArticles(articlesData.data);
    } catch (error) {
      console.error('Error loading music content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (trackId: string) => {
    const track = allTracks.find((t) => t.id === trackId);
    if (track) {
      setSelectedModal({
        title: track.title,
        artist: track.artist,
        audioUrl: track.audio_url,
      });
    }
  };

  const handlePlayDJSet = (djSet: DJSet) => {
    setSelectedModal({
      title: djSet.title,
      artist: djSet.artist,
      videoUrl: djSet.video_url,
      audioUrl: djSet.audio_url,
      description: djSet.description,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#282828] border-t-streetiz-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <div className="pt-20">
        <div className="text-center py-8 px-4">
          <div className="inline-flex items-center bg-streetiz-red/10 border border-streetiz-red/20 px-4 py-1.5 rounded-full mb-4">
            <Music2 className="w-4 h-4 text-streetiz-red mr-2" />
            <span className="text-streetiz-red text-sm font-bold">MUSIC</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-3">
            <span className="text-white">STREET</span>
            <span className="text-streetiz-red drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
              MUSIC
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            Your ultimate hub for electro, house, and street dance music
          </p>
        </div>

        <MusicFilters activeFilters={filters} onFilterChange={setFilters} />

        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
            <main className="space-y-12">
              {spotlight && (
                <MusicSpotlight
                  title={spotlight.title}
                  subtitle={spotlight.subtitle}
                  coverUrl={spotlight.cover_url}
                  tags={spotlight.tags}
                  externalUrl={spotlight.external_url}
                  onPlayPreview={() => {
                    if (spotlight.content_id) {
                      handlePlayTrack(spotlight.content_id);
                    }
                  }}
                  onViewExternal={() => {
                    if (spotlight.external_url) {
                      window.open(spotlight.external_url, '_blank');
                    }
                  }}
                />
              )}

              {discoverPlaylist && discoverTracks.length > 0 && (
                <DiscoverWeekly
                  playlistTitle={discoverPlaylist.title}
                  playlistCover={discoverPlaylist.cover_url}
                  trackCount={discoverPlaylist.track_count}
                  previewTracks={discoverTracks.map((t) => ({
                    id: t.id,
                    title: t.title,
                    artist: t.artist,
                    duration: t.duration,
                  }))}
                  onPlayTrack={handlePlayTrack}
                  onViewFull={() => {}}
                />
              )}

              {newReleases.length > 0 && (
                <MusicCarousel
                  title="New Electro of the Week"
                  items={newReleases.map((release) => ({
                    id: release.id,
                    title: release.title,
                    artist: release.artist,
                    coverUrl: release.cover_url,
                    tags: release.is_new ? ['NEW', ...release.genres.slice(0, 1)] : release.genres.slice(0, 2),
                    platforms: [release.platform],
                    externalUrl: release.external_url,
                  }))}
                  onPlayItem={(id) => {
                    const release = newReleases.find((r) => r.id === id);
                    if (release?.external_url) {
                      window.open(release.external_url, '_blank');
                    }
                  }}
                />
              )}

              {remixes.length > 0 && (
                <MusicCarousel
                  title="Remixes of the Week"
                  items={remixes.map((track) => ({
                    id: track.id,
                    title: track.title,
                    artist: track.artist,
                    coverUrl: track.cover_url,
                    tags: ['REMIX', track.genre],
                    platforms: track.platform ? [track.platform] : [],
                    hasDownload: track.is_free_download,
                    externalUrl: track.external_platform_url,
                  }))}
                  onPlayItem={handlePlayTrack}
                />
              )}

              {freeDownloads.length > 0 && (
                <MusicCarousel
                  title="Free Downloads"
                  items={freeDownloads.map((track) => ({
                    id: track.id,
                    title: track.title,
                    artist: track.artist,
                    coverUrl: track.cover_url,
                    tags: ['FREE DL', track.genre],
                    hasDownload: true,
                    platforms: track.platform ? [track.platform] : [],
                  }))}
                  onPlayItem={handlePlayTrack}
                />
              )}

              {djSets.length > 0 && (
                <section>
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-6">
                    DJ Sets & Live Videos
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {djSets.map((djSet) => (
                      <div
                        key={djSet.id}
                        onClick={() => handlePlayDJSet(djSet)}
                        className="bg-[#181818] rounded-xl overflow-hidden hover:bg-[#282828] transition-all cursor-pointer group"
                      >
                        <div className="relative aspect-video">
                          <img
                            src={djSet.cover_url}
                            alt={djSet.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 bg-streetiz-red rounded-full flex items-center justify-center">
                              <Music2 className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="text-white font-bold text-sm truncate">
                            {djSet.title}
                          </h3>
                          <p className="text-gray-400 text-xs truncate">{djSet.artist}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {articles.length > 0 && (
                <section>
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-6">
                    Articles & Interviews
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        className="bg-[#181818] rounded-xl overflow-hidden hover:bg-[#282828] transition-all cursor-pointer group"
                      >
                        <div className="relative aspect-video">
                          <img
                            src={article.cover_url}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-streetiz-red/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                              ARTICLE
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-bold mb-2 line-clamp-2 group-hover:text-streetiz-red transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-3 mb-3">
                            {article.content}
                          </p>
                          <button className="text-streetiz-red text-sm font-bold hover:underline flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>Read More</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </main>

            <div className="lg:sticky lg:top-32 lg:self-start">
              <MusicSidebar
                beatportTop10={beatportChart.map((track, index) => ({
                  position: index + 1,
                  previousPosition: index === 0 ? 2 : index === 1 ? 1 : index + 1,
                  title: track.title,
                  artist: track.artist,
                  coverUrl: track.cover_url,
                  onPlay: () => handlePlayTrack(track.id),
                }))}
                streetizWeeklyChart={streetizChart.map((track, index) => ({
                  position: index + 1,
                  previousPosition: index + 2,
                  title: track.title,
                  artist: track.artist,
                  coverUrl: track.cover_url,
                  onPlay: () => handlePlayTrack(track.id),
                }))}
                eventPromo={{
                  title: 'Streetiz Festival 2025',
                  date: 'March 15, 2025',
                  location: 'Paris, France',
                  imageUrl: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800',
                  url: '#',
                }}
              />
            </div>
          </div>
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
    </div>
  );
}
