import { Heart, Share2, Play, Download, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import SoundCloudModal from './SoundCloudModal';

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
  genre?: string;
  downloadUrl?: string;
  purchaseUrl?: string;
  purchasePlatform?: 'beatport' | 'bandcamp' | 'other';
  onLike?: () => void;
  onComment?: () => void;
  onPlay?: () => void;
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
  genre,
  downloadUrl,
  purchaseUrl,
  purchasePlatform = 'other',
  onLike,
  onComment,
  onPlay,
}: MusicPostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [showSoundCloudModal, setShowSoundCloudModal] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    onLike?.();
  };

  const handlePlay = () => {
    setShowSoundCloudModal(true);
    onPlay?.();
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
        <>
          <div className="relative w-full aspect-video bg-gradient-to-br from-orange-900/20 to-[#0a0a0a] rounded-t-xl overflow-hidden group/sound cursor-pointer">
            {coverUrl && (
              <img
                src={coverUrl}
                alt={title}
                className="w-full h-full object-cover opacity-60 group-hover/sound:opacity-40 transition-opacity"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover/sound:bg-black/50 transition-colors">
              <button
                onClick={handlePlay}
                className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 hover:scale-110 transition-all"
              >
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </button>
            </div>
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-orange-500 rounded-full flex items-center gap-1.5">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-bold">SoundCloud</span>
            </div>
          </div>

          <SoundCloudModal
            isOpen={showSoundCloudModal}
            onClose={() => setShowSoundCloudModal(false)}
            soundcloudUrl={soundcloudUrl}
            title={title}
            artist={artist}
          />
        </>
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
    <article className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 hover:border-streetiz-red/30 transition-all group">
      {renderMedia()}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base mb-1 line-clamp-2 group-hover:text-streetiz-red transition-colors">
              {title}
            </h3>
            <p className="text-gray-400 text-sm">{artist}</p>
          </div>
          {genre && (
            <span className="flex-shrink-0 px-2.5 py-1 bg-streetiz-red/10 border border-streetiz-red/30 rounded-full text-streetiz-red text-xs font-semibold uppercase">
              {genre}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors ${
              isLiked ? 'text-streetiz-red' : 'text-gray-400 hover:text-streetiz-red'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-streetiz-red' : ''}`} />
            <span className="text-sm font-semibold">{likeCount}</span>
          </button>

          <div className="flex items-center gap-2">
            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-green-500 hover:text-green-400 transition-colors group/dl"
                title="Free Download"
              >
                <Download className="w-4 h-4 group-hover/dl:animate-bounce" />
                <span className="text-xs font-semibold">Free</span>
              </a>
            )}

            {purchaseUrl && (
              <a
                href={purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-500 hover:text-blue-400 transition-colors"
                title={`Buy on ${purchasePlatform === 'beatport' ? 'Beatport' : purchasePlatform === 'bandcamp' ? 'Bandcamp' : 'Store'}`}
              >
                {purchasePlatform === 'beatport' ? (
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-xs font-bold">BP</span>
                  </div>
                ) : purchasePlatform === 'bandcamp' ? (
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-xs font-bold">BC</span>
                  </div>
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
              </a>
            )}

            <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
