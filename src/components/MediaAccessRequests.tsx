import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MediaRequest {
  id: string;
  requester_user_id: string;
  status: string;
  duration: string;
  created_at: string;
  requester_profile: {
    username: string;
    avatar_url: string;
  };
}

export default function MediaAccessRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MediaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();

    const channel = supabase
      .channel('media_requests')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_access_requests',
          filter: `owner_user_id=eq.${user?.id}`
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('media_access_requests')
        .select(`
          id,
          requester_user_id,
          status,
          duration,
          created_at,
          requester_profile:profiles!media_access_requests_requester_user_id_fkey(username, avatar_url)
        `)
        .eq('owner_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const { error } = await supabase.rpc('approve_media_request', {
        p_request_id: requestId
      });

      if (error) throw error;
      await loadRequests();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'approbation');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeny = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const { error } = await supabase.rpc('deny_media_request', {
        p_request_id: requestId
      });

      if (error) throw error;
      await loadRequests();
    } catch (error: any) {
      alert(error.message || 'Erreur lors du refus');
    } finally {
      setProcessing(null);
    }
  };

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case '5m': return '5 minutes';
      case '1h': return '1 heure';
      case 'always': return 'Permanent';
      default: return duration;
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'À l\'instant';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  if (loading) {
    return null;
  }

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-streetiz-red" />
        Demandes d'accès à votre galerie
      </h3>

      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="bg-[#111] border border-[#222] rounded-xl p-4">
            <div className="flex items-start gap-3">
              {request.requester_profile?.avatar_url ? (
                <img
                  src={request.requester_profile.avatar_url}
                  alt={request.requester_profile.username}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-streetiz-red to-purple-600 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-semibold">
                    {request.requester_profile?.username || 'Utilisateur'}
                  </h4>
                  <span className="text-[#666] text-xs">{getTimeAgo(request.created_at)}</span>
                </div>
                <p className="text-[#888] text-sm mb-3">
                  Demande un accès <span className="text-streetiz-red font-semibold">{getDurationLabel(request.duration)}</span> à votre galerie
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={processing === request.id}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Accepter</span>
                  </button>
                  <button
                    onClick={() => handleDeny(request.id)}
                    disabled={processing === request.id}
                    className="flex-1 bg-[#222] hover:bg-[#333] text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Refuser</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}