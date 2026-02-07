import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Download, ExternalLink } from 'lucide-react';

interface CarouselItem {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  tags: string[];
  platforms?: string[];
  externalUrl?: string;
  hasDownload?: boolean;
  onPlay?: () => void;
}

interface MusicCarouselProps {
  title: string;
  items: CarouselItem[];
  onPlayItem: (id: string) => void;
}

export default function MusicCarousel({ title, items, onPlayItem }: MusicCarouselProps) {
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

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      spotify: 'bg-green-500',
      deezer: 'bg-orange-500',
      soundcloud: 'bg-orange-600',
      beatport: 'bg-green-600',
      youtube: 'bg-red-600',
    };
    return colors[platform.toLowerCase()] || 'bg-gray-500';
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-black text-white">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 bg-[#181818] hover:bg-[#282828] rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 bg-[#181818] hover:bg-[#282828] rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-[180px] md:w-[200px] bg-[#181818] rounded-xl overflow-hidden hover:bg-[#282828] transition-all group/item cursor-pointer"
          >
            <div className="relative aspect-square">
              <img
                src={item.coverUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => onPlayItem(item.id)}
                  className="w-12 h-12 bg-streetiz-red rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                >
                  <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                </button>
              </div>

              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-streetiz-red/90 backdrop-blur-sm rounded text-[10px] font-bold text-white uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {item.platforms && item.platforms.length > 0 && (
                <div className="absolute bottom-2 right-2 flex gap-1">
                  {item.platforms.map((platform, index) => (
                    <div
                      key={index}
                      className={`w-6 h-6 ${getPlatformColor(platform)} rounded-full flex items-center justify-center`}
                      title={platform}
                    >
                      <span className="text-white text-[8px] font-bold">
                        {platform[0].toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-white font-bold text-sm mb-1 truncate group-hover/item:text-streetiz-red transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-400 text-xs truncate mb-3">{item.artist}</p>

              <div className="flex items-center gap-2">
                {item.hasDownload && (
                  <button className="p-2 bg-[#282828] hover:bg-[#383838] rounded-lg transition-colors flex-1">
                    <Download className="w-4 h-4 text-gray-400 mx-auto" />
                  </button>
                )}
                {item.externalUrl && (
                  <button className="p-2 bg-[#282828] hover:bg-[#383838] rounded-lg transition-colors flex-1">
                    <ExternalLink className="w-4 h-4 text-gray-400 mx-auto" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
