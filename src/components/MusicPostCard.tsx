import { Heart, MessageCircle, Share2, Play } from 'lucide-react';
import { useState } from 'react';

interface MusicPostCardProps {
  id: string;
  title: string;
  artist: string;
  description?: string;
  contentType: 'youtube' | 'soundcloud' | 'instagram';
  youtubeEmbedId?: string;
  soundcloudUrl?: string;
  instagramUrl?: string;
  likes: number;
  comments?: number;
  coverUrl?: string;
  tags?: string[];
  onLike?: () => void;
  onComment?: () => void;
}

export default function MusicPostCard({
  title,
  artist,
  description,
  contentType,
  youtubeEmbedId,
  soundcloudUrl,
  instagramUrl,
  likes,
  comments = 0,
  coverUrl,
  tags = [],
  onLike,
  onComment,
}: MusicPostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    onLike?.();
  };

  const renderMedia = () => {
    if (contentType === 'youtube' && youtubeEmbedId) {
      return (
        <div className="relative w-full pb-[56.25%] bg-black rounded-xl overflow-hidden">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeEmbedId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (contentType === 'soundcloud' && soundcloudUrl) {
      return (
        <div className="relative w-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-xl overflow-hidden p-6">
          {coverUrl && (
            <div className="flex items-center gap-4 mb-4">
              <img
                src={coverUrl}
                alt={title}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="text-white font-bold text-lg mb-1">{title}</h4>
                <p className="text-gray-400 text-sm">{artist}</p>
              </div>
              <button className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-orange-500" />
            </div>
            <span>2:34 / 5:12</span>
          </div>
          <a
            href={soundcloudUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center text-sm text-orange-500 hover:text-orange-400 transition-colors"
          >
            Écouter sur SoundCloud →
          </a>
        </div>
      );
    }

    if (contentType === 'instagram' && instagramUrl) {
      return (
        <div className="relative bg-black rounded-xl overflow-hidden">
          <div className="relative w-full" style={{ paddingBottom: '177.78%' }}>
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20">
              {coverUrl && (
                <img
                  src={coverUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <button className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Play className="w-7 h-7 text-black fill-black ml-1" />
                </button>
              </div>
            </div>
          </div>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors"
          >
            Voir sur Instagram
          </a>
        </div>
      );
    }

    return null;
  };

  return (
    <article className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-streetiz-red to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {artist.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold">{artist}</h3>
            <p className="text-gray-400 text-sm">Music</p>
          </div>
        </div>

        {description && (
          <div className="mb-4">
            <h4 className="text-white font-semibold text-lg mb-2">{title}</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-streetiz-red/10 border border-streetiz-red/20 rounded-full text-streetiz-red text-xs font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pb-4">
        {renderMedia()}
      </div>

      <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors ${
            isLiked ? 'text-streetiz-red' : 'text-gray-400 hover:text-streetiz-red'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-streetiz-red' : ''}`} />
          <span className="text-sm font-semibold">{likeCount}</span>
        </button>

        <button
          onClick={onComment}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">{comments}</span>
        </button>

        <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </article>
  );
}
