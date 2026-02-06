import React, { useEffect } from 'react';
import { X, MapPin, Clock, Calendar, Ticket, Share2, Heart, Users } from 'lucide-react';

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

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

export default function EventModal({ event, onClose }: EventModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      fullDate: date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
    };
  };

  const dateInfo = formatDate(event.event_date);

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#111] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#222]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <div className="relative aspect-[21/9] overflow-hidden">
            <img
              src={event.featured_image || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-black/50 to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-12 h-12 bg-black/70 hover:bg-black rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {event.category && (
              <div className="absolute top-6 left-6">
                <span className="bg-streetiz-red px-4 py-2 rounded-full text-sm font-bold text-white uppercase">
                  {event.category}
                </span>
              </div>
            )}

            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-lg">
                    {event.title}
                  </h2>
                  <div className="flex items-center gap-4 text-white/90 text-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-streetiz-red" />
                      <span className="font-semibold">{dateInfo.fullDate}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-streetiz-red rounded-2xl p-4 text-center min-w-[100px]">
                  <div className="text-4xl font-black text-white">{dateInfo.day}</div>
                  <div className="text-sm font-bold text-white">{dateInfo.month}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-[1fr_300px] gap-8">
              <div className="space-y-6">
                {event.description && (
                  <div>
                    <h3 className="text-xl font-black text-white mb-3">À propos</h3>
                    <p className="text-[#a0a0a0] leading-relaxed">{event.description}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-black text-white mb-4">Détails</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-[#0a0a0a] rounded-xl border border-[#222]">
                      <Clock className="w-5 h-5 text-streetiz-red flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-white font-semibold">{dateInfo.time}</div>
                        <div className="text-[#666] text-sm">{dateInfo.fullDate}</div>
                      </div>
                    </div>

                    {event.location && (
                      <div className="flex items-start gap-3 p-4 bg-[#0a0a0a] rounded-xl border border-[#222]">
                        <MapPin className="w-5 h-5 text-streetiz-red flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-white font-semibold">{event.location}</div>
                          {event.address && (
                            <div className="text-[#666] text-sm">{event.address}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-streetiz-red/10 to-transparent rounded-2xl p-6 border border-streetiz-red/30">
                  <div className="text-center mb-6">
                    <div className="text-[#888] text-sm font-semibold mb-2">PRIX</div>
                    <div className="text-4xl font-black text-white">
                      {event.price === 0 ? (
                        <span className="text-streetiz-red">GRATUIT</span>
                      ) : (
                        `${event.price}€`
                      )}
                    </div>
                  </div>

                  {event.ticket_url ? (
                    <a
                      href={event.ticket_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-streetiz-red hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-lg"
                    >
                      <Ticket className="w-5 h-5" />
                      <span>Réserver</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-[#333] text-[#666] font-bold py-4 px-6 rounded-xl cursor-not-allowed"
                    >
                      Billetterie bientôt disponible
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-[#1a1a1a] hover:bg-[#222] text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">Sauvegarder</span>
                  </button>
                  <button className="flex-1 bg-[#1a1a1a] hover:bg-[#222] text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Partager</span>
                  </button>
                </div>

                <div className="bg-[#0a0a0a] rounded-2xl p-5 border border-[#222]">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-streetiz-red" />
                    <span className="text-white font-semibold">Participants</span>
                  </div>
                  <div className="text-[#666] text-sm">
                    Soyez le premier à rejoindre cet événement
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
