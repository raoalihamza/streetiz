import { useRef } from 'react';
import { Play, ChevronLeft, ChevronRight, MapPin, Calendar } from 'lucide-react';

interface DJSetLive {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  videoUrl: string;
  event?: string;
  location?: string;
  date?: string;
  tags: string[];
  onPlay: () => void;
}

interface DJSetsLiveProps {
  sets: DJSetLive[];
}

export default function DJSetsLive({ sets }: DJSetsLiveProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-black text-white mb-1">DJ Sets Live</h2>
          <p className="text-gray-400 text-sm">Filmed live performances from festivals and clubs</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 bg-[#181818] hover:bg-[#282828] rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 bg-[#181818] hover:bg-[#282828] rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sets.map((set) => (
          <div
            key={set.id}
            className="flex-shrink-0 w-[420px] bg-[#181818] rounded-2xl overflow-hidden hover:bg-[#282828] transition-all group cursor-pointer"
          >
            <div className="relative aspect-video">
              <img
                src={set.thumbnailUrl}
                alt={set.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={set.onPlay}
                  className="w-16 h-16 bg-streetiz-red rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
                >
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </button>
              </div>

              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                {set.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-streetiz-red/90 backdrop-blur-sm rounded-lg text-xs font-bold text-white uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">
                  {set.artist}
                </h3>
                <p className="text-gray-300 text-sm mb-2 line-clamp-1">
                  {set.title}
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {set.event && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{set.event}</span>
                    </div>
                  )}
                  {set.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{set.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
