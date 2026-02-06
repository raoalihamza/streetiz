import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Play, Music, ExternalLink } from 'lucide-react';
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
}

export default function FeedPost({ post, onLike, onComment, onShare, onSave }: FeedPostProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);

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
    <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden hover:border-[#333] transition-colors">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={post.profiles.avatar_url || `https://ui-avatars.com/api/?name=${post.profiles.username}&background=ef4444&color=fff&size=48`}
            alt={post.profiles.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <h4 className="text-white font-bold text-sm hover:text-streetiz-red transition-colors cursor-pointer">
              {post.profiles.display_name || post.profiles.username}
            </h4>
            <p className="text-[#666] text-xs">
              @{post.profiles.username} · {new Date(post.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
          {post.category && (
            <span className="bg-streetiz-red/20 text-streetiz-red px-3 py-1 rounded-full text-xs font-bold">
              {post.category}
            </span>
          )}
        </div>

        {post.content && (
          <p className="text-white text-sm mb-4 whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {renderMedia()}

        {post.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-4">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-[#1a1a1a] text-[#888] px-2 py-1 rounded text-xs hover:bg-[#222] hover:text-white transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-6 mt-5 pt-4 border-t border-[#222]">
          <button
            onClick={() => user && onLike(post.id)}
            className={`flex items-center gap-2 transition-colors ${
              post.user_liked ? 'text-streetiz-red' : 'text-[#666] hover:text-streetiz-red'
            }`}
          >
            <Heart className={`w-5 h-5 ${post.user_liked ? 'fill-current' : ''}`} />
            <span className="text-sm font-semibold">{post.likes_count}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-[#666] hover:text-white transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">{post.comments_count}</span>
          </button>

          <button
            onClick={() => user && onShare(post.id)}
            className="flex items-center gap-2 text-[#666] hover:text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-semibold">{post.shares_count}</span>
          </button>

          <button
            onClick={() => user && onSave(post.id)}
            className={`flex items-center gap-2 ml-auto transition-colors ${
              post.user_saved ? 'text-streetiz-red' : 'text-[#666] hover:text-streetiz-red'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${post.user_saved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
