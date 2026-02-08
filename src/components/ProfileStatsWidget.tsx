import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Eye, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ProfileStats {
  followers: number;
  following: number;
  posts: number;
}

export default function ProfileStatsWidget() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ProfileStats>({
    followers: 0,
    following: 0,
    posts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const [followersRes, followingRes, postsRes] = await Promise.all([
        supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', user.id),
        supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', user.id),
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      setStats({
        followers: followersRes.count || 0,
        following: followingRes.count || 0,
        posts: postsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = () => {
    if (profile?.username) {
      navigate(`/profile/${profile.username}`);
    }
  };

  if (!user || loading) {
    return (
      <div className="bg-[#111] rounded-2xl border border-[#222] p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#222]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-[#222] rounded w-24" />
            <div className="h-3 bg-[#222] rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-2xl border border-[#222] overflow-hidden relative group hover:border-streetiz-red/50 transition-all">
      <div className="absolute inset-0 bg-gradient-to-br from-streetiz-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-5">
        <div className="flex items-start gap-4">
          <button
            onClick={handleViewProfile}
            className="relative flex-shrink-0 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full ring-2 ring-streetiz-red/20 group-hover:ring-streetiz-red/50 transition-all overflow-hidden">
              <img
                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.username || 'User'}&background=ef4444&color=fff&size=64`}
                alt={profile?.display_name || profile?.username || 'Profile'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#111] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </button>

          <button
            onClick={handleViewProfile}
            className="flex-1 min-w-0 text-left cursor-pointer"
          >
            <h3 className="text-white font-black text-lg truncate group-hover:text-streetiz-red transition-colors">
              {profile?.display_name || profile?.username || 'Mon Profil'}
            </h3>
            <p className="text-[#666] text-sm truncate">
              @{profile?.username || 'username'}
            </p>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-[#0a0a0a] rounded-xl p-3 border border-[#222] hover:border-streetiz-red/30 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-3 h-3 text-streetiz-red" />
            </div>
            <div className="text-white font-black text-xl">{stats.followers}</div>
            <div className="text-[#666] text-xs font-semibold">Abonnés</div>
          </div>

          <div className="bg-[#0a0a0a] rounded-xl p-3 border border-[#222] hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-3 h-3 text-blue-400" />
            </div>
            <div className="text-white font-black text-xl">{stats.following}</div>
            <div className="text-[#666] text-xs font-semibold">Suivis</div>
          </div>

          <div className="bg-[#0a0a0a] rounded-xl p-3 border border-[#222] hover:border-purple-500/30 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3 h-3 text-purple-400" />
            </div>
            <div className="text-white font-black text-xl">{stats.posts}</div>
            <div className="text-[#666] text-xs font-semibold">Posts</div>
          </div>
        </div>

        <button
          onClick={handleViewProfile}
          className="w-full mt-4 bg-gradient-to-r from-streetiz-red to-red-600 hover:from-red-600 hover:to-streetiz-red text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-streetiz-red/30 hover:scale-[1.02]"
        >
          <Eye className="w-4 h-4" />
          Voir mon profil
        </button>
      </div>

      <div className="h-1 bg-gradient-to-r from-streetiz-red via-red-600 to-streetiz-red" />
    </div>
  );
}
