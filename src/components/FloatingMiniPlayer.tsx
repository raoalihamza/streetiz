import React from 'react';
import { Play, Pause, X, SkipForward } from 'lucide-react';

interface FloatingMiniPlayerProps {
  isVisible: boolean;
  isPlaying: boolean;
  title: string;
  artist: string;
  coverUrl: string;
  onPlayPause: () => void;
  onNext?: () => void;
  onClose: () => void;
}

export default function FloatingMiniPlayer({
  isVisible,
  isPlaying,
  title,
  artist,
  coverUrl,
  onPlayPause,
  onNext,
  onClose,
}: FloatingMiniPlayerProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-8 duration-300">
      <div className="bg-[#111] rounded-2xl shadow-2xl overflow-hidden border border-[#222] w-80">
        <div className="flex items-center gap-3 p-3">
          <img
            src={coverUrl}
            alt={title}
            className="w-14 h-14 rounded-lg object-cover"
          />

          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold text-sm truncate">{title}</h4>
            <p className="text-[#888] text-xs truncate">{artist}</p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onPlayPause}
              className="w-10 h-10 bg-streetiz-red hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white fill-white" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              )}
            </button>

            {onNext && (
              <button
                onClick={onNext}
                className="w-9 h-9 hover:bg-[#222] rounded-full flex items-center justify-center transition-colors"
              >
                <SkipForward className="w-4 h-4 text-[#888]" />
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 hover:bg-[#222] rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-[#888]" />
            </button>
          </div>
        </div>

        <div className="h-1 bg-[#222]">
          <div className="h-full bg-streetiz-red w-1/3" />
        </div>
      </div>
    </div>
  );
}
