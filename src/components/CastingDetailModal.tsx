import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Euro, Eye, Mail, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CastingDetailModalProps {
  castingId: string;
  onClose: () => void;
}

interface Casting {
  id: string;
  title: string;
  description: string;
  type: string;
  event_date: string;
  fee: string;
  location: string;
  contact_info: string;
  photos: string[];
  status: string;
  views_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

export default function CastingDetailModal({ castingId, onClose }: CastingDetailModalProps) {
  const [casting, setCasting] = useState<Casting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCasting();
    incrementViews();
  }, [castingId]);

  const loadCasting = async () => {
    try {
      const { data, error } = await supabase
        .from('castings_jobs')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('id', castingId)
        .single();

      if (error) throw error;
      setCasting(data);
    } catch (error) {
      console.error('Error loading casting:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      const { error } = await supabase
        .from('castings_jobs')
        .update({ views_count: supabase.sql`views_count + 1` })
        .eq('id', castingId);

      if (error) console.error('Error incrementing views:', error);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const getTypeColor = (castingType: string) => {
    const colors: { [key: string]: string } = {
      'DJ': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Danseur': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Vidéo': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Staff': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Workshop': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Figuration': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    return colors[castingType] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date non spécifiée';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCreatedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading || !casting) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] p-8 w-full max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#222] rounded w-3/4"></div>
            <div className="h-4 bg-[#222] rounded w-full"></div>
            <div className="h-4 bg-[#222] rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#222] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getTypeColor(casting.type)}`}>
                {casting.type}
              </span>
              <span className="flex items-center gap-2 text-sm text-[#666]">
                <Eye className="w-4 h-4" />
                {casting.views_count || 0} vues
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-[#666] hover:text-white transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h2 className="text-3xl font-black text-white mb-4">
                {casting.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                <span className="flex items-center gap-2 text-[#888]">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">{formatDate(casting.event_date)}</span>
                </span>
                <span className="flex items-center gap-2 text-[#888]">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">{casting.location}</span>
                </span>
                {casting.fee && (
                  <span className="flex items-center gap-2 text-green-400 font-bold text-base">
                    <Euro className="w-5 h-5" />
                    {casting.fee}
                  </span>
                )}
              </div>
            </div>

            {casting.photos && casting.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {casting.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt=""
                    className="w-full h-64 object-cover rounded-xl"
                  />
                ))}
              </div>
            )}

            <div className="bg-[#111] rounded-2xl border border-[#222] p-6">
              <h3 className="text-white font-bold text-lg mb-3">Description</h3>
              <p className="text-[#ddd] whitespace-pre-wrap leading-relaxed">
                {casting.description}
              </p>
            </div>

            <div className="bg-[#111] rounded-2xl border border-[#222] p-6">
              <h3 className="text-white font-bold text-lg mb-4">Organisateur</h3>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={casting.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${casting.profiles?.username}`}
                  alt={casting.profiles?.username}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-white font-bold">{casting.profiles?.username}</p>
                  <p className="text-sm text-[#666]">
                    Publié le {formatCreatedDate(casting.created_at)}
                  </p>
                </div>
              </div>

              {casting.contact_info && (
                <div className="bg-[#0a0a0a] rounded-xl border border-[#222] p-4">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact
                  </h4>
                  <p className="text-[#ddd]">{casting.contact_info}</p>
                </div>
              )}
            </div>

            <button className="w-full bg-gradient-to-r from-streetiz-red to-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-streetiz-red/30 transition-all flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Postuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
