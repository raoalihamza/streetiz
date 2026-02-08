import { useEffect, useState } from 'react';
import { X, User as UserIcon, Image as ImageIcon, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ProfileHeader from './ProfileHeader';
import ProfileAbout from './ProfileAbout';
import ProfileMediaTab from './ProfileMediaTab';
import ProfilePosts from './ProfilePosts';
import ProfileAgenda from './ProfileAgenda';
import BookingRequestModal from './BookingRequestModal';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  cover_banner_url: string | null;
  bio: string | null;
  city?: string;
  country?: string;
  team_collective?: string;
  profile_role?: string;
  roles?: any;
  styles?: any;
  skills?: any;
  social_links?: any;
  followers_count?: number;
  following_count?: number;
  online_status?: string;
  is_verified?: boolean;
  free_tonight?: boolean;
  out_now?: boolean;
  out_location?: string;
  booking_enabled?: boolean;
  pinned_media?: any;
  created_at?: string;
}

interface ProfileModalProps {
  profile: Profile;
  onClose: () => void;
  onMessage: (profileId: string) => void;
}

export default function ProfileModal({ profile, onClose, onMessage }: ProfileModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'about' | 'media' | 'posts' | 'agenda'>('about');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(profile.followers_count || 0);
  const [loading, setLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const isOwnProfile = user?.id === profile.id;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    if (!isOwnProfile) {
      checkFollowStatus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, profile.id]);

  const checkFollowStatus = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUser.id)
        .eq('following_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const toggleFollow = async () => {
    try {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id);

        if (error) throw error;
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: profile.id
          });

        if (error) throw error;
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    onMessage(profile.id);
    onClose();
  };

  const tabs = [
    { id: 'about', label: 'À propos', icon: UserIcon },
    { id: 'media', label: 'Médias', icon: ImageIcon },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'agenda', label: 'Agenda', icon: CalendarIcon }
  ];

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
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-black/70 hover:bg-black rounded-full flex items-center justify-center transition-colors backdrop-blur-sm z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <ProfileHeader
            profile={{ ...profile, followers_count: followerCount }}
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            onToggleFollow={toggleFollow}
            onMessage={handleMessage}
            onBooking={profile.booking_enabled ? () => setShowBookingModal(true) : undefined}
            loading={loading}
          />

          <div className="px-8 pb-8">
            <div className="flex gap-2 border-b border-[#222] mb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'border-streetiz-red text-white'
                        : 'border-transparent text-[#666] hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div>
              {activeTab === 'about' && <ProfileAbout profile={profile} />}
              {activeTab === 'media' && <ProfileMediaTab profile={profile} isOwnProfile={isOwnProfile} />}
              {activeTab === 'posts' && <ProfilePosts profile={profile} />}
              {activeTab === 'agenda' && <ProfileAgenda profile={profile} isOwnProfile={isOwnProfile} />}
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingRequestModal
          targetUser={profile}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
}