import { X } from 'lucide-react';
import { useEffect } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  videoType: 'youtube' | 'vimeo';
  title: string;
  onClose: () => void;
}

export default function VideoPlayer({ videoUrl, videoType, title, onClose }: VideoPlayerProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const getEmbedUrl = () => {
    if (videoType === 'youtube') {
      const videoId = videoUrl.includes('youtube.com')
        ? new URL(videoUrl).searchParams.get('v')
        : videoUrl.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } else {
      const videoId = videoUrl.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative z-10 w-full max-w-6xl animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-small text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#1a1a1a] hover:bg-neon-red transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={getEmbedUrl()}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}
