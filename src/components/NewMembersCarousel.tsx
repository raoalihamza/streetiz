import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NewMember {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  location?: string;
  profile_type?: string;
  music_styles?: string[];
  created_at: string;
}

interface NewMembersCarouselProps {
  onViewProfile: (userId: string) => void;
}

export default function NewMembersCarousel({ onViewProfile }: NewMembersCarouselProps) {
  const [members, setMembers] = useState<NewMember[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNewMembers();
  }, []);

  const loadNewMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          avatar_url,
          created_at,
          profile_extensions (
            location,
            profile_type,
            music_styles
          )
        `)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;

      const formattedMembers = (data || []).map((member: any) => ({
        id: member.id,
        username: member.username,
        display_name: member.display_name,
        avatar_url: member.avatar_url,
        location: member.profile_extensions?.[0]?.location,
        profile_type: member.profile_extensions?.[0]?.profile_type,
        music_styles: member.profile_extensions?.[0]?.music_styles || [],
        created_at: member.created_at
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error loading new members:', error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('members-carousel');
    if (!container) return;

    const scrollAmount = 300;
    const newPosition = direction === 'left'
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);

    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  const getCategoryColor = (type?: string) => {
    switch (type) {
      case 'dj': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'dancer': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'producer': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'organizer': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'photographer': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryLabel = (type?: string) => {
    switch (type) {
      case 'dj': return 'DJ';
      case 'dancer': return 'Danseur';
      case 'producer': return 'Producteur';
      case 'organizer': return 'Organisateur';
      case 'photographer': return 'Photographe';
      case 'videographer': return 'Vidéaste';
      default: return 'Membre';
    }
  };

  if (loading) {
    return (
      <div className="bg-[#111] rounded-2xl border border-[#222] p-6">
        <div className="animate-pulse flex space-x-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-xl h-32 w-48" />
          ))}
        </div>
      </div>
    );
  }

  if (members.length === 0) return null;

  return (
    <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden mb-6">
      <div className="p-4 border-b border-[#222] flex items-center justify-between">
        <h3 className="text-white font-black text-sm uppercase tracking-wider">
          Nouveaux Inscrits
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 bg-[#1a1a1a] hover:bg-streetiz-red border border-[#333] rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 bg-[#1a1a1a] hover:bg-streetiz-red border border-[#333] rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div
        id="members-carousel"
        className="flex gap-3 overflow-x-auto scrollbar-hide p-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {members.map((member) => (
          <button
            key={member.id}
            onClick={() => onViewProfile(member.id)}
            className="flex-shrink-0 w-[160px] bg-[#0a0a0a] rounded-xl border border-[#222] hover:border-streetiz-red overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-streetiz-red/20 group"
          >
            <div className="relative h-[120px] bg-gradient-to-br from-streetiz-red/20 to-transparent">
              <img
                src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.username}&background=ef4444&color=fff&size=160`}
                alt={member.username}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getCategoryColor(member.profile_type)}`}>
                  {getCategoryLabel(member.profile_type)}
                </span>
              </div>
            </div>

            <div className="p-3">
              <p className="text-white font-bold text-sm truncate mb-1">
                {member.display_name || member.username}
              </p>
              {member.location && (
                <div className="flex items-center gap-1 text-[#666] text-xs mb-2">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{member.location}</span>
                </div>
              )}
              {member.music_styles && member.music_styles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {member.music_styles.slice(0, 2).map((style, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-streetiz-red/20 text-streetiz-red border border-streetiz-red/30"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
