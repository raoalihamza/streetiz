import React, { useRef, useState } from 'react';
import { Play, Pause, ShoppingCart, Download } from 'lucide-react';

interface ReleaseCardProps {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  description: string;
  genre: string;
  label?: string;
  releaseDate: string;
  buyUrl?: string;
  downloadUrl?: string;
  isExclusive: boolean;
}

export default function ReleaseCard({
  title,
  artist,
  coverUrl,
  audioUrl,
  description,
  genre,
  label,
  buyUrl,
  downloadUrl,
  isExclusive,
}: ReleaseCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-[#111] rounded-2xl overflow-hidden hover:bg-[#151515] transition-all group">
      <div className="relative aspect-square">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 bg-streetiz-red rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white fill-white" />
          ) : (
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          )}
        </button>

        <div className="absolute top-3 left-3 flex items-center gap-2">
          {isExclusive && (
            <span className="bg-streetiz-red px-3 py-1 rounded-full text-xs font-bold text-white">
              EXCLUSIVE
            </span>
          )}
          <span className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
            {genre}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
        <p className="text-streetiz-red text-sm font-semibold mb-2">{artist}</p>

        {label && (
          <p className="text-[#666] text-xs mb-3">{label}</p>
        )}

        <p className="text-[#888] text-sm leading-relaxed mb-4 line-clamp-3">
          {description}
        </p>

        <div className="flex items-center gap-2">
          {buyUrl && (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-streetiz-red hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy
            </a>
          )}
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#222] hover:bg-[#333] text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          )}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}
