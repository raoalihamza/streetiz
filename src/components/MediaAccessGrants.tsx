import { useState, useEffect } from 'react';
import { Shield, User, XCircle, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MediaGrant {
  id: string;
  viewer_user_id: string;
  scope: string;
  expires_at: string | null;
  created_at: string;
  viewer_profile: {
    username: string;
    avatar_url: string;
  };
}

export default function MediaAccessGrants() {
  const { user } = useAuth();
  const [grants, setGrants] = useState<MediaGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    loadGrants();
  }, [user]);

  const loadGrants = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('media_access_grants')
        .select(`
          id,
          viewer_user_id,
          scope,
          expires_at,
          created_at,
          viewer_profile:profiles!media_access_grants_viewer_user_id_fkey(username, avatar_url)
        `)
        .eq('owner_user_id', user.id)
        .is('revoked_at', null)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGrants(data || []);
    } catch (error) {
      console.error('Error loading grants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (grantId: string) => {
    setRevoking(grantId);
    try {
      const { error } = await supabase.rpc('revoke_media_grant', {
        p_grant_id: grantId
      });

      if (error) throw error;
      await loadGrants();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la révocation');
    } finally {
      setRevoking(null);
    }
  };

  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return 'Permanent';

    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    if (diff <= 0) return 'Expiré';

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}min`;
    return `${minutes}min`;
  };

  if (loading) {
    return null;
  }

  if (grants.length === 0) {
    return (
      <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-streetiz-red" />
          Accès actifs
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mx-auto mb-3">
            <Shield className="w-8 h-8 text-[#666]" />
          </div>
          <p className="text-[#666] text-sm">Aucun accès actif</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-streetiz-red" />
        Accès actifs ({grants.length})
      </h3>

      <div className="space-y-3">
        {grants.map((grant) => (
          <div key={grant.id} className="bg-[#111] border border-[#222] rounded-xl p-4">
            <div className="flex items-center gap-3">
              {grant.viewer_profile?.avatar_url ? (
                <img
                  src={grant.viewer_profile.avatar_url}
                  alt={grant.viewer_profile.username}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-streetiz-red to-purple-600 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}

              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">
                  {grant.viewer_profile?.username || 'Utilisateur'}
                </h4>
                <div className="flex items-center gap-2 text-sm">
                  {grant.expires_at ? (
                    <>
                      <Clock className="w-3 h-3 text-orange-400" />
                      <span className="text-orange-400 font-semibold">
                        {getTimeRemaining(grant.expires_at)}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-green-400 font-semibold">Permanent</span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleRevoke(grant.id)}
                disabled={revoking === grant.id}
                className="bg-[#222] hover:bg-[#333] text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Révoquer l'accès"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}