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
import SendPrivateAlbumModal from './SendPrivateAlbumModal';
import SendPortfolioModal from './SendPortfolioModal';
import ReportUserModal from './ReportUserModal';
import LibreTonightSheet from './LibreTonightSheet';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
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
  const [showPrivateAlbumModal, setShowPrivateAlbumModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLTNSheet, setShowLTNSheet] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const [currentProfile, setCurrentProfile] = useState(profile);

  const isOwnProfile = user?.id === profile.id;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    if (!isOwnProfile) {
      checkFollowStatus();
      checkBlockStatus();
      checkFriendshipStatus();
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

  const checkBlockStatus = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('user_blocks')
        .select('id')
        .eq('user_id', user.id)
        .eq('blocked_user_id', profile.id)
        .maybeSingle();

      setIsBlocked(!!data);
    } catch (error) {
      console.error('Error checking block status:', error);
    }
  };

  const checkFriendshipStatus = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('friendships')
        .select('status')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${profile.id}),and(user_id.eq.${profile.id},friend_id.eq.${user.id})`)
        .maybeSingle();

      if (data) {
        setFriendshipStatus(data.status);
      }
    } catch (error) {
      console.error('Error checking friendship:', error);
    }
  };

  const handleAddContact = async () => {
    if (!user || friendshipStatus !== 'none') return;
    try {
      await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: profile.id,
          status: 'pending'
        });
      setFriendshipStatus('pending');
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/@${profile.username}`;
    if (navigator.share) {
      navigator.share({
        title: `Profil de ${profile.display_name || profile.username}`,
        url: profileUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(profileUrl);
      alert('Lien copié dans le presse-papier');
    }
  };

  const handleBlock = async () => {
    if (!user) return;

    try {
      if (isBlocked) {
        await supabase
          .from('user_blocks')
          .delete()
          .eq('user_id', user.id)
          .eq('blocked_user_id', profile.id);
        setIsBlocked(false);
      } else {
        await supabase
          .from('user_blocks')
          .insert({
            user_id: user.id,
            blocked_user_id: profile.id
          });
        setIsBlocked(true);
      }
    } catch (error) {
      console.error('Error toggling block:', error);
    }
  };

  const handleMessage = () => {
    onMessage(profile.id);
    onClose();
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setCurrentProfile(data);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
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
            profile={{ ...currentProfile, followers_count: followerCount }}
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            onToggleFollow={toggleFollow}
            onMessage={handleMessage}
            onBooking={currentProfile.booking_enabled ? () => setShowBookingModal(true) : undefined}
            loading={loading}
            onAddContact={handleAddContact}
            onShareProfile={handleShareProfile}
            onSendPrivateAlbum={() => setShowPrivateAlbumModal(true)}
            onSendPortfolio={() => setShowPortfolioModal(true)}
            onBlock={handleBlock}
            onReport={() => setShowReportModal(true)}
            isBlocked={isBlocked}
            onToggleLTN={isOwnProfile ? () => setShowLTNSheet(true) : undefined}
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
              {activeTab === 'about' && <ProfileAbout profile={currentProfile} />}
              {activeTab === 'media' && <ProfileMediaTab profile={currentProfile} isOwnProfile={isOwnProfile} />}
              {activeTab === 'posts' && <ProfilePosts profile={currentProfile} />}
              {activeTab === 'agenda' && <ProfileAgenda profile={currentProfile} isOwnProfile={isOwnProfile} />}
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

      {showPrivateAlbumModal && (
        <SendPrivateAlbumModal
          targetUserId={profile.id}
          targetUsername={profile.username}
          onClose={() => setShowPrivateAlbumModal(false)}
          onSent={() => {
            alert('Album privé envoyé avec succès');
            setShowPrivateAlbumModal(false);
          }}
        />
      )}

      {showPortfolioModal && (
        <SendPortfolioModal
          targetUserId={profile.id}
          targetUsername={profile.username}
          onClose={() => setShowPortfolioModal(false)}
          onSent={() => {
            alert('Portfolio envoyé avec succès');
            setShowPortfolioModal(false);
          }}
        />
      )}

      {showReportModal && (
        <ReportUserModal
          targetUserId={profile.id}
          targetUsername={profile.username}
          onClose={() => setShowReportModal(false)}
          onReported={() => {
            alert('Signalement envoyé. Notre équipe va examiner ce profil.');
            setShowReportModal(false);
          }}
        />
      )}

      {showLTNSheet && (
        <LibreTonightSheet
          onClose={() => setShowLTNSheet(false)}
          onUpdate={() => {
            refreshProfile();
            setShowLTNSheet(false);
          }}
        />
      )}
    </div>
  );
}