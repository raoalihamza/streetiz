import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Video, X, Upload, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VideoItem {
  id: string;
  url: string;
  thumb_url: string | null;
  order_index: number;
}

interface ProfileVideoCarouselProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function ProfileVideoCarousel({ userId, isOwnProfile }: ProfileVideoCarouselProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultThumb = 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&h=450&fit=crop';

  useEffect(() => {
    loadVideos();
  }, [userId]);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_videos')
        .select('*')
        .eq('user_id', userId)
        .order('order_index');

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = async () => {
    const url = prompt('Enter video URL (YouTube, Vimeo, or direct link):');
    if (!url) return;

    const thumbUrl = prompt('Enter thumbnail URL (optional):') || null;

    try {
      const nextIndex = videos.length;
      if (nextIndex >= 6) {
        alert('Maximum 6 videos allowed');
        return;
      }

      const { error } = await supabase
        .from('profile_videos')
        .insert({
          user_id: userId,
          url,
          thumb_url: thumbUrl,
          order_index: nextIndex
        });

      if (error) throw error;
      await loadVideos();
    } catch (error) {
      console.error('Error adding video:', error);
      alert('Failed to add video');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Delete this video?')) return;

    try {
      const { error } = await supabase
        .from('profile_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
      await loadVideos();
      if (currentIndex >= videos.length - 1) {
        setCurrentIndex(Math.max(0, videos.length - 2));
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(videos.length, 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(videos.length, 1)) % Math.max(videos.length, 1));
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Vidéos</h3>
        <div className="aspect-video bg-zinc-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  const displayVideos = videos.length > 0 ? videos : [
    { id: 'placeholder', url: '', thumb_url: defaultThumb, order_index: 0 }
  ];

  const currentVideo = displayVideos[currentIndex % displayVideos.length];

  return (
    <>
      <div className="bg-zinc-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Vidéos</h3>
          {isOwnProfile && (
            <button
              onClick={handleAddVideo}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
            >
              <Upload size={16} />
              Add
            </button>
          )}
        </div>

        <div className="relative">
          <div
            className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => currentVideo.id !== 'placeholder' && setSelectedVideo(currentVideo.url)}
          >
            <img
              src={currentVideo.thumb_url || defaultThumb}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all flex items-center justify-center">
              {currentVideo.id === 'placeholder' ? (
                <Video size={48} className="text-zinc-600" />
              ) : (
                <Play size={48} className="text-white" />
              )}
            </div>

            {currentVideo.id !== 'placeholder' && isOwnProfile && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteVideo(currentVideo.id);
                }}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} className="text-white" />
              </button>
            )}
          </div>

          {videos.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <ChevronRight size={24} className="text-white" />
              </button>

              <div className="flex justify-center gap-2 mt-3">
                {videos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-white' : 'bg-zinc-600'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <button
            onClick={() => setSelectedVideo(null)}
            className="absolute top-4 right-4 p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors z-10"
          >
            <X size={24} className="text-white" />
          </button>
          <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={selectedVideo}
              className="w-full aspect-video rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
