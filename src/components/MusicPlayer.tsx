import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover_image: string | null;
  audio_url: string;
  duration: number;
}

interface MusicPlayerProps {
  currentTrack: Track | null;
  playlist: Track[];
  onTrackChange: (track: Track) => void;
}

export default function MusicPlayer({ currentTrack, playlist, onTrackChange }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.audio_url;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      audioRef.current.muted = false;
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skipForward = () => {
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex < playlist.length - 1) {
      onTrackChange(playlist[currentIndex + 1]);
    } else if (isRepeat) {
      onTrackChange(playlist[0]);
    }
  };

  const skipBack = () => {
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      onTrackChange(playlist[currentIndex - 1]);
    }
  };

  const handleEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      skipForward();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#141414] border-t border-[#2a2a2a] backdrop-blur-urban">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
      />

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-14 h-14 bg-[#1a1a1a] rounded-md overflow-hidden flex-shrink-0">
              {currentTrack.cover_image ? (
                <img
                  src={currentTrack.cover_image}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-[#666666]" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-white truncate">{currentTrack.title}</h4>
              <p className="text-sm text-[#a0a0a0] truncate">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex-1 max-w-2xl">
            <div className="flex items-center justify-center space-x-4 mb-2">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 rounded-full transition-colors ${
                  isShuffle ? 'text-neon-red' : 'text-[#a0a0a0] hover:text-white'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={skipBack}
                className="p-2 rounded-full hover:bg-[#1a1a1a] transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-black fill-black" />
                ) : (
                  <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                )}
              </button>

              <button
                onClick={skipForward}
                className="p-2 rounded-full hover:bg-[#1a1a1a] transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-2 rounded-full transition-colors ${
                  isRepeat ? 'text-neon-red' : 'text-[#a0a0a0] hover:text-white'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#a0a0a0] w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-[#2a2a2a] rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                         [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-110"
              />
              <span className="text-xs text-[#a0a0a0] w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 flex-1 justify-end">
            <button onClick={toggleMute} className="p-2 rounded-full hover:bg-[#1a1a1a] transition-colors">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-[#2a2a2a] rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                       [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
