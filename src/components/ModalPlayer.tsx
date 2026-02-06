import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  artist: string;
  videoUrl?: string;
  audioUrl?: string;
  description?: string;
}

export default function ModalPlayer({
  isOpen,
  onClose,
  title,
  artist,
  videoUrl,
  audioUrl,
  description,
}: ModalPlayerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="bg-[#0D0D0D] rounded-2xl overflow-hidden">
          {videoUrl && (
            <div className="aspect-video w-full">
              <iframe
                src={getYouTubeEmbedUrl(videoUrl)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {!videoUrl && audioUrl && (
            <div className="aspect-video w-full bg-gradient-to-br from-[#111] to-[#0D0D0D] flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-streetiz-red/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <div className="w-24 h-24 bg-streetiz-red rounded-full animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
                <p className="text-xl text-streetiz-red">{artist}</p>
              </div>
            </div>
          )}

          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-lg text-streetiz-red font-semibold mb-4">{artist}</p>

            {description && (
              <p className="text-[#888] leading-relaxed">{description}</p>
            )}

            {!videoUrl && audioUrl && (
              <div className="mt-6">
                <audio
                  src={audioUrl}
                  controls
                  autoPlay
                  className="w-full"
                  style={{
                    filter: 'invert(1) hue-rotate(180deg)',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[#666] text-sm mt-4">
          Press ESC or click outside to close
        </p>
      </div>
    </div>
  );
}
