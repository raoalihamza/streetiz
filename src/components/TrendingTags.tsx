import { Hash, TrendingUp } from 'lucide-react';

interface TrendingTag {
  tag: string;
  count: number;
  color: string;
}

const trendingTags: TrendingTag[] = [
  { tag: 'Electro', count: 234, color: 'from-blue-500 to-cyan-500' },
  { tag: 'Dance', count: 189, color: 'from-purple-500 to-pink-500' },
  { tag: 'Techno', count: 167, color: 'from-red-500 to-orange-500' },
  { tag: 'AfroHouse', count: 143, color: 'from-green-500 to-emerald-500' },
  { tag: 'DeepHouse', count: 128, color: 'from-indigo-500 to-purple-500' },
  { tag: 'Minimal', count: 98, color: 'from-gray-500 to-slate-500' },
];

interface TrendingTagsProps {
  onTagClick?: (tag: string) => void;
}

export default function TrendingTags({ onTagClick }: TrendingTagsProps) {
  return (
    <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
      <div className="p-4 border-b border-[#222] flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-streetiz-red" />
        <h3 className="text-white font-black text-sm uppercase tracking-wider">
          Tendances
        </h3>
      </div>

      <div className="p-3 space-y-2">
        {trendingTags.map((item, index) => (
          <button
            key={item.tag}
            onClick={() => onTagClick?.(item.tag)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#1a1a1a] transition-all group hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <Hash className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-streetiz-red rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-[#111]">
                  {index + 1}
                </div>
              </div>

              <div className="text-left">
                <p className="text-white font-bold text-sm group-hover:text-streetiz-red transition-colors">
                  #{item.tag}
                </p>
                <p className="text-[#666] text-xs">
                  {item.count} posts
                </p>
              </div>
            </div>

            <div className="w-2 h-2 rounded-full bg-streetiz-red opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}
