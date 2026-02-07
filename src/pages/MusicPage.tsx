import { useEffect, useState } from 'react';
import { Music2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import MusicSpotlight from '../components/MusicSpotlight';
import MusicCarousel from '../components/MusicCarousel';
import ExploreFeedBlock from '../components/ExploreFeedBlock';
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

interface Podcast {
  id: string;
  title: string;
  host: string;
  cover_url: string;
  audio_url: string;
  description: string;
  duration: number;
}

interface FeedItem {
  id: string;
  type: 'track' | 'playlist' | 'remix' | 'free_download' | 'dj_set' | 'podcast' | 'article' | 'pack';
  title: string;
  artist?: string;
  coverUrl: string;
  tags?: string[];
  duration?: number;
  description?: string;
  onPlay?: () => void;
  onDownload?: () => void;
  externalUrl?: string;
}

export default function MusicPage() {
  const [loading, setLoading] = useState(true);
  const [spotlight, setSpotlight] = useState<Spotlight | null>(null);
  const [newReleases, setNewReleases] = useState<PlatformRelease[]>([]);
  const [remixes, setRemixes] = useState<Track[]>([]);
  const [freeDownloads, setFreeDownloads] = useState<Track[]>([]);
  const [djSets, setDjSets] = useState<DJSet[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [beatportChart, setBeatportChart] = useState<Track[]>([]);
  const [streetizChart, setStreetizChart] = useState<Track[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);

  const [selectedModal, setSelectedModal] = useState<{
    title: string;
    artist: string;
    videoUrl?: string;
    audioUrl?: string;
    description?: string;
  } | null>(null);

  useEffect(() => {
    loadAllContent();
  }, []);

  const loadAllContent = async () => {
    setLoading(true);
    try {
      const [
        spotlightData,
        tracksData,
        releasesData,
        djSetsData,
        articlesData,
        podcastsData,
      ] = await Promise.all([
        supabase
          .from('music_spotlights')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from('music_tracks').select('*').order('created_at', { ascending: false }),
        supabase.from('music_platform_releases').select('*').order('release_date', { ascending: false }).limit(20),
        supabase.from('music_dj_sets').select('*').order('created_at', { ascending: false }).limit(12),
        supabase.from('music_articles').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('music_podcasts').select('*').order('published_at', { ascending: false }).limit(10),
      ]);

      if (spotlightData.data) setSpotlight(spotlightData.data);
      if (tracksData.data) {
        const tracks = tracksData.data;
        setAllTracks(tracks);
        setRemixes(tracks.filter((t) => t.is_remix).slice(0, 20));
        setFreeDownloads(tracks.filter((t) => t.is_free_download).slice(0, 20));
        setBeatportChart(tracks.slice(0, 10));
        setStreetizChart(tracks.slice(10, 20));
      }
      if (releasesData.data) setNewReleases(releasesData.data);
      if (djSetsData.data) setDjSets(djSetsData.data);
      if (articlesData.data) setArticles(articlesData.data);
      if (podcastsData.data) setPodcasts(podcastsData.data);

      buildFeedItems(tracksData.data || [], djSetsData.data || [], articlesData.data || [], podcastsData.data || []);
    } catch (error) {
      console.error('Error loading music content:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildFeedItems = (tracks: Track[], djSets: DJSet[], articles: Article[], podcasts: Podcast[]) => {
    const items: FeedItem[] = [];

    tracks.forEach((track) => {
      items.push({
        id: track.id,
        type: track.is_remix ? 'remix' : track.is_free_download ? 'free_download' : 'track',
        title: track.title,
        artist: track.artist,
        coverUrl: track.cover_url,
        tags: [
          track.is_remix ? 'REMIX' : track.is_free_download ? 'FREE DL' : 'TRACK',
          track.genre,
        ],
        duration: track.duration,
        onPlay: () => handlePlayTrack(track.id),
        onDownload: track.is_free_download ? () => {} : undefined,
        externalUrl: track.external_platform_url,
      });
    });

    djSets.forEach((djSet) => {
      items.push({
        id: djSet.id,
        type: 'dj_set',
        title: djSet.title,
        artist: djSet.artist,
        coverUrl: djSet.cover_url,
        tags: ['DJ SET'],
        description: djSet.description,
        onPlay: () => handlePlayDJSet(djSet),
      });
    });

    articles.forEach((article) => {
      items.push({
        id: article.id,
        type: 'article',
        title: article.title,
        coverUrl: article.cover_url,
        tags: ['ARTICLE'],
        description: article.content,
        onPlay: () => {},
      });
    });

    podcasts.forEach((podcast) => {
      items.push({
        id: podcast.id,
        type: 'podcast',
        title: podcast.title,
        artist: podcast.host,
        coverUrl: podcast.cover_url,
        tags: ['PODCAST'],
        duration: podcast.duration,
        description: podcast.description,
        onPlay: () => handlePlayPodcast(podcast),
      });
    });

    setFeedItems(items);
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

  const handlePlayPodcast = (podcast: Podcast) => {
    setSelectedModal({
      title: podcast.title,
      artist: podcast.host,
      audioUrl: podcast.audio_url,
      description: podcast.description,
    });
  };

  const handleFilterChange = (filters: any) => {
    let filtered = [...feedItems];

    if (filters.tab !== 'General Feed') {
      const typeMap: Record<string, string[]> = {
        'New Releases': ['track'],
        'Remixes': ['remix'],
        'Free Downloads': ['free_download'],
        'DJ Sets': ['dj_set'],
        'Podcasts': ['podcast'],
        'Articles': ['article'],
        'Packs': ['pack'],
      };
      const allowedTypes = typeMap[filters.tab] || [];
      filtered = filtered.filter((item) => allowedTypes.includes(item.type));
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          (item.artist && item.artist.toLowerCase().includes(query))
      );
    }

    setFeedItems(filtered);
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
      <div className="pt-20 pb-12">
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

        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          {spotlight && (
            <div className="mb-12">
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
            </div>
          )}

          <div className="space-y-12 mb-12">
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
              <MusicCarousel
                title="DJ Sets & Live Videos"
                items={djSets.slice(0, 8).map((djSet) => ({
                  id: djSet.id,
                  title: djSet.title,
                  artist: djSet.artist,
                  coverUrl: djSet.cover_url,
                  tags: ['DJ SET'],
                }))}
                onPlayItem={(id) => {
                  const djSet = djSets.find((d) => d.id === id);
                  if (djSet) handlePlayDJSet(djSet);
                }}
              />
            )}

            {articles.length > 0 && (
              <MusicCarousel
                title="Articles & Interviews"
                items={articles.slice(0, 8).map((article) => ({
                  id: article.id,
                  title: article.title,
                  artist: '',
                  coverUrl: article.cover_url,
                  tags: ['ARTICLE'],
                }))}
                onPlayItem={() => {}}
              />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
            <div>
              <ExploreFeedBlock
                feedItems={feedItems}
                onFilterChange={handleFilterChange}
              />
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
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
