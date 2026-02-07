import { useState } from 'react';
import { X, Image as ImageIcon, MapPin, Calendar, Euro } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CreateCastingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const TYPES = [
  'DJ',
  'Danseur',
  'Vidéo',
  'Staff',
  'Workshop',
  'Figuration'
];

export default function CreateCastingModal({ onClose, onSuccess }: CreateCastingModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('DJ');
  const [eventDate, setEventDate] = useState('');
  const [fee, setFee] = useState('');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>(['', '', '', '']);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoUrlChange = (index: number, value: string) => {
    const newUrls = [...photoUrls];
    newUrls[index] = value;
    setPhotoUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim() || !user || submitting) return;

    setSubmitting(true);
    try {
      const validPhotos = photoUrls.filter(url => url.trim() !== '');

      const { error } = await supabase
        .from('castings_jobs')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          type,
          event_date: eventDate || null,
          fee: fee.trim(),
          location: location.trim(),
          contact_info: contactInfo.trim(),
          photos: validPhotos,
          status: 'open'
        });

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating casting:', error);
      alert('Erreur lors de la création de l\'annonce');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeColor = (castingType: string) => {
    const colors: { [key: string]: string } = {
      'DJ': 'border-blue-500 bg-blue-500/10',
      'Danseur': 'border-pink-500 bg-pink-500/10',
      'Vidéo': 'border-purple-500 bg-purple-500/10',
      'Staff': 'border-green-500 bg-green-500/10',
      'Workshop': 'border-orange-500 bg-orange-500/10',
      'Figuration': 'border-yellow-500 bg-yellow-500/10'
    };
    return colors[castingType] || 'border-gray-500 bg-gray-500/10';
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] w-full max-w-3xl">
          <div className="p-6 border-b border-[#222] flex items-center justify-between">
            <h2 className="text-2xl font-black text-white">Créer un casting / job</h2>
            <button
              onClick={onClose}
              className="text-[#666] hover:text-white transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-white font-bold mb-3">Titre *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Casting Electro Danse – Clip House Music"
                className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
                required
              />
            </div>

            <div>
              <label className="block text-white font-bold mb-3">Type *</label>
              <div className="grid grid-cols-3 gap-3">
                {TYPES.map((castingType) => (
                  <button
                    key={castingType}
                    type="button"
                    onClick={() => setType(castingType)}
                    className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      type === castingType
                        ? `${getTypeColor(castingType)} text-white`
                        : 'border-[#222] bg-[#111] text-[#666] hover:border-[#333]'
                    }`}
                  >
                    {castingType}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-bold mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date de l'événement
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
                />
              </div>

              <div>
                <label className="block text-white font-bold mb-3">
                  <Euro className="w-4 h-4 inline mr-2" />
                  Cachet / Rémunération
                </label>
                <input
                  type="text"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="Ex: 120€ ou Défrayé"
                  className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-bold mb-3">
                <MapPin className="w-4 h-4 inline mr-2" />
                Localisation *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Paris 13e"
                className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
                required
              />
            </div>

            <div>
              <label className="block text-white font-bold mb-3">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez le casting ou le job en détail : profil recherché, dates, conditions, etc."
                rows={6}
                className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-white font-bold mb-3">
                Contact *
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Email, téléphone ou autre moyen de contact"
                className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
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
                Utilisez des URLs d'images hébergées
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
                disabled={!title.trim() || !description.trim() || !location.trim() || !contactInfo.trim() || submitting}
                className="flex-1 bg-gradient-to-r from-streetiz-red to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-streetiz-red/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Publication...' : 'Publier l\'annonce'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
