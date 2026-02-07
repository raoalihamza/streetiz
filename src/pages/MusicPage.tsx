import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import MusicCarousel from '../components/MusicCarousel';
import ExploreFeedBlock from '../components/ExploreFeedBlock';
import MusicSidebar from '../components/MusicSidebar';
import ModalPlayer from '../components/ModalPlayer';

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
  event?: string;
  location?: string;
}

interface MusicVideoPost {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  content_type: 'youtube' | 'soundcloud';
  youtube_url?: string;
  youtube_embed_id?: string;
  soundcloud_url?: string;
  soundcloud_embed_code?: string;
  description?: string;
  genre: string;
  tags: string[];
  likes: number;
  plays: number;
  is_featured: boolean;
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
  platform?: string;
  duration?: number;
  description?: string;
  isVideo?: boolean;
  onPlay?: () => void;
  onDownload?: () => void;
  externalUrl?: string;
}

export default function MusicPage() {
  const [loading, setLoading] = useState(true);
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
  const [originalFeedItems, setOriginalFeedItems] = useState<FeedItem[]>([]);
  const [videoPosts, setVideoPosts] = useState<MusicVideoPost[]>([]);

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
        tracksData,
        releasesData,
        djSetsData,
        articlesData,
        podcastsData,
        videoPostsData,
      ] = await Promise.all([
        supabase.from('music_tracks').select('*').order('created_at', { ascending: false }),
        supabase.from('music_platform_releases').select('*').order('release_date', { ascending: false }).limit(15),
        supabase.from('music_dj_sets').select('*').order('created_at', { ascending: false }).limit(12),
        supabase.from('music_articles').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('music_podcasts').select('*').order('published_at', { ascending: false }).limit(10),
        supabase.from('music_video_posts').select('*').order('created_at', { ascending: false }),
      ]);

      if (tracksData.data) {
        const tracks = tracksData.data;
        setAllTracks(tracks);
        setRemixes(tracks.filter((t) => t.is_remix).slice(0, 15));
        setFreeDownloads(tracks.filter((t) => t.is_free_download).slice(0, 15));
        setBeatportChart(tracks.slice(0, 10));
        setStreetizChart(tracks.slice(10, 20));
      }
      if (releasesData.data) setNewReleases(releasesData.data);
      if (djSetsData.data) setDjSets(djSetsData.data);
      if (articlesData.data) setArticles(articlesData.data);
      if (podcastsData.data) setPodcasts(podcastsData.data);
      if (videoPostsData.data) setVideoPosts(videoPostsData.data);

      buildFeedItems(
        tracksData.data || [],
        releasesData.data || [],
        djSetsData.data || [],
        articlesData.data || [],
        podcastsData.data || [],
        videoPostsData.data || []
      );
    } catch (error) {
      console.error('Error loading music content:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildFeedItems = (
    tracks: Track[],
    releases: PlatformRelease[],
    djSets: DJSet[],
    articles: Article[],
    podcasts: Podcast[],
    videoPosts: MusicVideoPost[]
  ) => {
    const items: FeedItem[] = [];

    videoPosts.forEach((post) => {
      items.push({
        id: post.id,
        type: post.content_type === 'youtube' ? 'dj_set' : 'track',
        title: post.title,
        artist: post.artist,
        coverUrl: post.cover_url,
        tags: post.tags.length > 0 ? post.tags.slice(0, 2) : [post.genre],
        platform: post.content_type === 'youtube' ? 'YouTube' : 'SoundCloud',
        description: post.description,
        isVideo: post.content_type === 'youtube',
        externalUrl: post.content_type === 'youtube' ? post.youtube_url : post.soundcloud_url,
        onPlay: () => {
          if (post.content_type === 'youtube' && post.youtube_url) {
            setSelectedModal({
              title: post.title,
              artist: post.artist,
              videoUrl: post.youtube_url,
              description: post.description,
            });
          } else if (post.content_type === 'soundcloud' && post.soundcloud_url) {
            window.open(post.soundcloud_url, '_blank');
          }
        },
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
        platform: 'SoundCloud',
        duration: podcast.duration,
        description: podcast.description,
        onPlay: () => handlePlayPodcast(podcast),
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

    setFeedItems(items);
    setOriginalFeedItems(items);
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
    let filtered = [...originalFeedItems];

    if (filters.tab !== 'All') {
      const typeMap: Record<string, string[]> = {
        'New': ['track'],
        'Remixes': ['remix'],
        'Free DL': ['free_download'],
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

    if (filters.genres.length > 0) {
      filtered = filtered.filter((item) =>
        item.tags?.some((tag) => filters.genres.includes(tag))
      );
    }

    if (filters.platforms.length > 0) {
      filtered = filtered.filter((item) =>
        item.platform && filters.platforms.includes(item.platform)
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
      <div className="pt-24 pb-12">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
            <div>
              <ExploreFeedBlock
                feedItems={feedItems}
                onFilterChange={handleFilterChange}
              />

              <div className="mt-12 space-y-8">
                {newReleases.length > 0 && (
                  <div className="bg-[#0A0A0A] rounded-2xl p-6">
                    <MusicCarousel
                      title="New Electro of the Week"
                      items={newReleases.slice(0, 10).map((release) => ({
                        id: release.id,
                        title: release.title,
                        artist: release.artist,
                        coverUrl: release.cover_url,
                        tags: release.is_new ? ['NEW'] : [],
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
                  </div>
                )}

                {remixes.length > 0 && (
                  <div className="bg-[#0A0A0A] rounded-2xl p-6">
                    <MusicCarousel
                      title="Remixes of the Week"
                      items={remixes.slice(0, 10).map((track) => ({
                        id: track.id,
                        title: track.title,
                        artist: track.artist,
                        coverUrl: track.cover_url,
                        tags: ['REMIX'],
                        platforms: track.platform ? [track.platform] : [],
                        hasDownload: track.is_free_download,
                      }))}
                      onPlayItem={handlePlayTrack}
                    />
                  </div>
                )}

                {freeDownloads.length > 0 && (
                  <div className="bg-[#0A0A0A] rounded-2xl p-6">
                    <MusicCarousel
                      title="Free Downloads"
                      items={freeDownloads.slice(0, 10).map((track) => ({
                        id: track.id,
                        title: track.title,
                        artist: track.artist,
                        coverUrl: track.cover_url,
                        tags: ['FREE DL'],
                        hasDownload: true,
                      }))}
                      onPlayItem={handlePlayTrack}
                    />
                  </div>
                )}
              </div>
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
