import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, MapPin, Plus, X, Users, UserPlus } from 'lucide-react';
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
  available_spots: number;
  looking_for_plus_one: boolean;
  color: string;
}

interface UserAgendaProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function UserAgenda({ userId, isOwnProfile }: UserAgendaProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const [newEvent, setNewEvent] = useState({
    title: '',
    event_date: '',
    location: '',
    event_type: 'party',
    description: '',
    is_public: true,
    available_spots: 0,
    looking_for_plus_one: false,
    color: ''
  });

  useEffect(() => {
    loadEvents();
  }, [userId, currentDate]);

  const loadEvents = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('user_agenda_events')
        .select('*')
        .eq('user_id', userId)
        .gte('event_date', startOfMonth.toISOString().split('T')[0])
        .lte('event_date', endOfMonth.toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    if (!isOwnProfile) return;
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    const existingEvent = events.find(e => e.event_date === dateStr);

    if (existingEvent) {
      setEditingEvent(existingEvent);
      setNewEvent({
        title: existingEvent.title,
        event_date: existingEvent.event_date,
        location: existingEvent.location || '',
        event_type: existingEvent.event_type,
        description: existingEvent.description || '',
        is_public: existingEvent.is_public,
        available_spots: existingEvent.available_spots || 0,
        looking_for_plus_one: existingEvent.looking_for_plus_one || false,
        color: existingEvent.color || ''
      });
    } else {
      setEditingEvent(null);
      setNewEvent({
        title: '',
        event_date: dateStr,
        location: '',
        event_type: 'party',
        description: '',
        is_public: true,
        available_spots: 0,
        looking_for_plus_one: false,
        color: ''
      });
    }
    setShowEventModal(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnProfile || !user || !newEvent.title || !newEvent.event_date) return;

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('user_agenda_events')
          .update(newEvent)
          .eq('id', editingEvent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_agenda_events')
          .insert({
            user_id: userId,
            ...newEvent
          });

        if (error) throw error;
      }

      setShowEventModal(false);
      setEditingEvent(null);
      setNewEvent({
        title: '',
        event_date: '',
        location: '',
        event_type: 'party',
        description: '',
        is_public: true,
        available_spots: 0,
        looking_for_plus_one: false,
        color: ''
      });
      await loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDeleteEvent = async () => {
    if (!isOwnProfile || !user || !editingEvent) return;

    try {
      const { error } = await supabase
        .from('user_agenda_events')
        .delete()
        .eq('id', editingEvent.id);

      if (error) throw error;

      setShowEventModal(false);
      setEditingEvent(null);
      await loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.event_date === dateStr);
  };

  const getEventTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      party: 'Soirée',
      battle: 'Battle',
      workshop: 'Workshop',
      concert: 'Concert',
      festival: 'Festival',
      fashion: 'Fashion',
      custom: 'Perso',
      other: 'Autre'
    };
    return types[type] || type;
  };

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      party: 'bg-blue-500',
      battle: 'bg-orange-500',
      workshop: 'bg-purple-500',
      concert: 'bg-pink-500',
      festival: 'bg-pink-500',
      fashion: 'bg-yellow-500',
      custom: 'bg-gray-500',
      other: 'bg-gray-500'
    };
    return colors[type] || colors.other;
  };

  const getEventTypeTint = (type: string) => {
    const tints: { [key: string]: string } = {
      party: 'bg-blue-500/15',
      battle: 'bg-orange-500/15',
      workshop: 'bg-purple-500/15',
      concert: 'bg-pink-500/15',
      festival: 'bg-pink-500/15',
      fashion: 'bg-yellow-500/15',
      custom: 'bg-gray-500/10',
      other: 'bg-gray-500/10'
    };
    return tints[type] || tints.other;
  };

  const getEventTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      party: '🎧',
      battle: '⚔️',
      workshop: '💃',
      concert: '🎤',
      festival: '🎪',
      fashion: '👗',
      custom: '📝',
      other: '📅'
    };
    return icons[type] || icons.other;
  };

  const getEventTypePriority = (type: string) => {
    const priorities: { [key: string]: number } = {
      festival: 6,
      fashion: 5,
      party: 4,
      concert: 4,
      battle: 3,
      workshop: 2,
      custom: 1,
      other: 0
    };
    return priorities[type] || 0;
  };

  const getDominantEvent = (events: AgendaEvent[]) => {
    if (events.length === 0) return null;
    return events.reduce((dominant, current) => {
      const dominantPriority = getEventTypePriority(dominant.event_type);
      const currentPriority = getEventTypePriority(current.event_type);
      return currentPriority > dominantPriority ? current : dominant;
    });
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  if (loading) {
    return (
      <div className="bg-[#111] rounded-2xl border border-[#222] p-6 animate-pulse">
        <div className="h-6 bg-[#222] rounded w-32 mb-4"></div>
        <div className="space-y-3">
          <div className="h-40 bg-[#222] rounded"></div>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth();
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
      <div className="p-6 border-b border-[#222]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-streetiz-red" />
            Mon Agenda
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 bg-[#222] hover:bg-[#333] rounded-lg flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <span className="text-white font-bold capitalize min-w-[180px] text-center">
              {formatMonthYear()}
            </span>
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 bg-[#222] hover:bg-[#333] rounded-lg flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-bold text-[#666] py-2">
              {day}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dayEvents = getEventsForDate(date);
            const hasEvents = dayEvents.length > 0;
            const dominantEvent = getDominantEvent(dayEvents);
            const cellTint = dominantEvent ? getEventTypeTint(dominantEvent.event_type) : '';

            return (
              <div key={date.toISOString()} className="relative group">
                <button
                  onClick={() => handleDateClick(date)}
                  disabled={!isOwnProfile}
                  className={`w-full aspect-square rounded-xl border transition-all relative overflow-hidden ${
                    isToday(date)
                      ? 'border-streetiz-red'
                      : hasEvents
                      ? 'border-[#333]'
                      : 'border-[#222] hover:border-[#333]'
                  } ${!isOwnProfile ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className={`absolute inset-0 ${cellTint} ${
                    isToday(date) && !hasEvents ? 'bg-streetiz-red/10' : ''
                  }`} />

                  <div className="relative p-1.5 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] font-bold ${
                        isToday(date) ? 'text-streetiz-red' : 'text-white'
                      }`}>
                        {date.getDate()}
                      </span>
                    </div>

                    {hasEvents && (
                      <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className="bg-black/30 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-1 min-h-[20px]"
                          >
                            <span className="text-xs">{getEventTypeIcon(event.event_type)}</span>
                            <span className="text-[10px] text-white font-semibold truncate flex-1">
                              {event.title.length > 8 ? event.title.substring(0, 8) + '...' : event.title}
                            </span>
                            {(event.looking_for_plus_one || event.available_spots > 0) && (
                              <div className="flex gap-0.5">
                                {event.looking_for_plus_one && (
                                  <div className="bg-streetiz-red text-white text-[8px] font-bold px-1 rounded">
                                    +1
                                  </div>
                                )}
                                {event.available_spots > 0 && (
                                  <div className="bg-green-500 text-white text-[8px] font-bold px-1 rounded">
                                    {event.available_spots}P
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] text-[#888] font-bold text-center">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    )}

                    {isOwnProfile && !hasEvents && (
                      <Plus className="w-3 h-3 text-[#666] opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1 right-1" />
                    )}
                  </div>
                </button>

                {hasEvents && (
                  <div className="absolute left-0 top-full mt-2 bg-black/95 backdrop-blur-sm rounded-xl border border-[#333] p-3 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none shadow-2xl">
                    <div className="space-y-2">
                      {dayEvents.map((event) => (
                        <div key={event.id} className="border-b border-[#222] last:border-0 pb-2 last:pb-0">
                          <div className="flex items-start gap-2 mb-1">
                            <span className="text-lg">{getEventTypeIcon(event.event_type)}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-bold text-[#888]">
                                  {getEventTypeLabel(event.event_type)}
                                </span>
                              </div>
                              <h5 className="text-white font-bold text-sm">{event.title}</h5>
                              {event.location && (
                                <p className="text-[#888] text-xs flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </p>
                              )}
                              {event.description && (
                                <p className="text-[#666] text-xs mt-1 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                              {(event.looking_for_plus_one || event.available_spots > 0) && (
                                <div className="flex items-center gap-2 mt-2">
                                  {event.looking_for_plus_one && (
                                    <span className="text-xs font-semibold text-streetiz-red flex items-center gap-1 bg-streetiz-red/10 px-2 py-0.5 rounded-full">
                                      <UserPlus className="w-3 h-3" />
                                      Cherche un +1
                                    </span>
                                  )}
                                  {event.available_spots > 0 && (
                                    <span className="text-xs font-semibold text-green-400 flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-full">
                                      <Users className="w-3 h-3" />
                                      {event.available_spots} place{event.available_spots > 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {events.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#222]">
            <h4 className="text-white font-bold text-sm mb-3">Événements du mois</h4>
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => isOwnProfile && handleDateClick(new Date(event.event_date))}
                  className={`bg-[#0a0a0a] rounded-xl border border-[#222] p-3 ${
                    isOwnProfile ? 'cursor-pointer hover:border-[#333]' : ''
                  } transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getEventTypeIcon(event.event_type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#888]">
                          {getEventTypeLabel(event.event_type)}
                        </span>
                        <span className="text-xs text-[#666]">
                          {new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <h5 className="text-white font-bold text-sm mb-1">{event.title}</h5>
                      {event.location && (
                        <p className="text-[#888] text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </p>
                      )}
                      {(event.looking_for_plus_one || event.available_spots > 0) && (
                        <div className="flex items-center gap-2 mt-2">
                          {event.looking_for_plus_one && (
                            <span className="text-xs font-semibold text-streetiz-red flex items-center gap-1 bg-streetiz-red/10 px-2 py-1 rounded-full">
                              <UserPlus className="w-3 h-3" />
                              Cherche un +1
                            </span>
                          )}
                          {event.available_spots > 0 && (
                            <span className="text-xs font-semibold text-green-400 flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-full">
                              <Users className="w-3 h-3" />
                              {event.available_spots} place{event.available_spots > 1 ? 's' : ''} dispo
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#222] flex items-center justify-between sticky top-0 bg-[#0a0a0a] z-10">
              <h3 className="text-white font-black text-xl">
                {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="w-8 h-8 bg-[#222] hover:bg-[#333] rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
              <div>
                <label className="text-white text-sm font-semibold mb-2 block">Type d'événement</label>
                <select
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                  className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-streetiz-red"
                >
                  <option value="party">🎧 Soirée / Club</option>
                  <option value="battle">⚔️ Battle</option>
                  <option value="workshop">💃 Workshop</option>
                  <option value="concert">🎤 Concert</option>
                  <option value="festival">🎪 Festival</option>
                  <option value="fashion">👗 Fashion</option>
                  <option value="custom">📝 Personnalisé</option>
                  <option value="other">📅 Autre</option>
                </select>
              </div>

              <div>
                <label className="text-white text-sm font-semibold mb-2 block">Titre</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Nom de l'événement"
                  className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white text-sm placeholder-[#666] focus:outline-none focus:border-streetiz-red"
                  required
                />
              </div>

              <div>
                <label className="text-white text-sm font-semibold mb-2 block">Date</label>
                <input
                  type="date"
                  value={newEvent.event_date}
                  onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                  className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-streetiz-red"
                  required
                />
              </div>

              <div>
                <label className="text-white text-sm font-semibold mb-2 block">Lieu (optionnel)</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Où se passe l'événement"
                  className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white text-sm placeholder-[#666] focus:outline-none focus:border-streetiz-red"
                />
              </div>

              <div>
                <label className="text-white text-sm font-semibold mb-2 block">Description (optionnel)</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Ajouter des détails..."
                  rows={3}
                  className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white text-sm placeholder-[#666] focus:outline-none focus:border-streetiz-red resize-none"
                />
              </div>

              <div className="pt-4 border-t border-[#222]">
                <h4 className="text-white font-bold text-sm mb-3">Options +1</h4>

                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm font-semibold mb-2 block">Places disponibles</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 1, 2, 3].map((spots) => (
                        <button
                          key={spots}
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, available_spots: spots })}
                          className={`py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                            newEvent.available_spots === spots
                              ? 'bg-green-500 text-white'
                              : 'bg-[#222] text-[#888] hover:bg-[#333]'
                          }`}
                        >
                          {spots === 0 ? 'Aucune' : spots}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newEvent.looking_for_plus_one}
                        onChange={(e) => setNewEvent({ ...newEvent, looking_for_plus_one: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-[#333] bg-[#111] checked:bg-streetiz-red checked:border-streetiz-red"
                      />
                      <span className="text-white text-sm font-semibold">
                        Je cherche un +1 pour y aller
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#222]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEvent.is_public}
                    onChange={(e) => setNewEvent({ ...newEvent, is_public: e.target.checked })}
                    className="w-5 h-5 rounded border-2 border-[#333] bg-[#111] checked:bg-streetiz-red checked:border-streetiz-red"
                  />
                  <span className="text-white text-sm">
                    Événement public (visible sur mon profil)
                  </span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                {editingEvent && (
                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-sm transition-colors"
                  >
                    Supprimer
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-[#222] text-white font-semibold text-sm hover:border-[#333] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-streetiz-red hover:bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors"
                >
                  {editingEvent ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
