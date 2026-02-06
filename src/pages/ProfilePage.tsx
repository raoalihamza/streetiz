import { useState, useEffect } from 'react';
import {
  MapPin, Globe, Users, Edit, MessageCircle, UserPlus, UserCheck, X,
  Instagram, Music, Video, ExternalLink, Play, Image as ImageIcon, Film
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import FeedPost from '../components/FeedPost';

interface ProfilePageProps {
  profileId: string;
  onClose: () => void;
  onOpenChat?: (userId: string, username: string, avatar: string | null) => void;
}

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  cover_banner_url: string | null;
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

type TabType = 'about' | 'media' | 'posts';

export default function ProfilePage({ profileId, onClose, onOpenChat }: ProfilePageProps) {
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

  const isOwnProfile = user?.id === profileId;

  useEffect(() => {
    loadProfile();
    loadMedia();
    if (user) {
      checkFollowStatus();
      checkFriendshipStatus();
    }
  }, [profileId, user]);

  useEffect(() => {
    if (activeTab === 'posts') {
      loadPosts();
    }
  }, [activeTab]);

  const loadProfile = async () => {
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
    try {
      const { data, error } = await supabase
        .from('profile_media')
        .select('*')
        .eq('user_id', profileId)
        .order('display_order');

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (id, username, display_name, avatar_url)
        `)
        .eq('user_id', profileId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const checkFollowStatus = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profileId)
        .maybeSingle();

      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const checkFriendshipStatus = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('friendships')
        .select('status')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${profileId}),and(user_id.eq.${profileId},friend_id.eq.${user.id})`)
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
    if (!user) return;

    try {
      if (isFollowing) {
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profileId);
        setIsFollowing(false);
      } else {
        await supabase
          .from('user_follows')
          .insert({ follower_id: user.id, following_id: profileId });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleAddFriend = async () => {
    if (!user || friendshipStatus !== 'none') return;

    try {
      await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: profileId,
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
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-streetiz-red/20 border-t-streetiz-red rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Profile not found</p>
          <button onClick={onClose} className="mt-4 text-streetiz-red hover:underline">Close</button>
        </div>
      </div>
    );
  }

  const photos = media.filter(m => m.media_type === 'photo');
  const videos = media.filter(m => m.media_type === 'video');

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen">
        <button
          onClick={onClose}
          className="fixed top-6 right-6 w-12 h-12 bg-[#111] hover:bg-[#222] border border-[#333] rounded-full flex items-center justify-center transition-colors z-10"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-[#0a0a0a] rounded-3xl border border-[#222] overflow-hidden">
            <div
              className="h-64 bg-gradient-to-br from-streetiz-red/20 to-[#111] relative"
              style={profile.cover_banner_url ? { backgroundImage: `url(${profile.cover_banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            />

            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
                <div className="flex items-end gap-6">
                  <img
                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}&background=ef4444&color=fff&size=128`}
                    alt={profile.username}
                    className="w-32 h-32 rounded-2xl border-4 border-[#0a0a0a] object-cover"
                  />
                  <div className="mb-2">
                    <h1 className="text-3xl font-black text-white mb-1">
                      {profile.display_name || profile.username}
                    </h1>
                    <p className="text-[#888]">@{profile.username}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 md:mt-0">
                  {!isOwnProfile && user && (
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
                    onClick={() => setActiveTab('posts')}
                    className={`pb-4 font-bold transition-colors ${
                      activeTab === 'posts'
                        ? 'text-streetiz-red border-b-2 border-streetiz-red'
                        : 'text-[#666] hover:text-white'
                    }`}
                  >
                    Posts
                  </button>
                </div>
              </div>

              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-black text-xl mb-4">About</h3>
                    <p className="text-[#888]">
                      {profile.bio || 'No bio provided yet.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-white font-black text-xl mb-4">Member Since</h3>
                    <p className="text-[#888]">
                      {new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-8">
                  {photos.length > 0 && (
                    <div>
                      <h3 className="text-white font-black text-xl mb-4 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-streetiz-red" />
                        Photos ({photos.length}/6)
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {photos.map((photo) => (
                          <button
                            key={photo.id}
                            onClick={() => setLightboxImage(photo.media_url)}
                            className="aspect-square rounded-xl overflow-hidden hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={photo.media_url}
                              alt="Profile media"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {videos.length > 0 && (
                    <div>
                      <h3 className="text-white font-black text-xl mb-4 flex items-center gap-2">
                        <Film className="w-5 h-5 text-streetiz-red" />
                        Videos ({videos.length}/3)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {videos.map((video) => (
                          <div
                            key={video.id}
                            className="aspect-video rounded-xl overflow-hidden bg-[#111] relative"
                          >
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
                                className="w-full h-full"
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {photos.length === 0 && videos.length === 0 && (
                    <div className="text-center py-12">
                      <ImageIcon className="w-16 h-16 text-[#333] mx-auto mb-4" />
                      <p className="text-[#666]">No media uploaded yet</p>
                    </div>
                  )}
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
    </div>
  );
}
