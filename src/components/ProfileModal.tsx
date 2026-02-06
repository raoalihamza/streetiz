import { useEffect, useState } from 'react';
import { X, MapPin, Users, Music, Video, Calendar, Instagram, Youtube, MessageCircle, UserPlus, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location?: string;
  country?: string;
  profile_role?: string;
  social_links?: any;
  followers_count?: number;
  following_count?: number;
  online_status?: string;
}

interface ProfileModalProps {
  profile: Profile;
  onClose: () => void;
  onMessage: (profileId: string) => void;
}

export default function ProfileModal({ profile, onClose, onMessage }: ProfileModalProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(profile.followers_count || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    checkFollowStatus();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const checkFollowStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const toggleFollow = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);

        if (error) throw error;
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profile.id
          });

        if (error) throw error;
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (profile.profile_role) {
      case 'dj': return <Music className="w-4 h-4" />;
      case 'dancer': return <Users className="w-4 h-4" />;
      case 'videographer': case 'photographer': return <Video className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleLabel = () => {
    const labels: Record<string, string> = {
      'dj': 'DJ',
      'dancer': 'Dancer',
      'creator': 'Creator',
      'photographer': 'Photographer',
      'videographer': 'Videographer',
      'organizer': 'Organizer',
      'clubber': 'Clubber'
    };
    return labels[profile.profile_role || ''] || 'Member';
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#111] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#222]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-streetiz-red/20 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-black/70 hover:bg-black rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#111]">
                  <img
                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.display_name || profile.username}&background=ef4444&color=fff&size=128`}
                    alt={profile.display_name || profile.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                {profile.online_status === 'online' && (
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-[#111] rounded-full" />
                )}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">
                    {profile.display_name || profile.username}
                  </h2>
                  <p className="text-[#888] text-lg">@{profile.username}</p>
                </div>
                {profile.profile_role && (
                  <span className="bg-streetiz-red px-4 py-2 rounded-full text-sm font-bold text-white uppercase flex items-center gap-2">
                    {getRoleIcon()}
                    {getRoleLabel()}
                  </span>
                )}
              </div>

              {profile.bio && (
                <p className="text-[#a0a0a0] leading-relaxed mb-4">{profile.bio}</p>
              )}

              <div className="flex items-center gap-6 text-sm mb-6">
                {(profile.location || profile.country) && (
                  <div className="flex items-center gap-2 text-[#a0a0a0]">
                    <MapPin className="w-4 h-4 text-streetiz-red" />
                    <span>{profile.location}{profile.country ? `, ${profile.country}` : ''}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-white">{followerCount}</div>
                  <div className="text-xs text-[#666]">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-white">{profile.following_count || 0}</div>
                  <div className="text-xs text-[#666]">Following</div>
                </div>
              </div>

              {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                <div className="flex items-center gap-3 mb-6">
                  {profile.social_links.instagram && (
                    <a
                      href={profile.social_links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-[#1a1a1a] hover:bg-streetiz-red rounded-full flex items-center justify-center transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {profile.social_links.youtube && (
                    <a
                      href={profile.social_links.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-[#1a1a1a] hover:bg-streetiz-red rounded-full flex items-center justify-center transition-colors"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={toggleFollow}
                  disabled={loading}
                  className={`flex-1 font-bold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2 ${
                    isFollowing
                      ? 'bg-[#1a1a1a] hover:bg-[#222] text-white'
                      : 'bg-streetiz-red hover:bg-red-600 text-white'
                  }`}
                >
                  {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>
                <button
                  onClick={() => {
                    onMessage(profile.id);
                    onClose();
                  }}
                  className="flex-1 bg-[#1a1a1a] hover:bg-[#222] text-white font-bold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
