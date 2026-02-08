import { useState, useEffect } from 'react';
import { Image, X, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Photo {
  id: string;
  url: string;
  order_index: number;
}

interface ProfilePhotoGridProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function ProfilePhotoGrid({ userId, isOwnProfile }: ProfilePhotoGridProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultPlaceholder = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop';

  useEffect(() => {
    loadPhotos();
  }, [userId]);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_photos')
        .select('*')
        .eq('user_id', userId)
        .order('order_index');

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = async () => {
    const url = prompt('Enter photo URL:');
    if (!url) return;

    try {
      const nextIndex = photos.length;
      if (nextIndex >= 9) {
        alert('Maximum 9 photos allowed');
        return;
      }

      const { error } = await supabase
        .from('profile_photos')
        .insert({
          user_id: userId,
          url,
          order_index: nextIndex
        });

      if (error) throw error;
      await loadPhotos();
    } catch (error) {
      console.error('Error adding photo:', error);
      alert('Failed to add photo');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return;

    try {
      const { error } = await supabase
        .from('profile_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
      await loadPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    }
  };

  const displayPhotos = [...photos];
  while (displayPhotos.length < 9) {
    displayPhotos.push({ id: `placeholder-${displayPhotos.length}`, url: defaultPlaceholder, order_index: displayPhotos.length });
  }

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Photos</h3>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="aspect-square bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-zinc-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Photos</h3>
          {isOwnProfile && (
            <button
              onClick={handleAddPhoto}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
            >
              <Upload size={16} />
              Add
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {displayPhotos.slice(0, 9).map((photo, index) => (
            <div
              key={photo.id}
              className="relative aspect-square group cursor-pointer"
              onClick={() => photo.id.startsWith('placeholder-') ? null : setSelectedPhoto(photo.url)}
            >
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              {!photo.id.startsWith('placeholder-') && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-lg flex items-center justify-center">
                  {isOwnProfile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-all"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  )}
                </div>
              )}
              {photo.id.startsWith('placeholder-') && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800/50 rounded-lg">
                  <Image size={24} className="text-zinc-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
          <img
            src={selectedPhoto}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
