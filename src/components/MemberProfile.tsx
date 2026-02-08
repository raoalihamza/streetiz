import { useState, useEffect } from 'react';
import { X, MapPin, Users, FileText, Calendar, UserPlus, Check, MessageCircle, ExternalLink, Play, Image as ImageIcon, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ProfileOptionsMenu from './ProfileOptionsMenu';
import SendPrivateAlbumModal from './SendPrivateAlbumModal';
import SendPortfolioModal from './SendPortfolioModal';
import ReportUserModal from './ReportUserModal';

interface MemberProfileProps {
  userId: string;
  onClose: () => void;
}

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  country: string | null;
  profile_role: string | null;
  social_links: any;
  interests: string[];
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following: boolean;
}

interface MediaItem {
  id: string;
  media_type: 'photo' | 'video';
  media_url: string | null;
  external_url: string | null;
  external_platform: string | null;
  thumbnail_url: string | null;
  title: string | null;
  description: string | null;
}

export default function MemberProfile({ userId, onClose }: MemberProfileProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showPrivateAlbumModal, setShowPrivateAlbumModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    loadProfile();
    loadMedia();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          avatar_url,
          bio,
          interests,
          social_links,
          profile_extensions (location, country, profile_role)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      const { data: statsData } = await supabase
        .from('profile_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      let isFollowing = false;
      if (user) {
        const { data: followData } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .maybeSingle();
        isFollowing = !!followData;
      }

      setProfile({
        id: profileData.id,
        username: profileData.username,
        display_name: profileData.display_name,
        avatar_url: profileData.avatar_url,
        bio: profileData.bio,
        location: profileData.profile_extensions?.[0]?.location || null,
        country: profileData.profile_extensions?.[0]?.country || null,
        profile_role: profileData.profile_extensions?.[0]?.profile_role || null,
        social_links: profileData.social_links || {},
        interests: profileData.interests || [],
        followers_count: statsData?.followers_count || 0,
        following_count: statsData?.following_count || 0,
        posts_count: statsData?.posts_count || 0,
        is_following: isFollowing
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_media')
        .select('*')
        .eq('user_id', userId)
        .order('display_order');

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || !profile) return;

    try {
      if (profile.is_following) {
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
      } else {
        await supabase
          .from('user_follows')
          .insert({ follower_id: user.id, following_id: userId });
      }

      await supabase.rpc('update_profile_stats', { target_user_id: userId });

      setProfile({ ...profile, is_following: !profile.is_following });
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleAddContact = async () => {
    if (!user) return;
    try {
      await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: userId,
          status: 'pending'
        });
      alert('Demande de contact envoyée');
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleShareProfile = () => {
    if (!profile) return;
    const profileUrl = `${window.location.origin}/@${profile.username}`;
    if (navigator.share) {
      navigator.share({
        title: `Profil de ${profile.display_name || profile.username}`,
        url: profileUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(profileUrl);
      alert('Lien copié dans le presse-papier');
    }
  };

  const handleBlock = async () => {
    if (!user) return;

    try {
      if (isBlocked) {
        await supabase
          .from('user_blocks')
          .delete()
          .eq('user_id', user.id)
          .eq('blocked_user_id', userId);
        setIsBlocked(false);
        alert('Utilisateur débloqué');
      } else {
        await supabase
          .from('user_blocks')
          .insert({
            user_id: user.id,
            blocked_user_id: userId
          });
        setIsBlocked(true);
        alert('Utilisateur bloqué');
      }
    } catch (error) {
      console.error('Error toggling block:', error);
    }
  };

  const getMediaUrl = (item: MediaItem) => {
    if (item.external_url) {
      if (item.external_platform === 'youtube') {
        const videoId = item.external_url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return item.external_url;
    }
    return item.media_url;
  };

  const photos = media.filter(m => m.media_type === 'photo').slice(0, 6);
  const videos = media.filter(m => m.media_type === 'video').slice(0, 3);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-streetiz-red/20 border-t-streetiz-red rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
        <div className="min-h-screen flex items-start justify-center p-4 py-12">
          <div className="bg-[#0D0D0D] rounded-3xl border border-[#222] w-full max-w-4xl overflow-hidden">
            <div className="relative h-48 bg-gradient-to-br from-streetiz-red/20 to-[#0D0D0D]">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="absolute -bottom-16 left-8">
                <img
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}&background=ef4444&color=fff&size=128`}
                  alt={profile.username}
                  className="w-32 h-32 rounded-full border-4 border-[#0D0D0D] object-cover"
                />
              </div>
            </div>

            <div className="p-8 pt-20">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-black text-white">
                      {profile.display_name || profile.username}
                    </h2>
                    {user && user.id !== userId && (
                      <ProfileOptionsMenu
                        targetUserId={userId}
                        targetUsername={profile.username}
                        isBlocked={isBlocked}
                        onAddContact={handleAddContact}
                        onShareProfile={handleShareProfile}
                        onSendPrivateAlbum={() => setShowPrivateAlbumModal(true)}
                        onSendPortfolio={() => setShowPortfolioModal(true)}
                        onBlock={handleBlock}
                        onReport={() => setShowReportModal(true)}
                      />
                    )}
                    {profile.profile_role && (
                      <span className="bg-streetiz-red/20 text-streetiz-red px-3 py-1 rounded-full text-sm font-bold">
                        {profile.profile_role}
                      </span>
                    )}
                  </div>
                  <p className="text-[#666] mb-3">@{profile.username}</p>
                  {profile.location && (
                    <div className="flex items-center gap-2 text-[#888] mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}, {profile.country}</span>
                    </div>
                  )}
                  {profile.bio && (
                    <p className="text-white text-sm mb-4">{profile.bio}</p>
                  )}
                  {profile.interests.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      {profile.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="bg-[#1a1a1a] text-[#888] px-3 py-1 rounded-full text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {user && user.id !== userId && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFollow}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-colors ${
                        profile.is_following
                          ? 'bg-[#1a1a1a] text-white hover:bg-[#222]'
                          : 'bg-streetiz-red hover:bg-red-600 text-white'
                      }`}
                    >
                      {profile.is_following ? (
                        <>
                          <Check className="w-4 h-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </button>
                    <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-white px-6 py-2.5 rounded-full font-bold transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
                  <div className="text-2xl font-black text-white mb-1">{profile.followers_count}</div>
                  <div className="text-[#666] text-xs uppercase">Followers</div>
                </div>
                <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
                  <div className="text-2xl font-black text-white mb-1">{profile.posts_count}</div>
                  <div className="text-[#666] text-xs uppercase">Posts</div>
                </div>
                <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
                  <div className="text-2xl font-black text-white mb-1">{profile.following_count}</div>
                  <div className="text-[#666] text-xs uppercase">Following</div>
                </div>
              </div>

              {photos.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-black text-lg flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-streetiz-red" />
                      Photos ({photos.length}/6)
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => setSelectedMedia(photo)}
                        className="aspect-square bg-[#111] rounded-xl overflow-hidden border border-[#222] hover:border-streetiz-red transition-colors group"
                      >
                        <img
                          src={getMediaUrl(photo) || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
                          alt={photo.title || 'Photo'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {videos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-black text-lg flex items-center gap-2">
                      <Video className="w-5 h-5 text-streetiz-red" />
                      Videos ({videos.length}/3)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {videos.map((video) => (
                      <div key={video.id} className="bg-[#111] rounded-xl overflow-hidden border border-[#222]">
                        {video.external_platform === 'youtube' && video.external_url ? (
                          <div className="aspect-video">
                            <iframe
                              src={getMediaUrl(video)}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : video.external_url ? (
                          <a
                            href={video.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-video bg-black flex items-center justify-center group hover:bg-[#1a1a1a] transition-colors"
                          >
                            <div className="text-center">
                              <Play className="w-16 h-16 text-white mb-2 mx-auto group-hover:text-streetiz-red transition-colors" />
                              <p className="text-white font-semibold">{video.title || 'Watch Video'}</p>
                              <p className="text-[#666] text-sm">{video.external_platform}</p>
                            </div>
                          </a>
                        ) : null}
                        {video.title && (
                          <div className="p-3">
                            <p className="text-white font-semibold text-sm">{video.title}</p>
                            {video.description && (
                              <p className="text-[#666] text-xs mt-1">{video.description}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedMedia && selectedMedia.media_type === 'photo' && (
        <div
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={getMediaUrl(selectedMedia) || ''}
            alt={selectedMedia.title || 'Photo'}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {showPrivateAlbumModal && profile && (
        <SendPrivateAlbumModal
          targetUserId={userId}
          targetUsername={profile.username}
          onClose={() => setShowPrivateAlbumModal(false)}
          onSent={() => {
            alert('Album privé envoyé avec succès');
            setShowPrivateAlbumModal(false);
          }}
        />
      )}

      {showPortfolioModal && profile && (
        <SendPortfolioModal
          targetUserId={userId}
          targetUsername={profile.username}
          onClose={() => setShowPortfolioModal(false)}
          onSent={() => {
            alert('Portfolio envoyé avec succès');
            setShowPortfolioModal(false);
          }}
        />
      )}

      {showReportModal && profile && (
        <ReportUserModal
          targetUserId={userId}
          targetUsername={profile.username}
          onClose={() => setShowReportModal(false)}
          onReported={() => {
            alert('Signalement envoyé. Notre équipe va examiner ce profil.');
            setShowReportModal(false);
          }}
        />
      )}
    </>
  );
}
