import { useState } from 'react';
import { X, Calendar, MapPin, DollarSign, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BookingRequestModalProps {
  targetUser: any;
  onClose: () => void;
}

export default function BookingRequestModal({ targetUser, onClose }: BookingRequestModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    event_date: '',
    city: '',
    venue: '',
    request_type: 'dj_set',
    message: '',
    budget: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_booking_request', {
        p_to_user_id: targetUser.id,
        p_event_date: formData.event_date,
        p_city: formData.city,
        p_venue: formData.venue || null,
        p_request_type: formData.request_type,
        p_message: formData.message,
        p_budget: formData.budget || null
      });

      if (error) throw error;

      alert('Demande de booking envoyée avec succès !');
      onClose();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#222] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-xl">Demande de booking</h2>
            <p className="text-[#888] text-sm mt-1">
              Envoyer une demande à {targetUser.display_name || targetUser.username}
            </p>
          </div>
          <button onClick={onClose} className="text-[#666] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-white font-semibold mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-streetiz-red" />
              Date de l'événement *
            </label>
            <input
              type="date"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-streetiz-red"
              required
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-streetiz-red" />
              Ville *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="ex: Paris, Berlin, London..."
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
              required
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Lieu (optionnel)
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="ex: Club XYZ, Festival ABC..."
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Type de prestation *
            </label>
            <select
              value={formData.request_type}
              onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-streetiz-red"
              required
            >
              <option value="dj_set">DJ Set</option>
              <option value="performance">Performance</option>
              <option value="workshop">Workshop</option>
              <option value="collaboration">Collaboration</option>
              <option value="video">Vidéo</option>
              <option value="photo">Photo</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-streetiz-red" />
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Décrivez votre projet, le contexte, vos attentes..."
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red resize-none"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-streetiz-red" />
              Budget (optionnel)
            </label>
            <input
              type="text"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="ex: 500€, À discuter..."
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white font-bold py-3 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-streetiz-red hover:from-purple-700 hover:to-red-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}