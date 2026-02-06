import React from 'react';
import { Play, MapPin, Eye, Heart } from 'lucide-react';

interface DJSetCardProps {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  videoUrl?: string;
  description: string;
  genre: string;
  duration: number;
  plays: number;
  likes: number;
  isLive: boolean;
  eventLocation?: string;
  onClick: () => void;
}

export default function DJSetCard({
  title,
  artist,
  coverUrl,
  description,
  genre,
  duration,
  plays,
  likes,
  isLive,
  eventLocation,
  onClick,
}: DJSetCardProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-[#111] rounded-2xl overflow-hidden hover:bg-[#151515] transition-all cursor-pointer group"
    >
      <div className="relative aspect-video">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-20 h-20 bg-streetiz-red rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl">
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </button>
        </div>

        <div className="absolute top-3 left-3 flex items-center gap-2">
          {isLive && (
            <span className="bg-streetiz-red px-3 py-1 rounded-full text-xs font-bold text-white animate-pulse">
              LIVE
            </span>
          )}
          <span className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
            {genre}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
          {formatDuration(duration)}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
        <p className="text-streetiz-red text-sm font-semibold mb-3">{artist}</p>

        <p className="text-[#888] text-sm leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between text-xs text-[#666]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{plays.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{likes.toLocaleString()}</span>
            </div>
          </div>

          {eventLocation && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{eventLocation}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
