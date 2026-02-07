import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Play, Music, ExternalLink, UserPlus, Send, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import InlineAudioPlayer from './InlineAudioPlayer';

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
  profiles: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  user_liked?: boolean;
  user_saved?: boolean;
}

interface FeedPostProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onSave: (postId: string) => void;
  onViewProfile?: (userId: string) => void;
  onFollow?: (userId: string) => void;
  onMessage?: (userId: string, username: string, avatar: string | null) => void;
}

export default function FeedPost({ post, onLike, onComment, onShare, onSave, onViewProfile, onFollow, onMessage }: FeedPostProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    if (onFollow && user) {
      onFollow(post.profiles.id);
      setIsFollowing(!isFollowing);
    }
  };

  const getTagColor = (tag: string) => {
    const lowerTag = tag.toLowerCase();
    if (lowerTag.includes('electro')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (lowerTag.includes('dance')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (lowerTag.includes('techno')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (lowerTag.includes('house')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (lowerTag.includes('afro')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (lowerTag.includes('workshop')) return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const renderMedia = () => {
    if (post.post_type === 'video') {
      if (post.youtube_url) {
        const embedUrl = getYouTubeEmbedUrl(post.youtube_url);
        if (embedUrl) {
          return (
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }
      }
      if (post.tiktok_url) {
        return (
          <div className="relative aspect-[9/16] max-h-[500px] bg-black rounded-xl overflow-hidden mx-auto">
            <div className="w-full h-full flex items-center justify-center">
              <a
                href={post.tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white hover:text-streetiz-red transition-colors"
              >
                <Play className="w-12 h-12" />
                <span className="text-lg font-bold">Watch on TikTok</span>
              </a>
            </div>
          </div>
        );
      }
    }

    if (post.post_type === 'audio' && post.audio_url) {
      return (
        <div className="bg-[#0a0a0a] rounded-xl p-4">
          <InlineAudioPlayer
            title={post.audio_title || 'Untitled'}
            artist={post.audio_artist || 'Unknown Artist'}
            audioUrl={post.audio_url}
            coverUrl={post.audio_cover_url || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
          />
        </div>
      );
    }

    if (post.post_type === 'photo' && post.media_urls && post.media_urls.length > 0) {
      return (
        <div className={`grid gap-2 rounded-xl overflow-hidden ${
          post.media_urls.length === 1 ? 'grid-cols-1' :
          post.media_urls.length === 2 ? 'grid-cols-2' :
          'grid-cols-2'
        }`}>
          {post.media_urls.slice(0, 4).map((url, idx) => (
            <div
              key={idx}
              className={`relative ${post.media_urls!.length === 3 && idx === 0 ? 'col-span-2' : ''} aspect-square bg-[#0a0a0a]`}
            >
              <img
                src={url}
                alt={`Post image ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      );
    }

    if (post.post_type === 'article' && post.article_link) {
      return (
        <a
          href={post.article_link}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-[#0a0a0a] rounded-xl overflow-hidden hover:bg-[#111] transition-colors group"
        >
          {post.article_image_url && (
            <div className="aspect-video bg-black overflow-hidden">
              <img
                src={post.article_image_url}
                alt={post.article_title || 'Article'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-center gap-2 text-streetiz-red mb-2">
              <ExternalLink className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Article</span>
            </div>
            <h3 className="text-white font-bold text-lg group-hover:text-streetiz-red transition-colors">
              {post.article_title || 'Read Article'}
            </h3>
          </div>
        </a>
      );
    }

    return null;
  };

  return (
    <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden hover:border-[#333] transition-all shadow-lg shadow-black/30 hover:shadow-black/50">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <button
            onClick={() => onViewProfile?.(post.profiles.id)}
            className="flex-shrink-0"
          >
            <img
              src={post.profiles.avatar_url || `https://ui-avatars.com/api/?name=${post.profiles.username}&background=ef4444&color=fff&size=44`}
              alt={post.profiles.username}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-transparent hover:ring-streetiz-red transition-all"
            />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => onViewProfile?.(post.profiles.id)}
                className="text-white font-bold text-sm hover:text-streetiz-red transition-colors"
              >
                {post.profiles.display_name || post.profiles.username}
              </button>
              {post.category && (
                <span className="bg-streetiz-red/20 text-streetiz-red px-2 py-0.5 rounded-full text-[10px] font-bold border border-streetiz-red/30">
                  {post.category}
                </span>
              )}
            </div>
            <p className="text-[#666] text-xs">
              @{post.profiles.username} · {new Date(post.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
          {user && user.id !== post.profiles.id && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleFollow}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isFollowing
                    ? 'bg-[#1a1a1a] text-white border border-[#333] hover:border-streetiz-red'
                    : 'bg-gradient-to-r from-streetiz-red to-red-600 text-white hover:from-red-600 hover:to-streetiz-red shadow-md shadow-streetiz-red/20'
                }`}
              >
                <UserPlus className="w-3 h-3" />
                {isFollowing ? 'Abonné' : 'Suivre'}
              </button>
              <button
                onClick={() => onMessage?.(post.profiles.id, post.profiles.display_name || post.profiles.username, post.profiles.avatar_url)}
                className="w-7 h-7 bg-[#1a1a1a] hover:bg-streetiz-red border border-[#333] hover:border-streetiz-red rounded-full flex items-center justify-center transition-all"
                title="Message"
              >
                <Send className="w-3 h-3 text-white" />
              </button>
              <button
                onClick={() => onViewProfile?.(post.profiles.id)}
                className="w-7 h-7 bg-[#1a1a1a] hover:bg-streetiz-red border border-[#333] hover:border-streetiz-red rounded-full flex items-center justify-center transition-all"
                title="Voir profil"
              >
                <Eye className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
        </div>

        {post.content && (
          <p className="text-white text-sm mb-3 whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {renderMedia()}

        {post.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all hover:scale-105 cursor-pointer ${getTagColor(tag)}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-5 mt-3 pt-3 border-t border-[#222]">
          <button
            onClick={() => user && onLike(post.id)}
            className={`flex items-center gap-1.5 transition-all hover:scale-110 ${
              post.user_liked ? 'text-streetiz-red' : 'text-[#666] hover:text-streetiz-red'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.user_liked ? 'fill-current' : ''}`} />
            <span className="text-xs font-bold">{post.likes_count}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-[#666] hover:text-white transition-all hover:scale-110"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-bold">{post.comments_count}</span>
          </button>

          <button
            onClick={() => user && onShare(post.id)}
            className="flex items-center gap-1.5 text-[#666] hover:text-white transition-all hover:scale-110"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-xs font-bold">{post.shares_count}</span>
          </button>

          <button
            onClick={() => user && onSave(post.id)}
            className={`flex items-center gap-1.5 ml-auto transition-all hover:scale-110 ${
              post.user_saved ? 'text-streetiz-red' : 'text-[#666] hover:text-streetiz-red'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${post.user_saved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
