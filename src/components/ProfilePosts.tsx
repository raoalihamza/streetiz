import { useState, useEffect } from 'react';
import { Loader, Calendar, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import FeedPost from './FeedPost';

interface ProfilePostsProps {
  profile: any;
}

export default function ProfilePosts({ profile }: ProfilePostsProps) {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'events' | 'marketplace'>('all');

  useEffect(() => {
    loadPosts();
  }, [profile.id, filter]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles(username, display_name, avatar_url),
          comments:post_comments(count),
          likes:post_likes(count),
          user_liked:post_likes(id)
        `)
        .eq('author_id', profile.id)
        .order('created_at', { ascending: false });

      if (filter === 'events') {
        query = query.eq('post_type', 'event');
      } else if (filter === 'marketplace') {
        query = query.eq('post_type', 'marketplace');
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { value: 'all', label: 'Tous', icon: null },
    { value: 'events', label: 'Événements', icon: Calendar },
    { value: 'marketplace', label: 'Marketplace', icon: ShoppingBag }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#222] rounded-2xl p-2">
        {filters.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-semibold transition-colors ${
                filter === f.value
                  ? 'bg-streetiz-red text-white'
                  : 'text-[#666] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-streetiz-red animate-spin" />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <FeedPost key={post.id} post={post} onUpdate={loadPosts} />
          ))}
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-12 text-center">
          <p className="text-[#666]">Aucune publication</p>
        </div>
      )}
    </div>
  );
}