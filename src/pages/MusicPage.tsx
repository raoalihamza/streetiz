import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import MusicPostCard from '../components/MusicPostCard';

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

export default function MusicPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<MusicPost[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('music_video_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPosts(data);
    } catch (error) {
      console.error('Error loading music posts:', error);
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-white mb-2">Music Feed</h1>
            <p className="text-gray-400">
              Découvre les derniers sons, vidéos et contenus de la scène électronique
            </p>
          </div>

          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun post pour le moment</p>
              </div>
            ) : (
              posts.map((post) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
