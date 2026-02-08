import { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Loader, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import MediaAccessRequests from './MediaAccessRequests';
import MediaAccessGrants from './MediaAccessGrants';
import LockedGallery from './LockedGallery';

interface ProfileMediaTabProps {
  profile: any;
  isOwnProfile: boolean;
}

interface MediaItem {
  id: string;
  type: string;
  url: string;
  thumb_url: string | null;
  created_at: string;
}

interface MediaGrant {
  id: string;
  scope: string;
  expires_at: string | null;
  created_at: string;
}

interface MediaRequest {
  id: string;
  status: string;
  duration: string;
  created_at: string;
}

export default function ProfileMediaTab({ profile, isOwnProfile }: ProfileMediaTabProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaAccess, setMediaAccess] = useState<MediaGrant | null>(null);
  const [pendingRequest, setPendingRequest] = useState<MediaRequest | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    loadMedia();
    if (!isOwnProfile && user) {
      checkMediaAccess();
    }
  }, [profile.id, user]);

  useEffect(() => {
    if (mediaAccess?.expires_at) {
      const interval = setInterval(updateTimeRemaining, 1000);
      return () => clearInterval(interval);
    }
  }, [mediaAccess]);

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('owner_user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaItems(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMediaAccess = async () => {
    if (!user) return;

    try {
      const { data: grant } = await supabase
        .rpc('get_active_grant', { viewer_id: user.id, owner_id: profile.id })
        .single();

      if (grant) {
        setMediaAccess(grant);
      } else {
        const { data: request } = await supabase
          .from('media_access_requests')
          .select('id, status, duration, created_at')
          .eq('requester_user_id', user.id)
          .eq('owner_user_id', profile.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .maybeSingle();

        setPendingRequest(request);
      }
    } catch (error) {
      console.error('Error checking media access:', error);
    }
  };

  const updateTimeRemaining = () => {
    if (!mediaAccess?.expires_at) return;

    const expiresAt = new Date(mediaAccess.expires_at);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeRemaining('Expiré');
      setMediaAccess(null);
      return;
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  };

  const handleRequestAccess = async (duration: '5m' | '1h' | 'always') => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('create_media_request', {
        p_owner_id: profile.id,
        p_duration: duration,
        p_message: null
      });

      if (error) throw error;

      setPendingRequest({
        id: data,
        status: 'pending',
        duration,
        created_at: new Date().toISOString()
      });
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la demande');
    }
  };

  const pinnedMedia = Array.isArray(profile.pinned_media) ? profile.pinned_media : [];
  const pinnedItems = mediaItems.filter(item => pinnedMedia.includes(item.id)).slice(0, 3);
  const canViewMedia = isOwnProfile || mediaAccess;

  if (isOwnProfile) {
    return (
      <div className="space-y-6">
        <MediaAccessRequests />
        <MediaAccessGrants />

        {pinnedItems.length > 0 && (
          <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Médias épinglés
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {pinnedItems.map((item) => (
                <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden group">
                  {item.type === 'video' ? (
                    <>
                      <img
                        src={item.thumb_url || item.url}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Video className="w-8 h-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.url}
                      alt="Photo"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-streetiz-red animate-spin" />
          </div>
        ) : mediaItems.length > 0 ? (
          <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-streetiz-red" />
              Galerie ({mediaItems.length})
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {mediaItems.map((item) => (
                <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
                  {item.type === 'video' ? (
                    <>
                      <img
                        src={item.thumb_url || item.url}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                        <Video className="w-8 h-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.url}
                      alt="Photo"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-12 text-center">
            <ImageIcon className="w-12 h-12 text-[#666] mx-auto mb-3" />
            <p className="text-[#666]">Aucun média</p>
          </div>
        )}
      </div>
    );
  }

  if (!canViewMedia) {
    return (
      <LockedGallery
        ownerUsername={profile.username}
        onRequestAccess={handleRequestAccess}
        isPending={!!pendingRequest}
      />
    );
  }

  return (
    <div className="space-y-6">
      {mediaAccess && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-400 font-semibold mb-1">Accès actif</div>
              <p className="text-[#888] text-sm">
                Vous avez accès à la galerie de {profile.username}
              </p>
            </div>
            {mediaAccess.expires_at && (
              <div className="text-green-400 font-mono text-lg">
                {timeRemaining}
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-streetiz-red animate-spin" />
        </div>
      ) : mediaItems.length > 0 ? (
        <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-streetiz-red" />
            Galerie ({mediaItems.length})
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {mediaItems.map((item) => (
              <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
                {item.type === 'video' ? (
                  <>
                    <img
                      src={item.thumb_url || item.url}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <img
                    src={item.url}
                    alt="Photo"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-12 text-center">
          <ImageIcon className="w-12 h-12 text-[#666] mx-auto mb-3" />
          <p className="text-[#666]">Aucun média</p>
        </div>
      )}
    </div>
  );
}