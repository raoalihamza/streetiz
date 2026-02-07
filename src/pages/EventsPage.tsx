import { useEffect, useState } from 'react';
import { Calendar, MapPin, Plus, TrendingUp, Award, Star, Map, SlidersHorizontal, Check, Navigation } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import EventModal from '../components/EventModal';
import CompactEventCard from '../components/CompactEventCard';
import EventFiltersDrawer, { AdvancedFilters } from '../components/EventFiltersDrawer';

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
  music_genre?: string | null;
  battle_level?: string | null;
  vibes?: string[] | null;
  is_fashion_week?: boolean;
  is_free?: boolean;
}

interface EventsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const CITIES = [
  { name: 'Paris', country: 'France', imageUrl: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800', eventCount: 24 },
  { name: 'Lyon', country: 'France', imageUrl: 'https://images.pexels.com/photos/2901133/pexels-photo-2901133.jpeg?auto=compress&cs=tinysrgb&w=800', eventCount: 12 },
  { name: 'Marseille', country: 'France', imageUrl: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=800', eventCount: 8 },
  { name: 'Brussels', country: 'Belgium', imageUrl: 'https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?auto=compress&cs=tinysrgb&w=800', eventCount: 15 },
  { name: 'Barcelona', country: 'Spain', imageUrl: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800', eventCount: 18 },
  { name: 'Berlin', country: 'Germany', imageUrl: 'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=800', eventCount: 32 },
  { name: 'Lisbon', country: 'Portugal', imageUrl: 'https://images.pexels.com/photos/2291636/pexels-photo-2291636.jpeg?auto=compress&cs=tinysrgb&w=800', eventCount: 10 },
  { name: 'Amsterdam', country: 'Netherlands', imageUrl: 'https://images.pexels.com/photos/208733/pexels-photo-208733.jpeg?auto=compress&cs=tinysrgb&w=800', eventCount: 14 },
];

const CATEGORIES = ['ALL', 'Party', 'Festival', 'Battle', 'Workshop', 'Concert', 'Fashion Event'];
const DATE_FILTERS = ['Tonight', 'This Week', 'This Month'];
const COUNTRIES = [
  { name: 'France', flag: '🇫🇷' },
  { name: 'Belgium', flag: '🇧🇪' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Netherlands', flag: '🇳🇱' },
];

export default function EventsPage({ onNavigate }: EventsPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    priceMin: 0,
    priceMax: 500,
    startDate: '',
    endDate: '',
    eventType: '',
    city: '',
    distance: 50,
    musicGenres: [],
    battleLevel: '',
    freeEntry: false,
    vibes: [],
  });
  const { isOrganizer } = useAuth();

  const featuredOrganizers = [
    { name: 'Red Bull BC One', logo: '🏆', events: 24 },
    { name: 'Boiler Room', logo: '🎵', events: 156 },
    { name: 'Juste Debout', logo: '💃', events: 18 },
  ];

  useEffect(() => {
    loadEvents();
  }, [selectedCategory, selectedCity, selectedCountry]);

  const loadEvents = async () => {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .in('status', ['published', 'approved'])
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'Paris Fashion Week') {
          query = query.eq('is_fashion_week', true);
        } else if (selectedCategory === 'Fashion Event') {
          query = query.or('category.ilike.%fashion%,is_fashion_week.eq.true');
        } else {
          query = query.eq('category', selectedCategory.toLowerCase());
        }
      }

      if (selectedCity) {
        query = query.ilike('location', `%${selectedCity}%`);
      }

      if (selectedCountry) {
        query = query.ilike('location', `%${selectedCountry}%`);
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

  const filteredEvents = events.filter((event) => {
    let matchesDateFilter = true;
    if (selectedDateFilter) {
      const eventDate = new Date(event.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDateFilter === 'Tonight') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        matchesDateFilter = eventDate >= today && eventDate < tomorrow;
      } else if (selectedDateFilter === 'This Week') {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        matchesDateFilter = eventDate >= today && eventDate < weekEnd;
      } else if (selectedDateFilter === 'This Month') {
        const monthEnd = new Date(today);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        matchesDateFilter = eventDate >= today && eventDate < monthEnd;
      }
    }

    if (advancedFilters.freeEntry && !event.is_free) {
      return false;
    }

    if (advancedFilters.musicGenres.length > 0 && !advancedFilters.musicGenres.includes(event.music_genre || '')) {
      return false;
    }

    if (advancedFilters.battleLevel && event.battle_level !== advancedFilters.battleLevel) {
      return false;
    }

    if (advancedFilters.vibes.length > 0) {
      const eventVibes = event.vibes || [];
      const hasMatchingVibe = advancedFilters.vibes.some(vibe => eventVibes.includes(vibe));
      if (!hasMatchingVibe) {
        return false;
      }
    }

    if (advancedFilters.eventType && event.category?.toLowerCase() !== advancedFilters.eventType.toLowerCase()) {
      return false;
    }

    if (advancedFilters.priceMin > 0 || advancedFilters.priceMax < 500) {
      if (event.price < advancedFilters.priceMin || event.price > advancedFilters.priceMax) {
        return false;
      }
    }

    if (advancedFilters.startDate) {
      const eventDate = new Date(event.event_date);
      const filterStartDate = new Date(advancedFilters.startDate);
      if (eventDate < filterStartDate) {
        return false;
      }
    }

    if (advancedFilters.endDate) {
      const eventDate = new Date(event.event_date);
      const filterEndDate = new Date(advancedFilters.endDate);
      if (eventDate > filterEndDate) {
        return false;
      }
    }

    return matchesDateFilter;
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: dateString,
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
  };

  const resetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedCountry('');
    setSelectedCity('');
    setSelectedDateFilter('');
    setSelectedStyle('');
    setNearMeActive(false);
  };

  const hasActiveFilters = selectedCategory !== 'ALL' || selectedCountry || selectedCity || selectedDateFilter || selectedStyle || nearMeActive;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#282828] border-t-streetiz-red rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#0F0F0F] pt-24 pb-12">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_350px] gap-8">
            <div>
              <div className="bg-[#151515] backdrop-blur-md rounded-2xl p-4 mb-6 border border-[#222]">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Event Categories</div>
                  <button
                    onClick={() => setIsFiltersDrawerOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#282828] rounded-lg text-xs font-bold text-white transition-all"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    More Filters
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                  <button
                    onClick={resetFilters}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 transform hover:scale-105 ${
                      !hasActiveFilters
                        ? 'bg-streetiz-red text-white shadow-lg shadow-red-500/30'
                        : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#282828] hover:text-white'
                    }`}
                  >
                    {!hasActiveFilters && <Check className="w-4 h-4 inline-block mr-1.5" />}
                    All Events
                  </button>

                  {CATEGORIES.filter(cat => cat !== 'ALL').map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold uppercase transition-all whitespace-nowrap flex-shrink-0 transform hover:scale-105 ${
                        selectedCategory === category
                          ? 'bg-streetiz-red text-white shadow-lg shadow-red-500/30'
                          : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#282828] hover:text-white'
                      }`}
                    >
                      {selectedCategory === category && <Check className="w-4 h-4 inline-block mr-1.5" />}
                      {category}
                    </button>
                  ))}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[#333] to-transparent my-4"></div>

                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        selectedCountry
                          ? 'bg-streetiz-red text-white shadow-md shadow-red-500/20'
                          : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#282828] hover:text-white'
                      }`}
                    >
                      {selectedCountry ? (
                        <>
                          <span>{COUNTRIES.find(c => c.name === selectedCountry)?.flag}</span>
                          <span>{selectedCountry}</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3 h-3" />
                          <span>Country</span>
                        </>
                      )}
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute top-full mt-2 left-0 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl z-50 min-w-[150px] animate-scale-in">
                        {COUNTRIES.map((country) => (
                          <button
                            key={country.name}
                            onClick={() => {
                              setSelectedCountry(selectedCountry === country.name ? '' : country.name);
                              setShowCountryDropdown(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-400 hover:bg-[#282828] hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setNearMeActive(!nearMeActive)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 transform hover:scale-105 ${
                      nearMeActive
                        ? 'bg-streetiz-red text-white shadow-md shadow-red-500/20'
                        : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#282828] hover:text-white'
                    }`}
                  >
                    {nearMeActive && <Check className="w-3 h-3" />}
                    <Navigation className="w-3 h-3" />
                    <span>Near Me</span>
                  </button>

                  <div className="w-px h-4 bg-[#333] flex-shrink-0"></div>

                  {CITIES.slice(0, 6).map((city) => (
                    <button
                      key={city.name}
                      onClick={() => setSelectedCity(selectedCity === city.name ? '' : city.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 transform hover:scale-105 ${
                        selectedCity === city.name
                          ? 'bg-streetiz-red text-white shadow-md shadow-red-500/20'
                          : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#282828] hover:text-white'
                      }`}
                    >
                      {selectedCity === city.name && <Check className="w-3 h-3" />}
                      <MapPin className="w-3 h-3" />
                      <span>{city.name}</span>
                    </button>
                  ))}

                  <div className="w-px h-4 bg-[#333] flex-shrink-0 mx-1"></div>

                  {DATE_FILTERS.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedDateFilter(selectedDateFilter === filter ? '' : filter)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 transform hover:scale-105 ${
                        selectedDateFilter === filter
                          ? 'bg-streetiz-red text-white shadow-md shadow-red-500/20'
                          : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#282828] hover:text-white'
                      }`}
                    >
                      {selectedDateFilter === filter && <Check className="w-3 h-3" />}
                      <Calendar className="w-3 h-3" />
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-400">
                  {filteredEvents.length === 0 ? 'No events' : `${filteredEvents.length} events`}
                </div>
                <button
                  onClick={() => onNavigate('map')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#181818] hover:bg-[#282828] rounded-lg transition-colors text-white text-sm font-bold"
                >
                  <Map className="w-4 h-4" />
                  <span>Map View</span>
                </button>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="text-center py-20 bg-[#111] rounded-2xl border border-[#222] animate-fade-in">
                  <Calendar className="w-16 h-16 text-[#333] mx-auto mb-4" />
                  <p className="text-gray-400 text-xl font-semibold">No events found</p>
                  <p className="text-gray-600 text-sm mt-2">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEvents.map((event, index) => {
                    const { date, time } = formatDateTime(event.event_date);
                    return (
                      <div
                        key={event.id}
                        className="animate-fade-in"
                        style={{
                          animationDelay: `${index * 0.05}s`,
                          animationFillMode: 'both'
                        }}
                      >
                        <CompactEventCard
                          id={event.id}
                          title={event.title}
                          category={event.category || 'Event'}
                          date={date}
                          time={time}
                          location={event.location || 'Location TBA'}
                          price={event.price}
                          imageUrl={event.featured_image || ''}
                          ticketUrl={event.ticket_url || undefined}
                          onClick={() => setSelectedEvent(event)}
                          genre={event.music_genre || undefined}
                          battleLevel={event.battle_level || undefined}
                          isFashionWeek={event.is_fashion_week || false}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
              <div className="bg-[#111] rounded-2xl p-6 border border-[#222]">
                <h3 className="text-white font-black text-lg mb-5 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-streetiz-red" />
                  POPULAR EVENTS
                </h3>
                <div className="space-y-4">
                  {filteredEvents.slice(0, 5).map((event) => {
                    const formatDate = (dateString: string) => {
                      const date = new Date(dateString);
                      return {
                        day: date.getDate(),
                        month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
                      };
                    };
                    const dateInfo = formatDate(event.event_date);
                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="group cursor-pointer"
                      >
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
                          <img
                            src={event.featured_image || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute top-2 right-2 bg-streetiz-red rounded-lg px-2.5 py-1.5 text-center min-w-[50px]">
                            <div className="text-base font-black text-white leading-none">{dateInfo.day}</div>
                            <div className="text-[8px] font-bold text-white leading-none mt-0.5">{dateInfo.month}</div>
                          </div>
                        </div>
                        <h4 className="text-white text-sm font-bold line-clamp-2 group-hover:text-streetiz-red transition-colors mb-1">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#111] rounded-2xl p-6 border border-[#222]">
                <h3 className="text-white font-black text-lg mb-5 flex items-center gap-2">
                  <Award className="w-5 h-5 text-streetiz-red" />
                  TOP ORGANIZERS
                </h3>
                <div className="space-y-3">
                  {featuredOrganizers.map((org, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1a1a1a] cursor-pointer group transition-all"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-streetiz-red to-[#FF1808] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        {org.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm group-hover:text-streetiz-red transition-colors truncate">
                          {org.name}
                        </h4>
                        <p className="text-xs text-gray-500">{org.events} events</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-streetiz-red/10 to-transparent rounded-2xl p-6 border border-streetiz-red/30">
                <h3 className="text-white font-black text-xl mb-3">Host Your Event</h3>
                <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                  Battle, party, festival? Promote your event on STREETIZ and reach thousands of fans.
                </p>
                <button
                  onClick={() => onNavigate('create-event')}
                  className="w-full bg-streetiz-red hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Event</span>
                </button>
              </div>

              <div className="bg-[#111] rounded-2xl p-6 border border-[#222]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-sm">AD SPACE</h3>
                  <span className="text-[10px] font-bold text-gray-600 bg-[#1a1a1a] px-2 py-1 rounded">AD</span>
                </div>
                <div className="aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-xl flex items-center justify-center border-2 border-dashed border-[#282828]">
                  <div className="text-center p-6">
                    <Star className="w-10 h-10 text-[#333] mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Your ad here</p>
                    <p className="text-[10px] text-gray-700 mt-2">ads@streetiz.com</p>
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

      <EventFiltersDrawer
        isOpen={isFiltersDrawerOpen}
        onClose={() => setIsFiltersDrawerOpen(false)}
        currentFilters={advancedFilters}
        onApplyFilters={(filters) => setAdvancedFilters(filters)}
      />
    </>
  );
}
