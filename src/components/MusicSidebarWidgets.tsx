import { TrendingUp, Music, Calendar, Radio } from 'lucide-react';

interface TopTrack {
  position: number;
  title: string;
  artist: string;
  coverUrl: string;
  change: number;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  artist: string;
  imageUrl: string;
}

interface MusicSidebarWidgetsProps {
  topTracks?: TopTrack[];
  upcomingEvents?: UpcomingEvent[];
  liveNow?: {
    title: string;
    artist: string;
    listeners: number;
  };
}

export default function MusicSidebarWidgets({
  topTracks = [],
  upcomingEvents = [],
  liveNow,
}: MusicSidebarWidgetsProps) {
  return (
    <div className="space-y-6">
      {liveNow && (
        <div className="bg-gradient-to-br from-streetiz-red to-red-600 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-bold uppercase tracking-wider">
                Live Now
              </span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">{liveNow.title}</h3>
            <p className="text-white/80 text-sm mb-3">{liveNow.artist}</p>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Radio className="w-4 h-4" />
              <span>{liveNow.listeners.toLocaleString()} listeners</span>
            </div>
          </div>
        </div>
      )}

      {topTracks.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-streetiz-red" />
            <h3 className="text-white font-bold text-lg">Top Tracks</h3>
          </div>
          <div className="space-y-3">
            {topTracks.slice(0, 5).map((track) => (
              <div
                key={track.position}
                className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 rounded-lg p-2 -mx-2 transition-colors"
              >
                <div className="text-gray-500 font-bold text-sm w-6 flex-shrink-0">
                  {track.position}
                </div>
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold truncate group-hover:text-streetiz-red transition-colors">
                    {track.title}
                  </div>
                  <div className="text-gray-400 text-xs truncate">{track.artist}</div>
                </div>
                <div
                  className={`text-xs font-bold ${
                    track.change > 0
                      ? 'text-green-500'
                      : track.change < 0
                      ? 'text-red-500'
                      : 'text-gray-500'
                  }`}
                >
                  {track.change > 0 ? '+' : ''}
                  {track.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingEvents.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-streetiz-red" />
            <h3 className="text-white font-bold text-lg">Upcoming Events</h3>
          </div>
          <div className="space-y-4">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="group cursor-pointer hover:bg-white/5 rounded-lg p-2 -mx-2 transition-colors"
              >
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-streetiz-red transition-colors">
                  {event.title}
                </h4>
                <p className="text-gray-400 text-xs mb-1">{event.artist}</p>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <span>{event.date}</span>
                  <span>•</span>
                  <span>{event.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <Music className="w-5 h-5 text-streetiz-red" />
          <h3 className="text-white font-bold text-lg">Discover Weekly</h3>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Fresh tracks curated just for you, updated every Monday
        </p>
        <button className="w-full bg-streetiz-red hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-colors">
          Listen Now
        </button>
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800">
        <img
          src="https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400"
          alt="Featured Event"
          className="w-full h-40 object-cover"
        />
        <div className="p-4">
          <span className="inline-block px-2 py-1 bg-streetiz-red/10 border border-streetiz-red/20 rounded text-streetiz-red text-xs font-bold mb-2">
            FEATURED
          </span>
          <h4 className="text-white font-bold mb-1">Streetiz Festival 2025</h4>
          <p className="text-gray-400 text-sm mb-3">March 15-17 • Paris, France</p>
          <button className="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
            Get Tickets
          </button>
        </div>
      </div>
    </div>
  );
}
