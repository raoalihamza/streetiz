import { useState, useEffect } from 'react';
import { Calendar, MapPin, Plus, Trash2, Loader, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ProfileAgendaProps {
  profile: any;
  isOwnProfile: boolean;
}

interface AgendaEvent {
  id: string;
  user_id: string;
  event_date: string;
  title: string;
  location: string | null;
  event_type: string;
  created_at: string;
}

export default function ProfileAgenda({ profile, isOwnProfile }: ProfileAgendaProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    event_date: '',
    location: '',
    event_type: 'performance'
  });

  useEffect(() => {
    loadEvents();
  }, [profile.id]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('user_agenda_events')
        .select('*')
        .eq('user_id', profile.id)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isOwnProfile) return;

    try {
      const { error } = await supabase
        .from('user_agenda_events')
        .insert({
          user_id: user.id,
          ...formData
        });

      if (error) throw error;

      setFormData({ title: '', event_date: '', location: '', event_type: 'performance' });
      setShowAddForm(false);
      loadEvents();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Supprimer cet événement ?')) return;

    try {
      const { error } = await supabase
        .from('user_agenda_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleToggleFreeTonight = async () => {
    if (!user || !isOwnProfile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ free_tonight: !profile.free_tonight })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating free_tonight:', error);
    }
  };

  const handleToggleOutNow = async () => {
    if (!user || !isOwnProfile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ out_now: !profile.out_now })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating out_now:', error);
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      performance: 'Performance',
      workshop: 'Workshop',
      battle: 'Battle',
      event: 'Événement',
      other: 'Autre'
    };
    return labels[type] || type;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {isOwnProfile && (
        <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Statut rapide</h3>
          <div className="space-y-3">
            <button
              onClick={handleToggleFreeTonight}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
                profile.free_tonight
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-[#1a1a1a] border-[#333] hover:border-[#444]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${profile.free_tonight ? 'bg-green-500 animate-pulse' : 'bg-[#666]'}`} />
                <span className="text-white font-semibold">Libre Tonight</span>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors ${profile.free_tonight ? 'bg-green-500' : 'bg-[#333]'}`}>
                <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${profile.free_tonight ? 'ml-6' : 'ml-0.5'}`} />
              </div>
            </button>

            <button
              onClick={handleToggleOutNow}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
                profile.out_now
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : 'bg-[#1a1a1a] border-[#333] hover:border-[#444]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${profile.out_now ? 'bg-orange-500 animate-pulse' : 'bg-[#666]'}`} />
                <span className="text-white font-semibold">En soirée</span>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors ${profile.out_now ? 'bg-orange-500' : 'bg-[#333]'}`}>
                <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${profile.out_now ? 'ml-6' : 'ml-0.5'}`} />
              </div>
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-streetiz-red" />
            Agenda
          </h3>
          {isOwnProfile && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-streetiz-red hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          )}
        </div>

        {showAddForm && (
          <form onSubmit={handleAddEvent} className="bg-[#111] border border-[#222] rounded-xl p-4 mb-4">
            <div className="space-y-3">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de l'événement"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
                required
              />
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-streetiz-red"
                required
              />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Lieu (optionnel)"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
              />
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-streetiz-red"
              >
                <option value="performance">Performance</option>
                <option value="workshop">Workshop</option>
                <option value="battle">Battle</option>
                <option value="event">Événement</option>
                <option value="other">Autre</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-streetiz-red hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-[#1a1a1a] hover:bg-[#222] text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-streetiz-red animate-spin" />
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="bg-[#111] border border-[#222] rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-bold mb-1">{event.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-[#888]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(event.event_date)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    <span className="inline-block mt-2 bg-streetiz-red/20 text-streetiz-red px-2 py-1 rounded text-xs font-semibold">
                      {getEventTypeLabel(event.event_type)}
                    </span>
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-[#666] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-[#666] mx-auto mb-3" />
            <p className="text-[#666]">Aucun événement à l'agenda</p>
          </div>
        )}
      </div>
    </div>
  );
}