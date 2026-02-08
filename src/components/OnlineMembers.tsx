import { useState, useEffect } from 'react';
import { MessageCircle, Users as UsersIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import LibreTonightBadge from './LibreTonightBadge';

interface OnlineMember {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  profile_role?: string;
  available_tonight?: boolean;
  tonight_location_value?: string;
  available_tonight_updated_at?: string;
}

interface OnlineMembersProps {
  onViewProfile: (userId: string) => void;
  onOpenChat: (userId: string, username: string, avatar: string | null) => void;
}

export default function OnlineMembers({ onViewProfile, onOpenChat }: OnlineMembersProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<OnlineMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnlineMembers();
    const interval = setInterval(loadOnlineMembers, 20000);
    return () => clearInterval(interval);
  }, []);

  const loadOnlineMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          avatar_url,
          available_tonight,
          tonight_location_value,
          available_tonight_updated_at,
          profile_extensions (
            online_status,
            profile_role
          )
        `)
        .limit(30);

      if (error) throw error;

      const onlineMembers = (data || [])
        .filter((member: any) =>
          member.profile_extensions?.[0]?.online_status === 'online' &&
          member.id !== user?.id
        )
        .map((member: any) => ({
          id: member.id,
          username: member.username,
          display_name: member.display_name,
          avatar_url: member.avatar_url,
          profile_role: member.profile_extensions?.[0]?.profile_role,
          available_tonight: member.available_tonight,
          tonight_location_value: member.tonight_location_value,
          available_tonight_updated_at: member.available_tonight_updated_at,
        }));

      setMembers(onlineMembers);
    } catch (error) {
      console.error('Error loading online members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (type?: string) => {
    switch (type) {
      case 'dj': return 'bg-purple-500';
      case 'dancer': return 'bg-blue-500';
      case 'producer': return 'bg-green-500';
      case 'organizer': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="bg-[#111] rounded-2xl border border-[#222] p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1a1a1a] rounded-full" />
              <div className="flex-1 bg-[#1a1a1a] h-4 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
      <div className="p-4 border-b border-[#222] flex items-center justify-between">
        <h3 className="text-white font-black text-sm uppercase tracking-wider">
          En Ligne
        </h3>
        <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {members.length}
        </span>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {members.length === 0 ? (
          <div className="p-6 text-center">
            <UsersIcon className="w-12 h-12 text-[#333] mx-auto mb-3" />
            <p className="text-[#666] text-sm">Aucun membre en ligne</p>
          </div>
        ) : (
          <div className="p-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1a1a1a] transition-colors group"
              >
                <button
                  onClick={() => onViewProfile(member.id)}
                  className="relative flex-shrink-0"
                >
                  <img
                    src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.username}&background=ef4444&color=fff&size=40`}
                    alt={member.username}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-green-500/50"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#111] rounded-full" />
                  {member.profile_role && (
                    <div className={`absolute -top-1 -left-1 w-4 h-4 ${getCategoryColor(member.profile_role)} rounded-full border-2 border-[#111]`} />
                  )}
                </button>

                <button
                  onClick={() => onViewProfile(member.id)}
                  className="flex-1 text-left min-w-0"
                >
                  <p className="text-white text-sm font-semibold truncate">
                    {member.display_name || member.username}
                  </p>
                  <p className="text-[#666] text-xs truncate mb-1">@{member.username}</p>
                  {member.available_tonight && (
                    <LibreTonightBadge
                      locationValue={member.tonight_location_value}
                      updatedAt={member.available_tonight_updated_at}
                      size="sm"
                    />
                  )}
                </button>

                {user && (
                  <button
                    onClick={() => onOpenChat(member.id, member.display_name || member.username, member.avatar_url)}
                    className="opacity-0 group-hover:opacity-100 w-8 h-8 bg-streetiz-red hover:bg-red-600 rounded-full flex items-center justify-center transition-all flex-shrink-0"
                    title="Message"
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
