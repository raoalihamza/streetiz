import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, MessageSquare, ShoppingBag, Briefcase, FileText, MapPin, ChevronDown,
  Search, Users as UsersIcon, Home, TrendingUp, MessageCircle, Flame, Sparkles, Filter
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import FeedPost from '../components/FeedPost';
import SeedDataButton from '../components/SeedDataButton';
import MemberSearch from '../components/MemberSearch';
import CreateContentModal from '../components/CreateContentModal';
import ChatWindow from '../components/ChatWindow';
import NewMembersCarousel from '../components/NewMembersCarousel';
import ActivityFeed from '../components/ActivityFeed';
import OnlineMembers from '../components/OnlineMembers';
import TrendingTags from '../components/TrendingTags';
import ProfileStatsWidget from '../components/ProfileStatsWidget';
import MessagesInbox from '../components/MessagesInbox';
import ForumList from '../components/ForumList';
import ForumTopicModal from '../components/ForumTopicModal';
import CreateForumTopicModal from '../components/CreateForumTopicModal';
import MarketplaceList from '../components/MarketplaceList';
import MarketplaceItemModal from '../components/MarketplaceItemModal';
import CreateMarketplaceItemModal from '../components/CreateMarketplaceItemModal';
import CastingsList from '../components/CastingsList';
import CastingDetailModal from '../components/CastingDetailModal';
import CreateCastingModal from '../components/CreateCastingModal';

interface CommunityPageProps {
  onNavigate: (page: string) => void;
}

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  online_status?: string;
}

interface Post {
  id: string;
  user_id: string;
  post_type: string;
  content: string | null;
  media_url?: string | null;
  media_urls?: string[];
  youtube_url?: string | null;
  tiktok_url?: string | null;
  audio_title?: string | null;
  audio_artist?: string | null;
  audio_url?: string | null;
  audio_cover_url?: string | null;
  article_title?: string | null;
  article_link?: string | null;
  article_image_url?: string | null;
  tags: string[];
  category?: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  created_at: string;
  profiles: Profile;
  user_liked?: boolean;
  user_saved?: boolean;
}

interface Friend {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  online_status: string;
}

type CategoryType = 'posts' | 'forum' | 'marketplace' | 'casting' | 'announcements' | 'members';
type FeedTab = 'global' | 'following' | 'recommended' | 'trending' | 'messages';

export default function CommunityPage({ onNavigate }: CommunityPageProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('posts');
  const [selectedFeedTab, setSelectedFeedTab] = useState<FeedTab>('global');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [createModalType, setCreateModalType] = useState<'post' | 'forum' | 'announcement' | 'marketplace' | 'workshop' | null>(null);
  const [openChats, setOpenChats] = useState<Array<{ id: string; name: string; avatar: string | null }>>([]);

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedMarketplaceItemId, setSelectedMarketplaceItemId] = useState<string | null>(null);
  const [selectedCastingId, setSelectedCastingId] = useState<string | null>(null);
  const [showCreateForumTopic, setShowCreateForumTopic] = useState(false);
  const [showCreateMarketplaceItem, setShowCreateMarketplaceItem] = useState(false);
  const [showCreateCasting, setShowCreateCasting] = useState(false);
  const [forumSortBy, setForumSortBy] = useState('recent');
  const [marketplaceCategory, setMarketplaceCategory] = useState('all');
  const [castingType, setCastingType] = useState('all');

  const handleViewProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      if (profile?.username) {
        navigate(`/profile/${profile.username}`);
      }
    } catch (error) {
      console.error('Error navigating to profile:', error);
    }
  };

  useEffect(() => {
    if (selectedCategory === 'posts') {
      loadPosts();
    }
    if (user) {
      loadFriends();
    }
  }, [user, selectedCategory, selectedFeedTab]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles (id, username, display_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (selectedFeedTab === 'following' && user) {
        const { data: followsData } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', user.id);

        const followingIds = (followsData || []).map((f: any) => f.following_id);
        if (followingIds.length > 0) {
          query = query.in('user_id', followingIds);
        } else {
          setPosts([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      if (user) {
        const postIds = (data || []).map((p: any) => p.id);

        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        const { data: saves } = await supabase
          .from('post_saves')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        const likedPostIds = new Set((likes || []).map((l: any) => l.post_id));
        const savedPostIds = new Set((saves || []).map((s: any) => s.post_id));

        setPosts((data || []).map((p: any) => ({
          ...p,
          user_liked: likedPostIds.has(p.id),
          user_saved: savedPostIds.has(p.id)
        })));
      } else {
        setPosts(data || []);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          friend_id,
          profiles!friendships_friend_id_fkey (
            id, username, display_name, avatar_url,
            profile_extensions (online_status)
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .limit(10);

      if (error) throw error;

      const formattedFriends = (data || []).map((f: any) => ({
        id: f.profiles.id,
        username: f.profiles.username,
        display_name: f.profiles.display_name,
        avatar_url: f.profiles.avatar_url,
        online_status: f.profiles.profile_extensions?.[0]?.online_status || 'offline'
      }));

      setFriends(formattedFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_liked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        await supabase.rpc('decrement_post_likes', { post_id: postId });
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        await supabase.rpc('increment_post_likes', { post_id: postId });
      }

      setPosts(posts.map(p =>
        p.id === postId
          ? { ...p, user_liked: !p.user_liked, likes_count: p.likes_count + (p.user_liked ? -1 : 1) }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      await loadPosts();
    }
  };

  const handleSave = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_saved) {
        await supabase
          .from('post_saves')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('post_saves')
          .insert({ post_id: postId, user_id: user.id });
      }

      setPosts(posts.map(p =>
        p.id === postId ? { ...p, user_saved: !p.user_saved } : p
      ));
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
  };

  const handleOpenChat = (userId: string, username: string, avatar: string | null) => {
    if (!openChats.find(chat => chat.id === userId)) {
      setOpenChats([...openChats, { id: userId, name: username, avatar }]);
    }
  };

  const handleCloseChat = (userId: string) => {
    setOpenChats(openChats.filter(chat => chat.id !== userId));
  };

  const categories = [
    { id: 'posts' as CategoryType, label: 'Posts', icon: Home, badge: 0 },
    { id: 'forum' as CategoryType, label: 'Forum', icon: MessageSquare, badge: 5 },
    { id: 'marketplace' as CategoryType, label: 'Marketplace', icon: ShoppingBag, badge: 12 },
    { id: 'casting' as CategoryType, label: 'Casting & Jobs', icon: Briefcase, badge: 3 },
    { id: 'announcements' as CategoryType, label: 'Announcements', icon: FileText, badge: 8 },
    { id: 'members' as CategoryType, label: 'Members', icon: UsersIcon, badge: 0 },
  ];

  const createActions = [
    { id: 'post', label: 'Create Post', icon: FileText },
    { id: 'forum', label: 'Forum Topic', icon: MessageSquare },
    { id: 'marketplace', label: 'Marketplace Item', icon: ShoppingBag },
    { id: 'casting', label: 'Casting / Job', icon: Briefcase },
    { id: 'announcement', label: 'Announcement', icon: TrendingUp },
  ];

  const handleCreateAction = (actionId: string) => {
    if (actionId === 'forum') {
      setShowCreateForumTopic(true);
    } else if (actionId === 'marketplace') {
      setShowCreateMarketplaceItem(true);
    } else if (actionId === 'casting') {
      setShowCreateCasting(true);
    } else {
      setCreateModalType(actionId as any);
    }
    setShowCreateMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] pt-20">
      <div className="max-w-[1900px] mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,800px)] xl:grid-cols-[320px_minmax(0,800px)_360px] gap-6 justify-center">

          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              {user && <ProfileStatsWidget />}

              <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden shadow-lg shadow-black/50">
                <div className="p-4">
                  <div className="relative">
                    <button
                      onClick={() => {
                        if (!user) {
                          alert('Vous devez être connecté pour créer du contenu');
                          navigate('/login');
                          return;
                        }
                        setShowCreateMenu(!showCreateMenu);
                      }}
                      className="w-full bg-gradient-to-r from-streetiz-red to-red-600 hover:from-red-600 hover:to-streetiz-red text-white font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-streetiz-red/30 hover:shadow-streetiz-red/50 hover:scale-[1.02]"
                    >
                      <Plus className="w-5 h-5" />
                      CRÉER
                      <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${showCreateMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showCreateMenu && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-[#222] rounded-xl overflow-hidden shadow-2xl z-50">
                        {createActions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={action.id}
                              onClick={() => handleCreateAction(action.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#1a1a1a] transition-colors"
                            >
                              <Icon className="w-4 h-4 text-streetiz-red" />
                              <span className="text-sm font-semibold">{action.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden shadow-lg shadow-black/50">
                <div className="p-4 border-b border-[#222]">
                  <h3 className="text-white font-black text-sm uppercase tracking-wider">Navigation</h3>
                </div>
                <div className="p-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                          selectedCategory === cat.id
                            ? 'bg-gradient-to-r from-streetiz-red to-red-600 text-white shadow-lg shadow-streetiz-red/30'
                            : 'text-[#888] hover:bg-[#1a1a1a] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-semibold">{cat.label}</span>
                        </div>
                        {cat.badge > 0 && (
                          <span className={`text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center ${
                            selectedCategory === cat.id
                              ? 'bg-white/20 text-white'
                              : 'bg-streetiz-red text-white'
                          }`}>
                            {cat.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  <div className="my-2 border-t border-[#222]" />

                  <button
                    onClick={() => {
                      setSelectedCategory('posts');
                      setSelectedFeedTab('messages');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      selectedFeedTab === 'messages'
                        ? 'bg-gradient-to-r from-streetiz-red to-red-600 text-white shadow-lg shadow-streetiz-red/30'
                        : 'text-[#888] hover:bg-[#1a1a1a] hover:text-white'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">Messagerie</span>
                  </button>
                </div>
              </div>

              <TrendingTags />

              {selectedCategory === 'members' && <MemberSearch onViewProfile={handleViewProfile} />}
            </div>
          </aside>

          {/* MAIN FEED */}
          <main className="min-h-screen">
            {selectedCategory === 'posts' && (
              <>
                <div className="flex flex-wrap items-center gap-2 mb-6 bg-[#111] rounded-2xl p-2 border border-[#222] shadow-lg shadow-black/50">
                  <button
                    onClick={() => setSelectedFeedTab('global')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      selectedFeedTab === 'global'
                        ? 'bg-gradient-to-r from-streetiz-red to-red-600 text-white shadow-lg shadow-streetiz-red/30'
                        : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    Feed Principal
                  </button>
                  <button
                    onClick={() => setSelectedFeedTab('following')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      selectedFeedTab === 'following'
                        ? 'bg-gradient-to-r from-streetiz-red to-red-600 text-white shadow-lg shadow-streetiz-red/30'
                        : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <UsersIcon className="w-4 h-4" />
                    Mes Abonnements
                  </button>
                  <button
                    onClick={() => setSelectedFeedTab('recommended')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      selectedFeedTab === 'recommended'
                        ? 'bg-gradient-to-r from-streetiz-red to-red-600 text-white shadow-lg shadow-streetiz-red/30'
                        : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Recommandés
                  </button>
                  <button
                    onClick={() => setSelectedFeedTab('trending')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      selectedFeedTab === 'trending'
                        ? 'bg-gradient-to-r from-streetiz-red to-red-600 text-white shadow-lg shadow-streetiz-red/30'
                        : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <Flame className="w-4 h-4" />
                    Tendances
                  </button>
                </div>

                {selectedFeedTab !== 'messages' && <NewMembersCarousel onViewProfile={handleViewProfile} />}

                {selectedFeedTab === 'messages' ? (
                  <MessagesInbox onViewProfile={handleViewProfile} />
                ) : loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-streetiz-red/20 border-t-streetiz-red rounded-full animate-spin" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-[#111] rounded-2xl border border-[#222] p-12 text-center shadow-lg shadow-black/50">
                    <Home className="w-16 h-16 text-[#333] mx-auto mb-4" />
                    <h3 className="text-white font-black text-2xl mb-3">
                      {selectedFeedTab === 'following' ? 'Aucun post de vos abonnements' :
                       selectedFeedTab === 'trending' ? 'Aucun post tendance' :
                       selectedFeedTab === 'recommended' ? 'Aucune recommandation' :
                       'Aucun post pour le moment'}
                    </h3>
                    <p className="text-[#666] mb-6">
                      {selectedFeedTab === 'following'
                        ? 'Suivez des membres pour voir leurs posts ici!'
                        : 'Soyez le premier à partager du contenu!'}
                    </p>
                    {user && (
                      <button
                        onClick={() => setCreateModalType('post')}
                        className="bg-gradient-to-r from-streetiz-red to-red-600 hover:from-red-600 hover:to-streetiz-red text-white font-bold py-3 px-6 rounded-full transition-all shadow-lg shadow-streetiz-red/30"
                      >
                        Créer un post
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <FeedPost
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                        onComment={handleComment}
                        onShare={handleShare}
                        onSave={handleSave}
                        onViewProfile={handleViewProfile}
                        onMessage={handleOpenChat}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {selectedCategory === 'members' && (
              <div className="bg-[#111] rounded-2xl border border-[#222] p-8 text-center">
                <UsersIcon className="w-16 h-16 text-[#333] mx-auto mb-4" />
                <h3 className="text-white font-black text-2xl mb-3">Rechercher des membres</h3>
                <p className="text-[#666]">Utilisez la recherche dans la sidebar pour trouver des membres</p>
              </div>
            )}

            {selectedCategory === 'forum' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-white">Forum</h2>
                  <div className="flex items-center gap-3">
                    <select
                      value={forumSortBy}
                      onChange={(e) => setForumSortBy(e.target.value)}
                      className="bg-[#111] border border-[#222] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-streetiz-red"
                    >
                      <option value="recent">Les + récents</option>
                      <option value="popular">Populaires</option>
                      <option value="unresolved">Non résolus</option>
                    </select>
                    {user && (
                      <button
                        onClick={() => setShowCreateForumTopic(true)}
                        className="bg-gradient-to-r from-streetiz-red to-red-600 text-white px-5 py-2 rounded-xl font-bold hover:shadow-lg hover:shadow-streetiz-red/30 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Créer un topic
                      </button>
                    )}
                  </div>
                </div>
                <ForumList
                  onTopicClick={setSelectedTopicId}
                  sortBy={forumSortBy}
                />
              </>
            )}

            {selectedCategory === 'marketplace' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-white">Marketplace</h2>
                  <div className="flex items-center gap-3">
                    <select
                      value={marketplaceCategory}
                      onChange={(e) => setMarketplaceCategory(e.target.value)}
                      className="bg-[#111] border border-[#222] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-streetiz-red"
                    >
                      <option value="all">Toutes catégories</option>
                      <option value="dj_gear">DJ</option>
                      <option value="video">Vidéo</option>
                      <option value="audio">Enceintes</option>
                      <option value="accessories">Accessoires</option>
                      <option value="lighting">Lumières</option>
                      <option value="other">Divers</option>
                    </select>
                    {user && (
                      <button
                        onClick={() => setShowCreateMarketplaceItem(true)}
                        className="bg-gradient-to-r from-streetiz-red to-red-600 text-white px-5 py-2 rounded-xl font-bold hover:shadow-lg hover:shadow-streetiz-red/30 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Créer une annonce
                      </button>
                    )}
                  </div>
                </div>
                <MarketplaceList
                  onItemClick={setSelectedMarketplaceItemId}
                  category={marketplaceCategory}
                />
              </>
            )}

            {selectedCategory === 'casting' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-white">Castings & Jobs</h2>
                  <div className="flex items-center gap-3">
                    <select
                      value={castingType}
                      onChange={(e) => setCastingType(e.target.value)}
                      className="bg-[#111] border border-[#222] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-streetiz-red"
                    >
                      <option value="all">Tous types</option>
                      <option value="DJ">DJ</option>
                      <option value="Danseur">Danseur</option>
                      <option value="Vidéo">Vidéo</option>
                      <option value="Staff">Staff</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Figuration">Figuration</option>
                    </select>
                    {user && (
                      <button
                        onClick={() => setShowCreateCasting(true)}
                        className="bg-gradient-to-r from-streetiz-red to-red-600 text-white px-5 py-2 rounded-xl font-bold hover:shadow-lg hover:shadow-streetiz-red/30 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Poster une annonce
                      </button>
                    )}
                  </div>
                </div>
                <CastingsList
                  onCastingClick={setSelectedCastingId}
                  type={castingType}
                />
              </>
            )}

            {selectedCategory === 'announcements' && (
              <div className="bg-[#111] rounded-2xl border border-[#222] p-12 text-center">
                <FileText className="w-16 h-16 text-[#333] mx-auto mb-4" />
                <h3 className="text-white font-black text-2xl mb-3">Bientôt disponible</h3>
                <p className="text-[#666] mb-6">Cette section est en cours de développement</p>
              </div>
            )}
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-4">
              <OnlineMembers
                onViewProfile={handleViewProfile}
                onOpenChat={handleOpenChat}
              />

              <ActivityFeed onViewProfile={handleViewProfile} />

              {user && friends.length > 0 && (
                <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden shadow-lg shadow-black/50">
                  <div className="p-4 border-b border-[#222] flex items-center justify-between">
                    <h3 className="text-white font-black text-sm uppercase tracking-wider">Mes Amis</h3>
                    <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      {friends.filter(f => f.online_status === 'online').length}
                    </span>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto">
                    <div className="p-2">
                      {friends
                        .sort((a, b) => {
                          if (a.online_status === 'online' && b.online_status !== 'online') return -1;
                          if (a.online_status !== 'online' && b.online_status === 'online') return 1;
                          return 0;
                        })
                        .slice(0, 6)
                        .map((friend) => (
                          <div
                            key={friend.id}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#1a1a1a] transition-colors group"
                          >
                            <button
                              onClick={() => handleViewProfile(friend.id)}
                              className="relative flex-shrink-0"
                            >
                              <img
                                src={friend.avatar_url || `https://ui-avatars.com/api/?name=${friend.username}&background=ef4444&color=fff&size=36`}
                                alt={friend.username}
                                className="w-9 h-9 rounded-full object-cover"
                              />
                              {friend.online_status === 'online' && (
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#111] rounded-full" />
                              )}
                            </button>
                            <button
                              onClick={() => handleViewProfile(friend.id)}
                              className="flex-1 text-left min-w-0"
                            >
                              <p className="text-white text-xs font-semibold truncate">
                                {friend.display_name || friend.username}
                              </p>
                              <p className="text-[#666] text-[10px] truncate">@{friend.username}</p>
                            </button>
                            <button
                              onClick={() => handleOpenChat(friend.id, friend.display_name || friend.username, friend.avatar_url)}
                              className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-streetiz-red hover:bg-red-600 rounded-full flex items-center justify-center transition-all flex-shrink-0"
                              title="Message"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {createModalType && (
        <CreateContentModal
          initialType={createModalType}
          onClose={() => setCreateModalType(null)}
          onSuccess={() => {
            if (selectedCategory === 'posts') {
              loadPosts();
            }
          }}
        />
      )}


      {openChats.map((chat, index) => (
        <div key={chat.id} style={{ right: `${20 + index * 470}px` }} className="fixed bottom-0 z-40">
          <ChatWindow
            recipientId={chat.id}
            recipientName={chat.name}
            recipientAvatar={chat.avatar}
            onClose={() => handleCloseChat(chat.id)}
          />
        </div>
      ))}

      {selectedTopicId && (
        <ForumTopicModal
          topicId={selectedTopicId}
          onClose={() => setSelectedTopicId(null)}
        />
      )}

      {showCreateForumTopic && (
        <CreateForumTopicModal
          onClose={() => setShowCreateForumTopic(false)}
          onSuccess={() => {
            setShowCreateForumTopic(false);
            window.location.reload();
          }}
        />
      )}

      {selectedMarketplaceItemId && (
        <MarketplaceItemModal
          itemId={selectedMarketplaceItemId}
          onClose={() => setSelectedMarketplaceItemId(null)}
        />
      )}

      {showCreateMarketplaceItem && (
        <CreateMarketplaceItemModal
          onClose={() => setShowCreateMarketplaceItem(false)}
          onSuccess={() => {
            setShowCreateMarketplaceItem(false);
            window.location.reload();
          }}
        />
      )}

      {selectedCastingId && (
        <CastingDetailModal
          castingId={selectedCastingId}
          onClose={() => setSelectedCastingId(null)}
        />
      )}

      {showCreateCasting && (
        <CreateCastingModal
          onClose={() => setShowCreateCasting(false)}
          onSuccess={() => {
            setShowCreateCasting(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
