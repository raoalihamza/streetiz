import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Radio } from 'lucide-react';

export default function AudioPlayer() {
  const [mode, setMode] = useState<'mix' | 'radio'>('mix');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const mixData = {
    title: 'Techno Sessions Vol. 4',
    artist: 'DJ Mixmaster',
    image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
  };

  const radioData = {
    title: 'STREETIZ RADIO',
    tagline: 'Electronic Music 24/7',
    isLive: true,
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="card-premium p-5">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <button
          onClick={() => setMode('mix')}
          className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${
            mode === 'mix'
              ? 'bg-streetiz-red text-white'
              : 'bg-[#1a1a1a] text-[#666666] hover:text-white'
          }`}
        >
          MIX PLAYER
        </button>
        <button
          onClick={() => setMode('radio')}
          className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${
            mode === 'radio'
              ? 'bg-streetiz-red text-white'
              : 'bg-[#1a1a1a] text-[#666666] hover:text-white'
          }`}
        >
          RADIO LIVE
        </button>
      </div>

      {mode === 'mix' ? (
        <div className="space-y-4">
          <div className="aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-xl overflow-hidden relative group">
            <img
              src={mixData.image}
              alt={mixData.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h4 className="font-bold text-sm line-clamp-1">{mixData.title}</h4>
              <p className="text-xs text-[#a0a0a0]">{mixData.artist}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative h-1 bg-[#1a1a1a] rounded-full overflow-hidden cursor-pointer group">
              <div
                className="absolute h-full bg-streetiz-red transition-all"
                style={{ width: `${progressPercentage}%` }}
              ></div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${progressPercentage}%`, transform: 'translate(-50%, -50%)' }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#666666]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={togglePlayPause}
              className="w-12 h-12 bg-streetiz-red rounded-full flex items-center justify-center hover:bg-[#FF1808] transition-all hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white fill-white" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              )}
            </button>
            <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
              <Volume2 className="w-5 h-5 text-[#a0a0a0]" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="aspect-square bg-gradient-to-br from-streetiz-red/20 to-[#0a0a0a] rounded-xl flex flex-col items-center justify-center p-6 border border-streetiz-red/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(225,6,0,0.15)_0%,_transparent_70%)]"></div>

            <div className="relative z-10 text-center space-y-4">
              <Radio className="w-16 h-16 text-streetiz-red mx-auto animate-pulse" />

              {radioData.isLive && (
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-streetiz-red rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="text-xs font-black tracking-wider">ON AIR</span>
                </div>
              )}

              <div>
                <h4 className="font-black text-xl tracking-wider">{radioData.title}</h4>
                <p className="text-xs text-[#a0a0a0] mt-1">{radioData.tagline}</p>
              </div>
            </div>
          </div>

          <button
            onClick={togglePlayPause}
            className="w-full py-3 bg-streetiz-red rounded-lg font-bold text-sm hover:bg-[#FF1808] transition-all hover:scale-105 flex items-center justify-center space-x-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>STOP STREAMING</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 ml-0.5" />
                <span>START STREAMING</span>
              </>
            )}
          </button>
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  );
}
