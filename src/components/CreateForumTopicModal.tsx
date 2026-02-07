import { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CreateForumTopicModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = ['Electro', 'DJing', 'Events', 'Matériel', 'Danse', 'Général'];

export default function CreateForumTopicModal({ onClose, onSuccess }: CreateForumTopicModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Général');
  const [content, setContent] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>(['', '', '', '']);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoUrlChange = (index: number, value: string) => {
    const newUrls = [...photoUrls];
    newUrls[index] = value;
    setPhotoUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user || submitting) return;

    setSubmitting(true);
    try {
      const validPhotos = photoUrls.filter(url => url.trim() !== '');

      const { error } = await supabase
        .from('forum_topics')
        .insert({
          user_id: user.id,
          title: title.trim(),
          category,
          content: content.trim(),
          photos: validPhotos
        });

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Erreur lors de la création du topic');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    const colors: { [key: string]: string } = {
      'Electro': 'border-purple-500 bg-purple-500/10',
      'DJing': 'border-blue-500 bg-blue-500/10',
      'Events': 'border-green-500 bg-green-500/10',
      'Matériel': 'border-orange-500 bg-orange-500/10',
      'Danse': 'border-pink-500 bg-pink-500/10',
      'Général': 'border-gray-500 bg-gray-500/10'
    };
    return colors[cat] || 'border-gray-500 bg-gray-500/10';
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] w-full max-w-3xl">
          <div className="p-6 border-b border-[#222] flex items-center justify-between">
            <h2 className="text-2xl font-black text-white">Créer un topic</h2>
            <button
              onClick={onClose}
              className="text-[#666] hover:text-white transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-white font-bold mb-3">Titre du topic *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Quel contrôleur DJ pour débuter ?"
                className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
                required
              />
            </div>

            <div>
              <label className="block text-white font-bold mb-3">Catégorie *</label>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      category === cat
                        ? `${getCategoryColor(cat)} text-white`
                        : 'border-[#222] bg-[#111] text-[#666] hover:border-[#333]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-bold mb-3">Description *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Décrivez votre question ou sujet en détail..."
                rows={6}
                className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-white font-bold mb-3">
                <ImageIcon className="w-5 h-5 inline mr-2" />
                Photos (max 4, optionnel)
              </label>
              <div className="space-y-3">
                {photoUrls.map((url, index) => (
                  <input
                    key={index}
                    type="url"
                    value={url}
                    onChange={(e) => handlePhotoUrlChange(index, e.target.value)}
                    placeholder={`URL de la photo ${index + 1}`}
                    className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
                  />
                ))}
              </div>
              <p className="text-xs text-[#666] mt-2">
                Utilisez des URLs d'images hébergées (ex: Pexels, Unsplash, etc.)
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-[#222] text-white font-bold hover:border-[#333] transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!title.trim() || !content.trim() || submitting}
                className="flex-1 bg-gradient-to-r from-streetiz-red to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-streetiz-red/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Publication...' : 'Publier le topic'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
