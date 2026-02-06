import React, { useRef, useState } from 'react';
import { Play, Pause, Heart, Download, ShoppingCart } from 'lucide-react';

interface TrackCardProps {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  genre: string;
  duration: number;
  plays: number;
  likes: number;
  buyUrl?: string;
  downloadUrl?: string;
  onPlay?: (id: string) => void;
}

export default function TrackCard({
  id,
  title,
  artist,
  coverUrl,
  audioUrl,
  genre,
  duration,
  plays,
  likes,
  buyUrl,
  downloadUrl,
  onPlay,
}: TrackCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      onPlay?.(id);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#111] rounded-2xl overflow-hidden hover:bg-[#151515] transition-all group">
      <div className="relative aspect-square">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 bg-streetiz-red rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white fill-white" />
          ) : (
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          )}
        </button>
        <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
          {genre}
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-white font-bold text-base mb-1 truncate">{title}</h3>
        <p className="text-[#888] text-sm mb-3 truncate">{artist}</p>

        <div className="mb-3">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-streetiz-red"
          />
          <div className="flex justify-between text-xs text-[#666] mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 hover:bg-[#222] rounded-lg transition-colors group"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isLiked ? 'fill-streetiz-red text-streetiz-red' : 'text-[#666] group-hover:text-white'
                }`}
              />
            </button>
            <span className="text-xs text-[#666]">{likes}</span>
          </div>

          <div className="flex items-center gap-1">
            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-[#222] rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 text-[#666] hover:text-white" />
              </a>
            )}
            {buyUrl && (
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-[#222] rounded-lg transition-colors"
              >
                <ShoppingCart className="w-4 h-4 text-[#666] hover:text-white" />
              </a>
            )}
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}
