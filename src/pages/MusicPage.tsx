import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import MusicPostCard from '../components/MusicPostCard';
import MusicSidebarWidgets from '../components/MusicSidebarWidgets';
import ReelsHighlights from '../components/ReelsHighlights';

interface MusicPost {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  content_type: 'youtube' | 'soundcloud' | 'instagram';
  youtube_url?: string;
  youtube_embed_id?: string;
  soundcloud_url?: string;
  instagram_url?: string;
  description?: string;
  genre: string;
  tags: string[];
  likes: number;
  plays: number;
  is_featured: boolean;
  created_at: string;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  plays: number;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  banner_image?: string;
}

export default function MusicPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<MusicPost[]>([]);
  const [reels, setReels] = useState<MusicPost[]>([]);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    loadAllContent();
  }, []);

  const loadAllContent = async () => {
    setLoading(true);
    try {
      const [postsData, tracksData, eventsData] = await Promise.all([
        supabase
          .from('music_video_posts')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('music_tracks')
          .select('*')
          .order('plays', { ascending: false })
          .limit(10),
        supabase
          .from('events')
          .select('*')
          .gte('date', new Date().toISOString())
          .order('date', { ascending: true })
          .limit(5),
      ]);

      if (postsData.data) {
        const instagramPosts = postsData.data.filter(
          (post: MusicPost) => post.content_type === 'instagram'
        );
        const otherPosts = postsData.data.filter(
          (post: MusicPost) => post.content_type !== 'instagram'
        );
        setReels(instagramPosts);
        setPosts(otherPosts);
      }

      if (tracksData.data) {
        const formattedTracks = tracksData.data.map((track: Track, index: number) => ({
          position: index + 1,
          title: track.title,
          artist: track.artist,
          coverUrl: track.cover_url,
          change: Math.floor(Math.random() * 10) - 3,
        }));
        setTopTracks(formattedTracks);
      }

      if (eventsData.data) {
        const formattedEvents = eventsData.data.map((event: Event) => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
          }),
          location: event.location,
          artist: 'Various Artists',
          imageUrl: event.banner_image || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400',
        }));
        setUpcomingEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Error loading music content:', error);
    } finally {
      setLoading(false);
    }
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
          <div className="mb-8">
            <h1 className="text-4xl font-black text-white mb-2">Music Feed</h1>
            <p className="text-gray-400">
              Découvre les derniers sons, vidéos et contenus de la scène électronique
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
            <div>
              <ReelsHighlights
                reels={reels.map((reel) => ({
                  id: reel.id,
                  title: reel.title,
                  artist: reel.artist,
                  coverUrl: reel.cover_url,
                  instagramUrl: reel.instagram_url,
                  likes: reel.likes,
                  plays: reel.plays,
                  tags: reel.tags,
                }))}
                onReelClick={(reel) => {
                  if (reel.instagramUrl) {
                    window.open(reel.instagramUrl, '_blank');
                  }
                }}
              />

              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun post pour le moment</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-black text-white mb-1">Latest Tracks & Videos</h2>
                    <p className="text-gray-400 text-sm">YouTube et SoundCloud</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {posts.map((post) => (
                      <MusicPostCard
                        key={post.id}
                        id={post.id}
                        title={post.title}
                        artist={post.artist}
                        description={post.description}
                        contentType={post.content_type}
                        youtubeEmbedId={post.youtube_embed_id}
                        soundcloudUrl={post.soundcloud_url}
                        instagramUrl={post.instagram_url}
                        likes={post.likes}
                        coverUrl={post.cover_url}
                        tags={post.tags}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <MusicSidebarWidgets
                topTracks={topTracks}
                upcomingEvents={upcomingEvents}
                liveNow={{
                  title: 'Techno Therapy Radio',
                  artist: 'DJ Charlotte',
                  listeners: 12453,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
