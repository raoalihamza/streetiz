import { Play, ExternalLink } from 'lucide-react';

interface MusicSpotlightProps {
  title: string;
  subtitle: string;
  coverUrl: string;
  tags: string[];
  onPlayPreview: () => void;
  onViewExternal?: () => void;
  externalUrl?: string;
}

export default function MusicSpotlight({
  title,
  subtitle,
  coverUrl,
  tags,
  onPlayPreview,
  onViewExternal,
  externalUrl,
}: MusicSpotlightProps) {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden group">
      <img
        src={coverUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-streetiz-red/90 backdrop-blur-sm rounded-full text-xs font-bold text-white uppercase"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-3 drop-shadow-2xl">
          {title}
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-8 font-semibold">
          {subtitle}
        </p>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={onPlayPreview}
            className="px-8 py-4 bg-streetiz-red hover:bg-red-600 text-white font-bold rounded-full flex items-center gap-3 transition-all hover:scale-105 shadow-lg shadow-streetiz-red/50"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>Play Preview</span>
          </button>

          {(onViewExternal || externalUrl) && (
            <button
              onClick={onViewExternal}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-full flex items-center gap-3 transition-all hover:scale-105 border border-white/20"
            >
              <ExternalLink className="w-6 h-6" />
              <span>View Full</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
