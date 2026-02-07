import { Clock, MapPin, Ticket } from 'lucide-react';

interface CompactEventCardProps {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  price: number;
  imageUrl: string;
  ticketUrl?: string;
  onClick: () => void;
  genre?: string;
  battleLevel?: string;
  isFashionWeek?: boolean;
}

export default function CompactEventCard({
  title,
  category,
  date,
  time,
  location,
  price,
  imageUrl,
  ticketUrl,
  onClick,
  genre,
  battleLevel,
  isFashionWeek,
}: CompactEventCardProps) {
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    };
  };

  const dateInfo = formatDate(date);

  return (
    <div
      onClick={onClick}
      className="bg-[#111] rounded-2xl overflow-hidden border border-[#222] hover:border-streetiz-red/50 transition-all cursor-pointer group"
    >
      <div className="relative aspect-[4/3]">
        <img
          src={imageUrl || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="bg-streetiz-red/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-white uppercase">
            {category}
          </span>
          {genre && (
            <span className="bg-purple-600/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-white">
              {genre}
            </span>
          )}
          {battleLevel && (
            <span className="bg-amber-500/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-white uppercase">
              {battleLevel === 'beginner' && '🥉 Beginner'}
              {battleLevel === 'intermediate' && '🥈 Intermediate'}
              {battleLevel === 'pro' && '🥇 Pro'}
            </span>
          )}
          {isFashionWeek && (
            <span className="bg-pink-600/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-white uppercase">
              Fashion Week
            </span>
          )}
          {price === 0 && (
            <span className="bg-green-600/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-white uppercase">
              FREE
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-center min-w-[60px]">
          <div className="text-xl font-black text-white leading-none">{dateInfo.day}</div>
          <div className="text-[10px] font-bold text-streetiz-red uppercase leading-none mt-0.5">
            {dateInfo.month}
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-bold text-base mb-3 line-clamp-2 group-hover:text-streetiz-red transition-colors min-h-[3rem]">
          {title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5 text-streetiz-red flex-shrink-0" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-streetiz-red flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-2xl font-black text-white">
            {price === 0 ? (
              <span className="text-streetiz-red text-lg">FREE</span>
            ) : (
              <span>{price}€</span>
            )}
          </div>
          {ticketUrl ? (
            <a
              href={ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-streetiz-red hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Book</span>
            </a>
          ) : (
            <button className="flex-1 bg-[#1a1a1a] text-gray-500 font-bold py-2 px-4 rounded-lg cursor-not-allowed text-sm">
              Soon
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
