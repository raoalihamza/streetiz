import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Globe, Users, Edit, MessageCircle, UserPlus, UserCheck, X,
  Instagram, Music, Video, ExternalLink, Play, Image as ImageIcon, Film,
  Share2, MoreVertical, ArrowLeft, Calendar, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import FeedPost from '../components/FeedPost';
import Navigation from '../components/Navigation';
import ProfileEditModal from '../components/ProfileEditModal';
import UserAgenda from '../components/UserAgenda';
import LibreTonightButton from '../components/LibreTonightButton';
import LibreTonightBadge from '../components/LibreTonightBadge';
import ProfilePhotoGrid from '../components/ProfilePhotoGrid';
import ProfileMusicPlaylist from '../components/ProfileMusicPlaylist';

interface ProfilePageProps {
  profileId?: string;
  onClose?: () => void;
  onOpenChat?: (userId: string, username: string, avatar: string | null) => void;
}

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  nationality: string | null;
  team_collective: string | null;
  roles: string[];
  styles: string[];
  social_links: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    soundcloud?: string;
    spotify?: string;
    other?: string;
  };
  created_at: string;
  available_tonight?: boolean;
  tonight_location_type?: string;
  tonight_location_value?: string;
  available_tonight_updated_at?: string;
}

interface Media {
  id: string;
  media_type: 'photo' | 'video';
  media_url: string;
  external_url?: string;
  external_platform?: string;
  thumbnail_url?: string;
  display_order: number;
}

interface Post {
  id: string;
  user_id: string;
  post_type: string;
  content: string | null;
  media_url?: string | null;
  media_urls?: string[];
  tags: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  created_at: string;
  user_liked?: boolean;
  user_saved?: boolean;
  profiles: { id: string; username: string; display_name: string | null; avatar_url: string | null };
}

type TabType = 'about' | 'media' | 'music' | 'posts' | 'agenda';

export default function ProfilePage({ profileId: propProfileId, onClose, onOpenChat }: ProfilePageProps) {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<Array<{
    id: string;
    title: string;
    event_date: string;
    location: string;
    event_type: string;
  }>>([]);

  const profileId = propProfileId;
  const isModalMode = !!onClose;
  const isOwnProfile = user?.id === profile?.id;

  useEffect(() => {
    if (username) {
      loadProfileByUsername();
    } else if (profileId) {
      loadProfile();
    }
  }, [username, profileId]);

  useEffect(() => {
    if (profile?.id && user) {
      checkFollowStatus();
      checkFriendshipStatus();
    }
  }, [profile?.id, user]);

  useEffect(() => {
    if (profile?.id) {
      loadMedia();
      loadUpcomingEvents();
    }
  }, [profile?.id]);

  useEffect(() => {
    if (activeTab === 'posts') {
      loadPosts();
    }
  }, [activeTab]);

  const loadProfileByUsername = async () => {
    if (!username) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile by username:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    if (!profileId) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase
        .from('profile_media')
        .select('*')
        .eq('user_id', profile.id)
        .order('display_order');

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
    }
  };

  const loadPosts = async () => {
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (id, username, display_name, avatar_url)
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const loadUpcomingEvents = async () => {
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase
        .from('user_agenda_events')
        .select('id, title, event_date, location, event_type')
        .eq('user_id', profile.id)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Error loading upcoming events:', error);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !profile?.id) return;
    try {
      const { data } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
        .maybeSingle();

      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const checkFriendshipStatus = async () => {
    if (!user || !profile?.id) return;
    try {
      const { data } = await supabase
        .from('friendships')
        .select('status')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${profile.id}),and(user_id.eq.${profile.id},friend_id.eq.${user.id})`)
        .maybeSingle();

      if (data) {
        setFriendshipStatus(data.status);
        setIsFriend(data.status === 'accepted');
      }
    } catch (error) {
      console.error('Error checking friendship:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || !profile?.id) return;

    try {
      if (isFollowing) {
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);
        setIsFollowing(false);
      } else {
        await supabase
          .from('user_follows')
          .insert({ follower_id: user.id, following_id: profile.id });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleAddFriend = async () => {
    if (!user || !profile?.id || friendshipStatus !== 'none') return;

    try {
      await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: profile.id,
          status: 'pending'
        });
      setFriendshipStatus('pending');
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const getVideoEmbedUrl = (url: string, platform?: string) => {
    if (platform === 'youtube') {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (platform === 'tiktok') {
      return url;
    }
    return url;
  };

  if (loading) {
    const loadingContent = (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-streetiz-red/20 border-t-streetiz-red rounded-full animate-spin" />
      </div>
    );

    if (isModalMode) {
      return <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50">{loadingContent}</div>;
    }
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navigation />
        {loadingContent}
      </div>
    );
  }

  if (!profile) {
    const notFoundContent = (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Profile not found</p>
          <button
            onClick={() => isModalMode ? onClose?.() : navigate('/community')}
            className="bg-gradient-to-r from-streetiz-red to-red-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            {isModalMode ? 'Close' : 'Back to Community'}
          </button>
        </div>
      </div>
    );

    if (isModalMode) {
      return <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50">{notFoundContent}</div>;
    }
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navigation />
        {notFoundContent}
      </div>
    );
  }

  const photos = media.filter(m => m.media_type === 'photo');
  const videos = media.filter(m => m.media_type === 'video');

  const containerClass = isModalMode
    ? "fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-y-auto"
    : "min-h-screen bg-[#0a0a0a]";

  return (
    <div className={containerClass}>
      {!isModalMode && <Navigation />}

      <div className="min-h-screen">
        {isModalMode ? (
          <button
            onClick={onClose}
            className="fixed top-6 right-6 w-12 h-12 bg-[#111] hover:bg-[#222] border border-[#333] rounded-full flex items-center justify-center transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        ) : (
          <div className="sticky top-20 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#222]">
            <div className="max-w-5xl mx-auto px-6 py-4">
              <button
                onClick={() => navigate('/community')}
                className="flex items-center gap-2 text-white hover:text-streetiz-red transition-colors font-bold"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour à la communauté
              </button>
            </div>
          </div>
        )}

        <div className={`max-w-5xl mx-auto ${isModalMode ? 'p-6' : 'px-4 pt-6 pb-12'}`}>
          <div className={`bg-[#0a0a0a] ${isModalMode ? 'rounded-3xl' : 'rounded-2xl'} border border-[#222] overflow-hidden`}>
            <div
              className="h-64 bg-gradient-to-br from-streetiz-red/20 to-[#0a0a0a] relative"
              style={profile.banner_url ? {
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3), rgba(10,10,10,0.95)), url(${profile.banner_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              } : {}}
            >
              {isOwnProfile && (
                <div className="absolute top-4 right-4">
                  <LibreTonightButton
                    userId={profile.id}
                    isOwnProfile={isOwnProfile}
                    availableTonight={profile.available_tonight}
                    tonightLocationType={profile.tonight_location_type}
                    tonightLocationValue={profile.tonight_location_value}
                    availableTonightUpdatedAt={profile.available_tonight_updated_at}
                    onUpdate={() => {
                      if (username) {
                        loadProfileByUsername();
                      } else if (profileId) {
                        loadProfile();
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6 relative z-20">
                <div className="flex items-end gap-6">
                  <img
                    src={profile.avatar_url || 'https://images.pexels.com/photos/1804913/pexels-photo-1804913.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={profile.username}
                    className="w-32 h-32 rounded-2xl border-4 border-[#0a0a0a] object-cover shadow-xl relative z-20"
                  />
                  <div className="mb-2">
                    <h1 className="text-3xl font-black text-white mb-1">
                      {profile.display_name || profile.username}
                    </h1>
                    <p className="text-[#888] mb-2">@{profile.username}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 md:mt-0">
                  {isOwnProfile ? (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-streetiz-red to-red-600 hover:from-red-600 hover:to-streetiz-red text-white rounded-full font-bold transition-all flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : user && (
                    <>
                      <button
                        onClick={handleFollow}
                        className={`px-6 py-3 rounded-full font-bold transition-all ${
                          isFollowing
                            ? 'bg-[#222] text-white hover:bg-[#333]'
                            : 'bg-streetiz-red text-white hover:bg-red-600'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>

                      {friendshipStatus === 'none' && (
                        <button
                          onClick={handleAddFriend}
                          className="px-6 py-3 bg-[#222] hover:bg-[#333] text-white rounded-full font-bold transition-all flex items-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          Add Friend
                        </button>
                      )}

                      {friendshipStatus === 'pending' && (
                        <button
                          disabled
                          className="px-6 py-3 bg-[#222] text-[#666] rounded-full font-bold flex items-center gap-2"
                        >
                          <UserCheck className="w-4 h-4" />
                          Pending
                        </button>
                      )}

                      {friendshipStatus === 'accepted' && (
                        <button
                          disabled
                          className="px-6 py-3 bg-green-500/20 text-green-400 rounded-full font-bold flex items-center gap-2"
                        >
                          <UserCheck className="w-4 h-4" />
                          Friends
                        </button>
                      )}

                      <button
                        onClick={() => onOpenChat?.(profile.id, profile.username, profile.avatar_url)}
                        className="px-6 py-3 bg-[#222] hover:bg-[#333] text-white rounded-full font-bold transition-all flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {profile.bio && (
                  <p className="text-white text-lg">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-[#888]">
                  {profile.city && profile.country && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-streetiz-red" />
                      <span>{profile.city}, {profile.country}</span>
                    </div>
                  )}
                  {profile.nationality && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-streetiz-red" />
                      <span>{profile.nationality}</span>
                    </div>
                  )}
                  {profile.team_collective && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-streetiz-red" />
                      <span>{profile.team_collective}</span>
                    </div>
                  )}
                </div>

                {profile.roles && profile.roles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.roles.map((role, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-streetiz-red/20 text-streetiz-red rounded-full text-sm font-bold"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                )}

                {profile.styles && profile.styles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.styles.map((style, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[#222] text-white rounded-full text-sm font-semibold"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                )}

                {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {profile.social_links.instagram && (
                      <a
                        href={profile.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-full transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </a>
                    )}
                    {profile.social_links.tiktok && (
                      <a
                        href={profile.social_links.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-full transition-colors"
                      >
                        <Music className="w-4 h-4" />
                        TikTok
                      </a>
                    )}
                    {profile.social_links.youtube && (
                      <a
                        href={profile.social_links.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-full transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        YouTube
                      </a>
                    )}
                    {profile.social_links.soundcloud && (
                      <a
                        href={profile.social_links.soundcloud}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-full transition-colors"
                      >
                        <Music className="w-4 h-4" />
                        SoundCloud
                      </a>
                    )}
                    {profile.social_links.spotify && (
                      <a
                        href={profile.social_links.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-full transition-colors"
                      >
                        <Music className="w-4 h-4" />
                        Spotify
                      </a>
                    )}
                    {profile.social_links.other && (
                      <a
                        href={profile.social_links.other}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-full transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                )}

                {!isOwnProfile && profile.available_tonight && (
                  <div className="flex items-center gap-4 pt-4 border-t border-[#222]">
                    <LibreTonightBadge
                      locationValue={profile.tonight_location_value}
                      updatedAt={profile.available_tonight_updated_at}
                      size="md"
                    />
                  </div>
                )}
              </div>

              <div className="border-b border-[#222] mb-6">
                <div className="flex gap-6">
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`pb-4 font-bold transition-colors ${
                      activeTab === 'about'
                        ? 'text-streetiz-red border-b-2 border-streetiz-red'
                        : 'text-[#666] hover:text-white'
                    }`}
                  >
                    About
                  </button>
                  <button
                    onClick={() => setActiveTab('media')}
                    className={`pb-4 font-bold transition-colors ${
                      activeTab === 'media'
                        ? 'text-streetiz-red border-b-2 border-streetiz-red'
                        : 'text-[#666] hover:text-white'
                    }`}
                  >
                    Media ({photos.length + videos.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('music')}
                    className={`pb-4 font-bold transition-colors ${
                      activeTab === 'music'
                        ? 'text-streetiz-red border-b-2 border-streetiz-red'
                        : 'text-[#666] hover:text-white'
                    }`}
                  >
                    Music
                  </button>
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`pb-4 font-bold transition-colors ${
                      activeTab === 'posts'
                        ? 'text-streetiz-red border-b-2 border-streetiz-red'
                        : 'text-[#666] hover:text-white'
                    }`}
                  >
                    Posts
                  </button>
                  <button
                    onClick={() => setActiveTab('agenda')}
                    className={`pb-4 font-bold transition-colors ${
                      activeTab === 'agenda'
                        ? 'text-streetiz-red border-b-2 border-streetiz-red'
                        : 'text-[#666] hover:text-white'
                    }`}
                  >
                    Agenda
                  </button>
                </div>
              </div>

              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ProfilePhotoGrid userId={profile.id} isOwnProfile={isOwnProfile} />

                    <div>
                      <UserAgenda userId={profile.id} isOwnProfile={isOwnProfile} />
                    </div>
                  </div>

                  <div className="bg-zinc-900 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">About</h3>
                    <p className="text-zinc-400">
                      {profile.bio || 'No bio provided yet.'}
                    </p>

                    <div className="mt-6 pt-6 border-t border-zinc-800">
                      <h4 className="text-white font-semibold mb-3">Member Since</h4>
                      <p className="text-zinc-400">
                        {new Date(profile.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-6">
                  {(photos.length > 0 || videos.length > 0) ? (
                    <>
                      <h3 className="text-white font-black text-xl flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-streetiz-red" />
                        Media Gallery ({photos.length} photos, {videos.length} vidéos)
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map((photo) => (
                          <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group">
                            <button
                              onClick={() => setLightboxImage(photo.media_url)}
                              className="w-full h-full"
                            >
                              <img
                                src={photo.media_url}
                                alt="Profile media"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </button>
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ImageIcon className="w-3 h-3 text-white" />
                              <span className="text-xs text-white font-semibold">Photo</span>
                            </div>
                          </div>
                        ))}
                        {videos.map((video) => (
                          <div key={video.id} className="relative aspect-square rounded-xl overflow-hidden bg-[#111] border border-[#222] group">
                            <div className="absolute inset-0 flex items-center justify-center">
                              {video.external_platform === 'youtube' && video.external_url ? (
                                <iframe
                                  src={getVideoEmbedUrl(video.external_url, video.external_platform)}
                                  className="w-full h-full"
                                  allowFullScreen
                                />
                              ) : video.media_url ? (
                                <video
                                  src={video.media_url}
                                  controls
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-center p-4">
                                  <Film className="w-12 h-12 text-streetiz-red mx-auto mb-2" />
                                  <p className="text-white text-xs font-semibold">{video.external_platform || 'Video'}</p>
                                </div>
                              )}
                            </div>
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1">
                              <Film className="w-3 h-3 text-white" />
                              <span className="text-xs text-white font-semibold">Vidéo</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-10 h-10 text-[#333]" />
                      </div>
                      <p className="text-white font-bold text-lg mb-2">Aucun média</p>
                      <p className="text-[#666]">
                        {isOwnProfile
                          ? "Ajoutez des photos et vidéos pour les partager avec la communauté"
                          : "Ce membre n'a pas encore ajouté de médias"
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'music' && (
                <div>
                  <ProfileMusicPlaylist userId={profile.id} isOwnProfile={isOwnProfile} />
                </div>
              )}

              {activeTab === 'posts' && (
                <div className="space-y-6">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <FeedPost key={post.id} post={post} onLike={() => {}} onComment={() => {}} onShare={() => {}} onSave={() => {}} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-[#666]">No posts yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'agenda' && profile && (
                <UserAgenda
                  userId={profile.id}
                  isOwnProfile={isOwnProfile}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-6"
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-[#111] hover:bg-[#222] rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={lightboxImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {showEditModal && (
        <ProfileEditModal
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            if (username) {
              loadProfileByUsername();
            } else if (profileId) {
              loadProfile();
            }
            loadMedia();
          }}
        />
      )}
    </div>
  );
}
