import { X } from 'lucide-react';
import { useEffect } from 'react';

interface SoundCloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundcloudUrl: string;
  title: string;
  artist: string;
}

export default function SoundCloudModal({
  isOpen,
  onClose,
  soundcloudUrl,
  title,
  artist,
}: SoundCloudModalProps) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl mx-4">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-orange-500 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="bg-[#0a0a0a] rounded-xl overflow-hidden border border-orange-500/20">
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-4">
            <h3 className="text-white font-bold text-lg">{title}</h3>
            <p className="text-orange-100 text-sm">{artist}</p>
          </div>

          <div className="aspect-video bg-gradient-to-br from-orange-900/20 to-[#0a0a0a]">
            <iframe
              width="100%"
              height="100%"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudUrl)}&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
              className="w-full h-full"
            />
          </div>

          <div className="p-4 text-center">
            <a
              href={soundcloudUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-semibold"
            >
              Ouvrir sur SoundCloud
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
