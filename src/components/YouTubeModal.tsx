import { X } from 'lucide-react';
import { useEffect } from 'react';

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  title: string;
  artist: string;
}

export default function YouTubeModal({
  isOpen,
  onClose,
  videoId,
  title,
  artist,
}: YouTubeModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-streetiz-red transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="bg-[#0a0a0a] rounded-xl overflow-hidden border border-streetiz-red/20">
          <div className="bg-gradient-to-r from-streetiz-red to-red-500 p-4">
            <h3 className="text-white font-bold text-lg">{title}</h3>
            <p className="text-red-100 text-sm">{artist}</p>
          </div>

          <div className="aspect-video bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          <div className="p-4 text-center">
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2 bg-streetiz-red hover:bg-red-600 text-white rounded-lg transition-colors font-semibold"
            >
              Ouvrir sur YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
