import { useState, useEffect } from 'react';
import { Search, MapPin, Filter, X, User, MessageCircle, UserPlus, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MemberSearchProps {
  onViewProfile: (userId: string) => void;
}

interface SearchResult {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  country: string | null;
  profile_role: string | null;
  followers_count: number;
  is_following: boolean;
}

export default function MemberSearch({ onViewProfile }: MemberSearchProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const roles = ['all', 'dancer', 'dj', 'videographer', 'photographer', 'producer', 'organizer', 'creator'];

  useEffect(() => {
    if (searchTerm || locationFilter || roleFilter !== 'all') {
      searchMembers();
    } else {
      setResults([]);
    }
  }, [searchTerm, locationFilter, roleFilter]);

  const searchMembers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          avatar_url,
          bio,
          profile_extensions (location, country, profile_role, followers_count)
        `)
        .limit(20);

      if (searchTerm) {
        query = query.or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredResults = (data || []).map((profile: any) => ({
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        location: profile.profile_extensions?.[0]?.location || null,
        country: profile.profile_extensions?.[0]?.country || null,
        profile_role: profile.profile_extensions?.[0]?.profile_role || null,
        followers_count: profile.profile_extensions?.[0]?.followers_count || 0,
        is_following: false
      }));

      if (locationFilter) {
        filteredResults = filteredResults.filter((r: SearchResult) =>
          r.location?.toLowerCase().includes(locationFilter.toLowerCase()) ||
          r.country?.toLowerCase().includes(locationFilter.toLowerCase())
        );
      }

      if (roleFilter !== 'all') {
        filteredResults = filteredResults.filter((r: SearchResult) => r.profile_role === roleFilter);
      }

      if (user) {
        const userIds = filteredResults.map((r: SearchResult) => r.id);
        const { data: follows } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .in('following_id', userIds);

        const followingIds = new Set((follows || []).map((f: any) => f.following_id));
        filteredResults = filteredResults.map((r: SearchResult) => ({
          ...r,
          is_following: followingIds.has(r.id)
        }));
      }

      setResults(filteredResults);
    } catch (error) {
      console.error('Error searching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    if (!user) return;

    try {
      const result = results.find(r => r.id === targetUserId);
      if (!result) return;

      if (result.is_following) {
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
      } else {
        await supabase
          .from('user_follows')
          .insert({ follower_id: user.id, following_id: targetUserId });
      }

      await supabase.rpc('update_profile_stats', { target_user_id: targetUserId });

      setResults(results.map(r =>
        r.id === targetUserId ? { ...r, is_following: !r.is_following } : r
      ));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#111] rounded-2xl border border-[#222] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-[#666]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search members..."
            className="flex-1 bg-transparent text-white text-sm placeholder-[#666] focus:outline-none"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-streetiz-red text-white' : 'bg-[#1a1a1a] text-[#666] hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {showFilters && (
          <div className="space-y-3 pt-3 border-t border-[#222]">
            <div>
              <label className="text-[#888] text-xs font-semibold uppercase mb-2 block">Location</label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#666]" />
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="City, Country..."
                  className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm placeholder-[#666] focus:outline-none focus:border-streetiz-red"
                />
              </div>
            </div>

            <div>
              <label className="text-[#888] text-xs font-semibold uppercase mb-2 block">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-streetiz-red"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {(locationFilter || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setLocationFilter('');
                  setRoleFilter('all');
                }}
                className="text-streetiz-red text-xs font-semibold hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-streetiz-red/20 border-t-streetiz-red rounded-full animate-spin" />
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          {results.map((member) => (
            <div
              key={member.id}
              className="bg-[#111] rounded-xl border border-[#222] p-4 hover:border-[#333] transition-colors"
            >
              <div className="flex items-start gap-3">
                <img
                  src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.username}&background=ef4444&color=fff&size=56`}
                  alt={member.username}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-bold text-sm truncate">
                      {member.display_name || member.username}
                    </h4>
                    {member.profile_role && (
                      <span className="bg-[#1a1a1a] text-[#888] px-2 py-0.5 rounded text-xs font-semibold">
                        {member.profile_role}
                      </span>
                    )}
                  </div>
                  <p className="text-[#666] text-xs mb-2">@{member.username}</p>
                  {member.location && (
                    <div className="flex items-center gap-1 text-[#888] text-xs mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{member.location}, {member.country}</span>
                    </div>
                  )}
                  {member.bio && (
                    <p className="text-[#888] text-xs line-clamp-2 mb-3">{member.bio}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewProfile(member.id)}
                      className="flex items-center gap-1 bg-[#1a1a1a] hover:bg-[#222] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <User className="w-3 h-3" />
                      View
                    </button>
                    {user && user.id !== member.id && (
                      <>
                        <button
                          onClick={() => handleFollow(member.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            member.is_following
                              ? 'bg-[#1a1a1a] text-[#888] hover:bg-[#222]'
                              : 'bg-streetiz-red hover:bg-red-600 text-white'
                          }`}
                        >
                          {member.is_following ? (
                            <>
                              <Check className="w-3 h-3" />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" />
                              Follow
                            </>
                          )}
                        </button>
                        <button className="flex items-center gap-1 bg-[#1a1a1a] hover:bg-[#222] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                          <MessageCircle className="w-3 h-3" />
                          Message
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (searchTerm || locationFilter || roleFilter !== 'all') ? (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-[#333] mx-auto mb-3" />
          <p className="text-[#666] text-sm">No members found</p>
        </div>
      ) : null}
    </div>
  );
}
