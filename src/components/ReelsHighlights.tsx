import { Play, Heart, Eye } from 'lucide-react';
import { useState } from 'react';

interface Reel {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  instagramUrl?: string;
  likes: number;
  plays: number;
  tags: string[];
}

interface ReelsHighlightsProps {
  reels: Reel[];
  onReelClick?: (reel: Reel) => void;
}

export default function ReelsHighlights({ reels, onReelClick }: ReelsHighlightsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (reels.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-white mb-1">Reels & Stories</h2>
          <p className="text-gray-400 text-sm">Les meilleurs moments en format court</p>
        </div>
        <button className="text-streetiz-red hover:text-red-400 text-sm font-semibold transition-colors">
          Voir tout
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        {reels.slice(0, 4).map((reel) => (
          <div
            key={reel.id}
            className="relative flex-shrink-0 w-[220px] h-[390px] rounded-2xl overflow-hidden cursor-pointer group snap-start"
            onMouseEnter={() => setHoveredId(reel.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onReelClick?.(reel)}
          >
            <img
              src={reel.coverUrl}
              alt={reel.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />

            <div
              className={`absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${
                hoveredId === reel.id ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/60">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </div>

            <div className="absolute top-4 left-4 right-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-lg">
                  {reel.artist.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate drop-shadow-lg">
                    {reel.artist}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-base mb-2 line-clamp-2 drop-shadow-lg">
                {reel.title}
              </h3>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {reel.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium border border-white/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-white text-sm">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-white" />
                  <span className="font-semibold drop-shadow-lg">
                    {reel.likes > 1000 ? `${(reel.likes / 1000).toFixed(1)}k` : reel.likes}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span className="font-semibold drop-shadow-lg">
                    {reel.plays > 1000 ? `${(reel.plays / 1000).toFixed(1)}k` : reel.plays}
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
