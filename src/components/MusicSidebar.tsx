import { Radio, TrendingUp, Calendar, Music2, Play, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

interface ChartTrack {
  position: number;
  previousPosition?: number;
  title: string;
  artist: string;
  coverUrl: string;
  onPlay: () => void;
}

interface EventPromo {
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  url: string;
}

interface MusicSidebarProps {
  beatportTop10: ChartTrack[];
  streetizWeeklyChart: ChartTrack[];
  eventPromo?: EventPromo;
}

export default function MusicSidebar({
  beatportTop10,
  streetizWeeklyChart,
  eventPromo,
}: MusicSidebarProps) {
  const getPositionChange = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = previous - current;
    if (change > 0) {
      return (
        <div className="flex items-center text-green-500 text-xs">
          <ChevronUp className="w-3 h-3" />
          <span>{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-500 text-xs">
          <ChevronDown className="w-3 h-3" />
          <span>{Math.abs(change)}</span>
        </div>
      );
    }
    return <span className="text-gray-500 text-xs">-</span>;
  };

  return (
    <aside className="space-y-6">
      <div className="bg-gradient-to-br from-streetiz-red/20 to-transparent rounded-2xl p-6 border border-streetiz-red/30">
        <h3 className="text-streetiz-red font-black text-lg mb-4 flex items-center gap-2">
          <Radio className="w-5 h-5" />
          STREETIZ WEB RADIO
        </h3>
        <AudioPlayer />
      </div>

      <div className="bg-[#181818] rounded-2xl p-6 border border-[#282828]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-black text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Beatport Top 10
          </h3>
          <span className="text-xs text-gray-500 font-semibold">Electro</span>
        </div>

        <div className="space-y-3">
          {beatportTop10.slice(0, 10).map((track) => (
            <div
              key={track.position}
              onClick={track.onPlay}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 w-12">
                <span className="text-white font-bold text-sm w-6 text-center">
                  {track.position}
                </span>
                {getPositionChange(track.position, track.previousPosition)}
              </div>

              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-10 h-10 rounded object-cover flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h4 className="text-white text-sm font-semibold truncate group-hover:text-streetiz-red transition-colors">
                  {track.title}
                </h4>
                <p className="text-gray-400 text-xs truncate">{track.artist}</p>
              </div>

              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                <Play className="w-4 h-4 text-streetiz-red fill-streetiz-red" />
              </button>
            </div>
          ))}
        </div>

        <a
          href="https://www.beatport.com/genre/electro-house/3"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 text-green-500 hover:text-green-400 text-sm font-bold transition-colors"
        >
          <span>View Full Chart</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {eventPromo && (
        <div className="bg-[#181818] rounded-2xl overflow-hidden border border-[#282828] hover:border-streetiz-red/50 transition-all group cursor-pointer">
          <div className="relative h-40">
            <img
              src={eventPromo.imageUrl}
              alt={eventPromo.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="bg-streetiz-red px-3 py-1 rounded-full text-xs font-bold text-white">
                EVENT
              </span>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-2 text-streetiz-red text-xs font-bold mb-2">
              <Calendar className="w-4 h-4" />
              <span>{eventPromo.date}</span>
            </div>
            <h4 className="text-white font-bold mb-1 line-clamp-2">
              {eventPromo.title}
            </h4>
            <p className="text-gray-400 text-xs">{eventPromo.location}</p>
          </div>
        </div>
      )}

      <div className="bg-[#181818] rounded-2xl p-6 border border-[#282828]">
        <h3 className="text-white font-black text-lg mb-5 flex items-center gap-2">
          <Music2 className="w-5 h-5 text-streetiz-red" />
          Streetiz Weekly Chart
        </h3>

        <div className="space-y-3">
          {streetizWeeklyChart.slice(0, 10).map((track) => (
            <div
              key={track.position}
              onClick={track.onPlay}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 w-12">
                <span
                  className={`font-bold text-sm w-6 text-center ${
                    track.position <= 3 ? 'text-streetiz-red' : 'text-white'
                  }`}
                >
                  {track.position}
                </span>
                {getPositionChange(track.position, track.previousPosition)}
              </div>

              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-10 h-10 rounded object-cover flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h4 className="text-white text-sm font-semibold truncate group-hover:text-streetiz-red transition-colors">
                  {track.title}
                </h4>
                <p className="text-gray-400 text-xs truncate">{track.artist}</p>
              </div>

              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                <Play className="w-4 h-4 text-streetiz-red fill-streetiz-red" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#181818] rounded-2xl p-6 border border-[#282828] text-center">
        <p className="text-gray-500 text-sm mb-3">Advertisement</p>
        <div className="w-full h-[250px] bg-[#0F0F0F] rounded-lg flex items-center justify-center border border-[#282828]">
          <span className="text-gray-600 text-xs">Ad Space 300x250</span>
        </div>
      </div>
    </aside>
  );
}
