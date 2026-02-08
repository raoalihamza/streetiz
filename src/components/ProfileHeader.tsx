import { UserPlus, UserCheck, MessageCircle, Calendar, CheckCircle, MapPin } from 'lucide-react';

const DEFAULT_BANNER = 'https://streetiz-cdn.s3.eu/defaults/default_cover.jpg';
const DEFAULT_AVATAR = 'https://streetiz-cdn.s3.eu/defaults/default_avatar.jpg';

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onMessage: () => void;
  onBooking?: () => void;
  loading?: boolean;
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
  isFollowing,
  onToggleFollow,
  onMessage,
  onBooking,
  loading = false
}: ProfileHeaderProps) {
  const bannerUrl = profile.cover_banner_url || DEFAULT_BANNER;
  const avatarUrl = profile.avatar_url || DEFAULT_AVATAR;
  const roles = Array.isArray(profile.roles) ? profile.roles : [];
  const styles = Array.isArray(profile.styles) ? profile.styles : [];

  return (
    <div className="relative">
      <div className="relative h-48 overflow-hidden">
        <img
          src={bannerUrl}
          alt="Profile banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-[#111]" />
      </div>

      <div className="px-8 pb-6">
        <div className="relative -mt-20 mb-4">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-[#111] bg-[#111]">
              <img
                src={avatarUrl}
                alt={profile.display_name || profile.username}
                className="w-full h-full object-cover"
              />
            </div>
            {profile.online_status === 'online' && (
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-[#111] rounded-full" />
            )}
            {profile.is_verified && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 border-2 border-[#111] rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-3xl font-black text-white mb-1">
                {profile.display_name || profile.username}
              </h2>
              <p className="text-[#888] text-lg">@{profile.username}</p>
            </div>
          </div>

          {(profile.city || profile.country) && (
            <div className="flex items-center gap-2 text-[#888] mb-3">
              <MapPin className="w-4 h-4 text-streetiz-red" />
              <span>
                {profile.city}
                {profile.country ? `, ${profile.country}` : ''}
              </span>
            </div>
          )}

          {roles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {roles.slice(0, 4).map((role: string, index: number) => (
                <span
                  key={index}
                  className="bg-streetiz-red px-3 py-1 rounded-full text-xs font-bold text-white uppercase"
                >
                  {role}
                </span>
              ))}
            </div>
          )}

          {styles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {styles.slice(0, 6).map((style: string, index: number) => (
                <span
                  key={index}
                  className="bg-[#1a1a1a] border border-[#333] px-3 py-1 rounded-full text-xs font-semibold text-white"
                >
                  {style}
                </span>
              ))}
            </div>
          )}

          {(profile.free_tonight || profile.out_now) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.free_tonight && (
                <div className="bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs font-semibold">Libre Tonight</span>
                </div>
              )}
              {profile.out_now && (
                <div className="bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-orange-400 text-xs font-semibold">
                    En soirée
                    {profile.out_location && ` - ${profile.out_location}`}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {!isOwnProfile && (
          <div className="flex gap-3">
            <button
              onClick={onToggleFollow}
              disabled={loading}
              className={`flex-1 font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
                isFollowing
                  ? 'bg-[#1a1a1a] hover:bg-[#222] text-white border border-[#333]'
                  : 'bg-streetiz-red hover:bg-red-600 text-white'
              }`}
            >
              {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
            </button>
            <button
              onClick={onMessage}
              className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message</span>
            </button>
            {profile.booking_enabled && onBooking && (
              <button
                onClick={onBooking}
                className="flex-1 bg-gradient-to-r from-purple-600 to-streetiz-red hover:from-purple-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}