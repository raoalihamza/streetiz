import { Play, Clock, ExternalLink } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
}

interface DiscoverWeeklyProps {
  playlistTitle: string;
  playlistCover: string;
  trackCount: number;
  previewTracks: Track[];
  onPlayTrack: (trackId: string) => void;
  onViewFull: () => void;
}

export default function DiscoverWeekly({
  playlistTitle,
  playlistCover,
  trackCount,
  previewTracks,
  onPlayTrack,
  onViewFull,
}: DiscoverWeeklyProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#181818] rounded-2xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative w-full md:w-64 aspect-square rounded-xl overflow-hidden flex-shrink-0 group cursor-pointer">
          <img
            src={playlistCover}
            alt={playlistTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button className="w-16 h-16 bg-streetiz-red rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <span className="text-streetiz-red text-sm font-bold uppercase tracking-wider">
              Discover Weekly
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-2 mb-3">
              {playlistTitle}
            </h2>
            <p className="text-gray-400">
              Your personalized playlist · {trackCount} tracks
            </p>
          </div>

          <div className="space-y-2 mb-6">
            {previewTracks.slice(0, 6).map((track, index) => (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track.id)}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="w-8 text-center text-gray-500 text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold truncate group-hover:text-streetiz-red transition-colors">
                    {track.title}
                  </div>
                  <div className="text-gray-400 text-sm truncate">
                    {track.artist}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(track.duration)}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onViewFull}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full flex items-center gap-2 transition-all border border-white/10"
          >
            <ExternalLink className="w-5 h-5" />
            <span>View Full Playlist</span>
          </button>
        </div>
      </div>
    </div>
  );
}
