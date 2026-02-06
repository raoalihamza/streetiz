import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
}

export default function BreakingNews() {
  const [news] = useState<NewsItem[]>([
    { id: '1', title: 'Red Bull BC One 2024 Finals - Registration Now Open' },
    { id: '2', title: 'Boiler Room announces exclusive Paris marathon with Carl Cox' },
    { id: '3', title: 'Breaking: New Techno festival announced in Berlin for Summer 2024' },
    { id: '4', title: 'Exclusive Interview: DJ Snake talks about his upcoming album' },
  ]);

  return (
    <div className="bg-[#111111] border-y-2 border-streetiz-red/30 py-4 overflow-hidden shadow-lg shadow-streetiz-red/10 relative">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 px-4 sm:px-6 lg:px-8 shrink-0 relative z-10 bg-[#111111]">
          <div className="bg-streetiz-red px-4 py-1.5 rounded-md shadow-lg shadow-streetiz-red/50">
            <span className="text-sm font-black tracking-wider uppercase text-white">BREAKING</span>
          </div>
          <TrendingUp className="w-5 h-5 text-streetiz-red animate-pulse" />
        </div>

        <div className="flex animate-scroll whitespace-nowrap">
          {[...news, ...news].map((item, index) => (
            <button
              key={`${item.id}-${index}`}
              className="inline-flex items-center hover:text-streetiz-red transition-colors mx-8"
            >
              <span className="text-sm font-bold">{item.title}</span>
              <span className="mx-8 text-streetiz-red text-lg">•</span>
            </button>
          ))}
        </div>
      </div>

      {/* Gradient mask pour cacher le texte qui arrive sur le bouton */}
      <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-[#111111] via-[#111111] to-transparent pointer-events-none z-[5]"></div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 40s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
