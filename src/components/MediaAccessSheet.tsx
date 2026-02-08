import { useState, useEffect } from 'react';
import { X, Image, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MediaAccessSheetProps {
  targetUserId: string;
  targetUsername: string;
  onClose: () => void;
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

export default function MediaAccessSheet({ targetUserId, targetUsername, onClose }: MediaAccessSheetProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [activeGrant, setActiveGrant] = useState<MediaGrant | null>(null);
  const [pendingRequest, setPendingRequest] = useState<MediaRequest | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    loadAccessStatus();
    const interval = setInterval(() => {
      if (activeGrant?.expires_at) {
        updateTimeRemaining();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetUserId, activeGrant]);

  const loadAccessStatus = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: grant } = await supabase
        .rpc('get_active_grant', { viewer_id: user.id, owner_id: targetUserId })
        .single();

      if (grant) {
        setActiveGrant(grant);
      } else {
        const { data: request } = await supabase
          .from('media_access_requests')
          .select('id, status, duration, created_at')
          .eq('requester_user_id', user.id)
          .eq('owner_user_id', targetUserId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .maybeSingle();

        setPendingRequest(request);
      }
    } catch (error) {
      console.error('Error loading access status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTimeRemaining = () => {
    if (!activeGrant?.expires_at) return;

    const expiresAt = new Date(activeGrant.expires_at);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeRemaining('Expiré');
      setActiveGrant(null);
      return;
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  };

  const handleRequestAccess = async (duration: '5m' | '1h' | 'always') => {
    if (!user) return;

    setRequesting(true);
    try {
      const { data, error } = await supabase.rpc('create_media_request', {
        p_owner_id: targetUserId,
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
    } finally {
      setRequesting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!pendingRequest) return;

    try {
      await supabase
        .from('media_access_requests')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', pendingRequest.id);

      setPendingRequest(null);
    } catch (error) {
      console.error('Error canceling request:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-[#0a0a0a] border border-[#333] rounded-2xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 text-streetiz-red animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case '5m': return '5 minutes';
      case '1h': return '1 heure';
      case 'always': return 'Toujours';
      default: return duration;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-[#333] rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-streetiz-red to-purple-600 flex items-center justify-center">
              <Image className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Accès à la galerie</h3>
              <p className="text-[#888] text-sm">{targetUsername}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#666] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeGrant ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">Accès actif</span>
              </div>
              <p className="text-[#888] text-sm">
                Vous avez accès à la galerie de {targetUsername}
              </p>
              {activeGrant.expires_at && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-green-500/20">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-mono text-sm">
                    Expire dans : {timeRemaining}
                  </span>
                </div>
              )}
              {!activeGrant.expires_at && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-green-500/20">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">Accès permanent</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full bg-streetiz-red hover:bg-streetiz-red/80 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Voir la galerie
            </button>
          </div>
        ) : pendingRequest ? (
          <div className="space-y-4">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 font-semibold">Demande en attente</span>
              </div>
              <p className="text-[#888] text-sm">
                Votre demande d'accès ({getDurationLabel(pendingRequest.duration)}) est en attente de validation.
              </p>
            </div>
            <button
              onClick={handleCancelRequest}
              className="w-full bg-[#222] hover:bg-[#333] text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Annuler la demande
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#111] border border-[#222] rounded-xl p-4">
              <p className="text-[#888] text-sm">
                Demandez un accès temporaire ou permanent à la galerie privée de {targetUsername}.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleRequestAccess('5m')}
                disabled={requesting}
                className="w-full bg-[#111] hover:bg-[#1a1a1a] border border-[#222] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Demander accès (5 minutes)</span>
                </div>
              </button>

              <button
                onClick={() => handleRequestAccess('1h')}
                disabled={requesting}
                className="w-full bg-[#111] hover:bg-[#1a1a1a] border border-[#222] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Demander accès (1 heure)</span>
                </div>
              </button>

              <button
                onClick={() => handleRequestAccess('always')}
                disabled={requesting}
                className="w-full bg-streetiz-red hover:bg-streetiz-red/80 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Demander accès permanent</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}