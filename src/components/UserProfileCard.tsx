import { useState, useEffect } from 'react';
import { User, MapPin, Users, FileText, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserStats {
  followers_count: number;
  following_count: number;
  posts_count: number;
}

interface ProfileData {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  profile_type?: string;
  location?: string;
}

interface UserProfileCardProps {
  onViewProfile?: () => void;
}

export default function UserProfileCard({ onViewProfile }: UserProfileCardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    followers_count: 0,
    following_count: 0,
    posts_count: 0,
  });
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
          username,
          display_name,
          avatar_url,
          profile_extensions (
            profile_type,
            location
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile({
          username: profileData.username,
          display_name: profileData.display_name,
          avatar_url: profileData.avatar_url,
          profile_type: profileData.profile_extensions?.[0]?.profile_type,
          location: profileData.profile_extensions?.[0]?.location,
        });
      }

      const { count: followersCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

      const { count: followingCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id);

      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        followers_count: followersCount || 0,
        following_count: followingCount || 0,
        posts_count: postsCount || 0,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfileTypeLabel = (type?: string) => {
    switch (type) {
      case 'dj': return 'DJ';
      case 'dancer': return 'Danseur';
      case 'producer': return 'Producteur';
      case 'organizer': return 'Organisateur';
      case 'photographer': return 'Photographe';
      case 'videographer': return 'Vidéaste';
      default: return 'Membre';
    }
  };

  const getProfileTypeColor = (type?: string) => {
    switch (type) {
      case 'dj': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'dancer': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'producer': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'organizer': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'photographer': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (!user || loading) {
    return (
      <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden shadow-lg shadow-black/50 animate-pulse">
        <div className="p-4 space-y-3">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-full mx-auto" />
          <div className="h-4 bg-[#1a1a1a] rounded w-3/4 mx-auto" />
          <div className="h-3 bg-[#1a1a1a] rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden shadow-lg shadow-black/50">
      <div className="relative h-20 bg-gradient-to-br from-streetiz-red/30 via-red-900/20 to-transparent">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg')] bg-cover bg-center opacity-10" />
      </div>

      <div className="px-4 pb-4">
        <div className="relative -mt-10 mb-3">
          <img
            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=ef4444&color=fff&size=80`}
            alt="Profile"
            className="w-20 h-20 rounded-full ring-4 ring-[#111] mx-auto object-cover"
          />
          {profile?.profile_type && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-16">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getProfileTypeColor(profile.profile_type)}`}>
                {getProfileTypeLabel(profile.profile_type)}
              </span>
            </div>
          )}
        </div>

        <div className="text-center mb-3 mt-6">
          <h3 className="text-white font-black text-base mb-1 truncate">
            {profile?.display_name || user.email?.split('@')[0]}
          </h3>
          <p className="text-[#666] text-xs mb-2">@{profile?.username || user.email?.split('@')[0]}</p>

          {profile?.location && (
            <div className="flex items-center justify-center gap-1 text-[#888] text-xs mb-3">
              <MapPin className="w-3 h-3" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-[#0a0a0a] rounded-xl p-2.5 border border-[#222] hover:border-streetiz-red/30 transition-colors">
            <div className="flex items-center justify-center gap-1 text-streetiz-red mb-1">
              <Users className="w-3.5 h-3.5" />
            </div>
            <p className="text-white font-black text-sm text-center">{stats.followers_count}</p>
            <p className="text-[#666] text-[10px] text-center">Abonnés</p>
          </div>

          <div className="bg-[#0a0a0a] rounded-xl p-2.5 border border-[#222] hover:border-streetiz-red/30 transition-colors">
            <div className="flex items-center justify-center gap-1 text-streetiz-red mb-1">
              <User className="w-3.5 h-3.5" />
            </div>
            <p className="text-white font-black text-sm text-center">{stats.following_count}</p>
            <p className="text-[#666] text-[10px] text-center">Suivis</p>
          </div>

          <div className="bg-[#0a0a0a] rounded-xl p-2.5 border border-[#222] hover:border-streetiz-red/30 transition-colors">
            <div className="flex items-center justify-center gap-1 text-streetiz-red mb-1">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <p className="text-white font-black text-sm text-center">{stats.posts_count}</p>
            <p className="text-[#666] text-[10px] text-center">Posts</p>
          </div>
        </div>

        <button
          onClick={onViewProfile}
          className="w-full bg-gradient-to-r from-streetiz-red to-red-600 hover:from-red-600 hover:to-streetiz-red text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-streetiz-red/30 hover:scale-[1.02]"
        >
          <Eye className="w-4 h-4" />
          Voir Profil
        </button>
      </div>
    </div>
  );
}
