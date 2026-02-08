import { useState, useEffect } from 'react';
import { Calendar, MapPin, Plus, X, Trash2, Clock, PartyPopper } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AgendaEvent {
  id: string;
  title: string;
  event_date: string;
  location: string;
  event_type: string;
  description: string;
  is_public: boolean;
}

interface UserAgendaProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function UserAgenda({ userId, isOwnProfile }: UserAgendaProps) {
  const { user } = useAuth();
  const [freeTonight, setFreeTonight] = useState(false);
  const [outNow, setOutNow] = useState(false);
  const [outLocation, setOutLocation] = useState('');
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newEvent, setNewEvent] = useState({
    title: '',
    event_date: '',
    location: '',
    event_type: 'party',
    description: '',
    is_public: true
  });

  useEffect(() => {
    loadUserData();
    loadEvents();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('free_tonight, out_now, out_location')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setFreeTonight(data.free_tonight || false);
        setOutNow(data.out_now || false);
        setOutLocation(data.out_location || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('user_agenda_events')
        .select('*')
        .eq('user_id', userId)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleToggleFreeTonight = async () => {
    if (!isOwnProfile || !user) return;

    const newValue = !freeTonight;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ free_tonight: newValue })
        .eq('id', userId);

      if (error) throw error;
      setFreeTonight(newValue);
    } catch (error) {
      console.error('Error updating free tonight:', error);
    }
  };

  const handleToggleOutNow = async () => {
    if (!isOwnProfile || !user) return;

    const newValue = !outNow;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          out_now: newValue,
          out_since: newValue ? new Date().toISOString() : null
        })
        .eq('id', userId);

      if (error) throw error;
      setOutNow(newValue);
    } catch (error) {
      console.error('Error updating out now:', error);
    }
  };

  const handleUpdateOutLocation = async (location: string) => {
    if (!isOwnProfile || !user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ out_location: location })
        .eq('id', userId);

      if (error) throw error;
      setOutLocation(location);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnProfile || !user || !newEvent.title || !newEvent.event_date) return;

    try {
      const { error } = await supabase
        .from('user_agenda_events')
        .insert({
          user_id: userId,
          ...newEvent
        });

      if (error) throw error;

      setNewEvent({
        title: '',
        event_date: '',
        location: '',
        event_type: 'party',
        description: '',
        is_public: true
      });
      setShowAddEvent(false);
      await loadEvents();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!isOwnProfile || !user) return;

    try {
      const { error } = await supabase
        .from('user_agenda_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      await loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getEventTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      party: 'Soirée',
      battle: 'Battle',
      workshop: 'Workshop',
      concert: 'Concert',
      festival: 'Festival',
      other: 'Autre'
    };
    return types[type] || type;
  };

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      party: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      battle: 'bg-red-500/20 text-red-400 border-red-500/30',
      workshop: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      concert: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      festival: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      other: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[type] || colors.other;
  };

  if (loading) {
    return (
      <div className="bg-[#111] rounded-2xl border border-[#222] p-6 animate-pulse">
        <div className="h-6 bg-[#222] rounded w-32 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-[#222] rounded"></div>
          <div className="h-12 bg-[#222] rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
      <div className="p-6 border-b border-[#222]">
        <h3 className="text-white font-black text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-streetiz-red" />
          Agenda & Disponibilité
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {isOwnProfile && (
          <>
            <div>
              <button
                onClick={handleToggleFreeTonight}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  freeTonight
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-[#222] bg-[#0a0a0a] hover:border-[#333]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      freeTonight ? 'bg-green-500/20' : 'bg-[#222]'
                    }`}>
                      <PartyPopper className={`w-6 h-6 ${freeTonight ? 'text-green-400' : 'text-[#666]'}`} />
                    </div>
                    <div className="text-left">
                      <p className={`font-bold ${freeTonight ? 'text-green-400' : 'text-white'}`}>
                        Libre Tonight
                      </p>
                      <p className="text-sm text-[#888]">
                        {freeTonight ? 'Disponible pour sortir' : 'Non disponible'}
                      </p>
                    </div>
                  </div>
                  <div className={`w-14 h-8 rounded-full transition-all ${
                    freeTonight ? 'bg-green-500' : 'bg-[#333]'
                  }`}>
                    <div className={`w-6 h-6 bg-white rounded-full m-1 transition-transform ${
                      freeTonight ? 'translate-x-6' : ''
                    }`} />
                  </div>
                </div>
              </button>
            </div>

            <div>
              <button
                onClick={handleToggleOutNow}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  outNow
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-[#222] bg-[#0a0a0a] hover:border-[#333]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      outNow ? 'bg-orange-500/20' : 'bg-[#222]'
                    }`}>
                      <Clock className={`w-6 h-6 ${outNow ? 'text-orange-400' : 'text-[#666]'}`} />
                    </div>
                    <div className="text-left">
                      <p className={`font-bold ${outNow ? 'text-orange-400' : 'text-white'}`}>
                        En soirée maintenant
                      </p>
                      <p className="text-sm text-[#888]">
                        {outNow ? 'Je suis en soirée' : 'Pas en soirée'}
                      </p>
                    </div>
                  </div>
                  <div className={`w-14 h-8 rounded-full transition-all ${
                    outNow ? 'bg-orange-500' : 'bg-[#333]'
                  }`}>
                    <div className={`w-6 h-6 bg-white rounded-full m-1 transition-transform ${
                      outNow ? 'translate-x-6' : ''
                    }`} />
                  </div>
                </div>
              </button>

              {outNow && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#222] rounded-xl px-4 py-3">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    <input
                      type="text"
                      value={outLocation}
                      onChange={(e) => handleUpdateOutLocation(e.target.value)}
                      placeholder="Où es-tu ? (optionnel)"
                      className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-[#666]"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!isOwnProfile && (
          <div className="space-y-3">
            {freeTonight && (
              <div className="p-4 rounded-xl border-2 border-green-500 bg-green-500/10">
                <div className="flex items-center gap-3">
                  <PartyPopper className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="font-bold text-green-400">Libre Tonight</p>
                    <p className="text-sm text-[#888]">Disponible pour sortir</p>
                  </div>
                </div>
              </div>
            )}

            {outNow && (
              <div className="p-4 rounded-xl border-2 border-orange-500 bg-orange-500/10">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-orange-400" />
                  <div>
                    <p className="font-bold text-orange-400">En soirée maintenant</p>
                    {outLocation && (
                      <p className="text-sm text-[#888] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {outLocation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!freeTonight && !outNow && (
              <p className="text-[#666] text-center py-4">Pas de statut actif</p>
            )}
          </div>
        )}

        <div className="border-t border-[#222] pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-bold">Événements à venir</h4>
            {isOwnProfile && (
              <button
                onClick={() => setShowAddEvent(true)}
                className="text-streetiz-red hover:text-red-400 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          {showAddEvent && (
            <form onSubmit={handleAddEvent} className="mb-4 p-4 bg-[#0a0a0a] rounded-xl border border-[#222] space-y-3">
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Titre de l'événement"
                className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-2 text-white text-sm placeholder-[#666] focus:outline-none focus:border-streetiz-red"
                required
              />
              <input
                type="date"
                value={newEvent.event_date}
                onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-streetiz-red"
                required
              />
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Lieu"
                className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-2 text-white text-sm placeholder-[#666] focus:outline-none focus:border-streetiz-red"
              />
              <select
                value={newEvent.event_type}
                onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-streetiz-red"
              >
                <option value="party">Soirée</option>
                <option value="battle">Battle</option>
                <option value="workshop">Workshop</option>
                <option value="concert">Concert</option>
                <option value="festival">Festival</option>
                <option value="other">Autre</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-[#222] text-white text-sm hover:border-[#333] transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-streetiz-red text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-all"
                >
                  Ajouter
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="bg-[#0a0a0a] rounded-xl border border-[#222] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getEventTypeColor(event.event_type)}`}>
                        {getEventTypeLabel(event.event_type)}
                      </span>
                    </div>
                    <h5 className="text-white font-bold mb-1">{event.title}</h5>
                    <div className="flex items-center gap-3 text-sm text-[#888]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(event.event_date)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-[#666] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <p className="text-[#666] text-center py-6 text-sm">
                Aucun événement à venir
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
