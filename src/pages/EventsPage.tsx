import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Ticket, Search, Plus, TrendingUp, Star, Users, Award, Heart, Download, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import EventModal from '../components/EventModal';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  address: string | null;
  featured_image: string | null;
  category: string | null;
  price: number;
  ticket_url: string | null;
  status: string;
}

interface EventsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function EventsPage({ onNavigate }: EventsPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { isOrganizer } = useAuth();

  const categories = ['all', 'battle', 'party', 'workshop', 'concert', 'festival'];

  const featuredOrganizers = [
    { name: 'Red Bull BC One', logo: '🏆', events: 24 },
    { name: 'Boiler Room', logo: '🎵', events: 156 },
    { name: 'Juste Debout', logo: '💃', events: 18 },
  ];

  useEffect(() => {
    loadEvents();
  }, [selectedCategory]);

  const loadEvents = async () => {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .in('status', ['published', 'approved'])
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      fullDate: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#2a2a2a] border-t-streetiz-red rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#0D0D0D] pt-24 pb-32">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-streetiz-red/10 border border-streetiz-red/20 px-4 py-1.5 rounded-full mb-4">
              <Calendar className="w-4 h-4 text-streetiz-red mr-2" />
              <span className="text-streetiz-red text-sm font-bold">EVENTS</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-4">
              <span className="text-white">LES </span>
              <span className="text-streetiz-red drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">EVENTS</span>
            </h1>
            <p className="text-xl text-[#888] max-w-3xl mx-auto mb-6">
              Battles, soirées, festivals et workshops à ne pas manquer
            </p>

            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[#666]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un événement..."
                  className="w-full bg-[#111] border-2 border-[#333] rounded-2xl py-5 pl-14 pr-6 text-white text-lg placeholder-[#666] focus:outline-none focus:border-streetiz-red transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="sticky top-0 z-30 bg-[#0D0D0D]/98 backdrop-blur-sm py-5 mb-12 -mx-4 px-4 border-b border-[#222]">
            <div className="flex items-center justify-center gap-3 flex-wrap max-w-[1800px] mx-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase transition-all ${
                    selectedCategory === category
                      ? 'bg-streetiz-red text-white shadow-lg shadow-streetiz-red/30'
                      : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#222] hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            <div className="space-y-8">

              {filteredEvents.slice(0, 1).map((event, index) => {
                const dateInfo = formatDate(event.event_date);
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="relative rounded-3xl overflow-hidden cursor-pointer group h-[500px] border border-[#222] hover:border-streetiz-red/50 transition-all"
                  >
                    <img
                      src={event.featured_image || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                    {event.category && (
                      <div className="absolute top-6 left-6">
                        <span className="bg-streetiz-red px-4 py-2 rounded-full text-sm font-bold text-white uppercase">
                          {event.category}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-6 right-6 bg-streetiz-red rounded-2xl p-4 text-center min-w-[80px] shadow-lg">
                      <div className="text-3xl font-black text-white">{dateInfo.day}</div>
                      <div className="text-xs font-bold text-white">{dateInfo.month}</div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-end justify-between gap-6">
                        <div className="flex-1">
                          <h2 className="text-4xl font-black text-white mb-3 group-hover:text-streetiz-red transition-colors">
                            {event.title}
                          </h2>
                          {event.description && (
                            <p className="text-white/80 text-lg mb-4 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                          <div className="flex items-center gap-6 text-white/90 mb-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-5 h-5 text-streetiz-red" />
                              <span className="font-semibold">{dateInfo.time}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-streetiz-red" />
                                <span className="font-semibold">{event.location}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-3xl font-black text-white">
                              {event.price === 0 ? (
                                <span className="text-streetiz-red">GRATUIT</span>
                              ) : (
                                `${event.price}€`
                              )}
                            </div>
                            {event.ticket_url && (
                              <a
                                href={event.ticket_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="bg-streetiz-red hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2"
                              >
                                <Ticket className="w-5 h-5" />
                                <span>Réserver</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredEvents.slice(1).map((event, index) => {
                const dateInfo = formatDate(event.event_date);
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="bg-[#111] rounded-3xl overflow-hidden border border-[#222] hover:border-streetiz-red/50 transition-all cursor-pointer group flex flex-col md:flex-row"
                  >
                    <div className="relative md:w-[70%] aspect-video md:aspect-auto">
                      <img
                        src={event.featured_image || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />

                      {event.category && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-streetiz-red px-3 py-1.5 rounded-full text-xs font-bold text-white uppercase">
                            {event.category}
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-3 text-center min-w-[70px]">
                        <div className="text-2xl font-black text-white">{dateInfo.day}</div>
                        <div className="text-xs font-bold text-streetiz-red">{dateInfo.month}</div>
                      </div>
                    </div>

                    <div className="md:w-[30%] p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-black text-white mb-3 group-hover:text-streetiz-red transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-[#888] text-sm mb-4 line-clamp-3">
                            {event.description}
                          </p>
                        )}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
                            <Clock className="w-4 h-4 text-streetiz-red flex-shrink-0" />
                            <span>{dateInfo.time}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
                              <MapPin className="w-4 h-4 text-streetiz-red flex-shrink-0" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-3xl font-black text-white mb-4">
                          {event.price === 0 ? (
                            <span className="text-streetiz-red">GRATUIT</span>
                          ) : (
                            `${event.price}€`
                          )}
                        </div>
                        {event.ticket_url ? (
                          <a
                            href={event.ticket_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-streetiz-red hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2"
                          >
                            <Ticket className="w-4 h-4" />
                            <span>Réserver</span>
                          </a>
                        ) : (
                          <button className="w-full bg-[#222] text-[#666] font-bold py-3 px-6 rounded-full cursor-not-allowed">
                            Bientôt disponible
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredEvents.length === 0 && (
                <div className="text-center py-20 bg-[#111] rounded-3xl border border-[#222]">
                  <Calendar className="w-20 h-20 text-[#333] mx-auto mb-4" />
                  <p className="text-[#888] text-xl font-semibold">Aucun événement trouvé</p>
                  <p className="text-[#666] text-sm mt-2">Essayez une autre catégorie ou recherche</p>
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
              <div className="bg-[#111] rounded-2xl p-6 border border-[#222]">
                <h3 className="text-streetiz-red font-black text-lg mb-5 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  EVENTS POPULAIRES
                </h3>
                <div className="space-y-4">
                  {filteredEvents.slice(0, 5).map((event) => {
                    const dateInfo = formatDate(event.event_date);
                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="group cursor-pointer"
                      >
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                          <img
                            src={event.featured_image || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute top-3 right-3 bg-streetiz-red rounded-lg px-3 py-1.5 text-center min-w-[60px]">
                            <div className="text-lg font-black text-white">{dateInfo.day}</div>
                            <div className="text-[9px] font-bold text-white leading-none">{dateInfo.month}</div>
                          </div>
                        </div>
                        <h4 className="text-white text-sm font-bold line-clamp-2 group-hover:text-streetiz-red transition-colors mb-1">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-[#666]">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#111] rounded-2xl p-6 border border-[#222]">
                <h3 className="text-streetiz-red font-black text-lg mb-5 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  ORGANISATEURS
                </h3>
                <div className="space-y-3">
                  {featuredOrganizers.map((org, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1a1a1a] cursor-pointer group transition-all"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-streetiz-red to-[#FF1808] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        {org.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm group-hover:text-streetiz-red transition-colors truncate">
                          {org.name}
                        </h4>
                        <p className="text-xs text-[#666]">{org.events} événements</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-streetiz-red/10 to-transparent rounded-2xl p-6 border border-streetiz-red/30">
                <h3 className="text-white font-black text-xl mb-3">Organisez votre event</h3>
                <p className="text-[#a0a0a0] text-sm mb-5 leading-relaxed">
                  Battle, soirée, festival ? Diffusez votre événement sur STREETIZ et touchez des milliers de passionnés.
                </p>
                <button
                  onClick={() => onNavigate('create-event')}
                  className="w-full bg-streetiz-red hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Proposer mon event</span>
                </button>
              </div>

              <div className="bg-[#111] rounded-2xl p-6 border border-[#222]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-sm">ESPACE PUB</h3>
                  <span className="text-[10px] font-bold text-[#666] bg-[#222] px-2 py-1 rounded">AD</span>
                </div>
                <div className="aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-xl flex items-center justify-center border-2 border-dashed border-[#333]">
                  <div className="text-center p-6">
                    <Star className="w-12 h-12 text-[#333] mx-auto mb-2" />
                    <p className="text-xs text-[#666]">Votre publicité ici</p>
                    <p className="text-[10px] text-[#555] mt-2">ads@streetiz.com</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </>
  );
}
