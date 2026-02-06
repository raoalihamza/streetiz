import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface InlineAudioPlayerProps {
  audioUrl: string;
  onPlay?: () => void;
}

export default function InlineAudioPlayer({ audioUrl, onPlay }: InlineAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      onPlay?.();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;

    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const percentage = x / bounds.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 bg-[#0a0a0a] rounded-lg p-3 border border-[#222]">
      <button
        onClick={togglePlay}
        className="w-9 h-9 flex-shrink-0 bg-streetiz-red hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-white fill-white" />
        ) : (
          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div
          onClick={handleSeek}
          className="relative h-8 cursor-pointer group"
        >
          <div className="absolute inset-0 flex items-center gap-0.5">
            {Array.from({ length: 50 }).map((_, i) => {
              const height = Math.random() * 60 + 40;
              const isPassed = (i / 50) * 100 < progress;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-all"
                  style={{
                    height: `${height}%`,
                    backgroundColor: isPassed ? '#ef4444' : '#333',
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="flex justify-between text-xs text-[#666] mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
}
