import { useState, useEffect } from 'react';
import { MapPin, Calendar, Euro, Eye, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Casting {
  id: string;
  title: string;
  description: string;
  type: string;
  event_date: string;
  fee: string;
  location: string;
  photos: string[];
  status: string;
  views_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

interface CastingsListProps {
  onCastingClick: (castingId: string) => void;
  type: string;
}

export default function CastingsList({ onCastingClick, type }: CastingsListProps) {
  const [castings, setCastings] = useState<Casting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCastings();
  }, [type]);

  const loadCastings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('castings_jobs')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('status', 'open')
        .order('event_date', { ascending: true });

      if (type !== 'all') {
        query = query.eq('type', type);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setCastings(data || []);
    } catch (error) {
      console.error('Error loading castings:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#111] rounded-2xl border border-[#222] p-6 animate-pulse">
            <div className="h-6 bg-[#222] rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-[#222] rounded w-full mb-2"></div>
            <div className="h-4 bg-[#222] rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {castings.map((casting) => (
        <div
          key={casting.id}
          onClick={() => onCastingClick(casting.id)}
          className="bg-[#111] rounded-2xl border border-[#222] p-6 hover:border-streetiz-red/50 transition-all cursor-pointer group"
        >
          <div className="flex items-start gap-4">
            {casting.photos && casting.photos.length > 0 && (
              <img
                src={casting.photos[0]}
                alt=""
                className="w-32 h-32 rounded-xl object-cover"
              />
            )}

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getTypeColor(casting.type)}`}>
                      {casting.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#666]">
                      <Eye className="w-4 h-4" />
                      {casting.views_count || 0}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg group-hover:text-streetiz-red transition-colors mb-2">
                    {casting.title}
                  </h3>
                  <p className="text-[#888] text-sm line-clamp-2">
                    {casting.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-2 text-[#666]">
                  <Calendar className="w-4 h-4" />
                  {formatDate(casting.event_date)}
                </span>
                <span className="flex items-center gap-2 text-[#666]">
                  <MapPin className="w-4 h-4" />
                  {casting.location}
                </span>
                {casting.fee && (
                  <span className="flex items-center gap-2 text-green-400 font-semibold">
                    <Euro className="w-4 h-4" />
                    {casting.fee}
                  </span>
                )}
                <span className="text-xs text-[#666]">
                  par <span className="text-white font-semibold">{casting.profiles?.username}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {castings.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-[#333] mx-auto mb-4" />
          <p className="text-[#666] text-lg">Aucun casting trouvé</p>
        </div>
      )}
    </div>
  );
}
