import { useState, useEffect } from 'react';
import { X, Lock, Image, Video, Clock, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Media {
  id: string;
  media_type: 'photo' | 'video';
  media_url: string;
  thumbnail_url?: string;
}

interface SendPrivateAlbumModalProps {
  targetUserId: string;
  targetUsername: string;
  onClose: () => void;
  onSent?: () => void;
}

export default function SendPrivateAlbumModal({
  targetUserId,
  targetUsername,
  onClose,
  onSent
}: SendPrivateAlbumModalProps) {
  const { user } = useAuth();
  const [scope, setScope] = useState<'photos' | 'videos' | 'all'>('all');
  const [duration, setDuration] = useState<'5m' | '1h' | 'always'>('5m');
  const [message, setMessage] = useState('');
  const [media, setMedia] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMedia();
  }, [user]);

  const loadMedia = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profile_media')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order');

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter(m => {
    if (scope === 'photos') return m.media_type === 'photo';
    if (scope === 'videos') return m.media_type === 'video';
    return true;
  });

  const toggleMedia = (mediaId: string) => {
    const newSelected = new Set(selectedMedia);
    if (newSelected.has(mediaId)) {
      newSelected.delete(mediaId);
    } else {
      const photosCount = Array.from(newSelected).filter(id =>
        media.find(m => m.id === id)?.media_type === 'photo'
      ).length;
      const videosCount = Array.from(newSelected).filter(id =>
        media.find(m => m.id === id)?.media_type === 'video'
      ).length;

      const currentMedia = media.find(m => m.id === mediaId);
      if (currentMedia?.media_type === 'photo' && photosCount >= 12) {
        alert('Maximum 12 photos');
        return;
      }
      if (currentMedia?.media_type === 'video' && videosCount >= 3) {
        alert('Maximum 3 vidéos');
        return;
      }
      newSelected.add(mediaId);
    }
    setSelectedMedia(newSelected);
  };

  const handleSend = async () => {
    if (!user || selectedMedia.size === 0) return;

    setSending(true);
    try {
      let expiresAt = null;
      if (duration === '5m') {
        expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      } else if (duration === '1h') {
        expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      }

      const { data: share, error: shareError } = await supabase
        .from('private_album_shares')
        .insert({
          sender_user_id: user.id,
          target_user_id: targetUserId,
          scope,
          duration,
          expires_at: expiresAt,
          message: message.trim() || null,
          status: 'active'
        })
        .select()
        .single();

      if (shareError) throw shareError;

      const items = Array.from(selectedMedia).map(mediaId => {
        const m = media.find(item => item.id === mediaId)!;
        return {
          share_id: share.id,
          media_type: m.media_type,
          media_url: m.media_url,
          thumbnail_url: m.thumbnail_url || null
        };
      });

      const { error: itemsError } = await supabase
        .from('private_album_items')
        .insert(items);

      if (itemsError) throw itemsError;

      onSent?.();
      onClose();
    } catch (error) {
      console.error('Error sending private album:', error);
      alert('Erreur lors de l\'envoi de l\'album');
    } finally {
      setSending(false);
    }
  };

  const getDurationLabel = () => {
    if (duration === '5m') return '5 minutes';
    if (duration === '1h') return '1 heure';
    return 'Toujours';
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-[#222] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#222]">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Lock className="w-6 h-6 text-purple-400" />
              Album privé
            </h2>
            <p className="text-[#666] text-sm mt-1">
              Envoyer à @{targetUsername}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-[#111] hover:bg-[#222] rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-white font-bold mb-3">Type de contenu</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setScope('photos')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  scope === 'photos'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-[#333] bg-[#111] hover:bg-[#1a1a1a]'
                }`}
              >
                <Image className={`w-6 h-6 mx-auto mb-2 ${scope === 'photos' ? 'text-purple-400' : 'text-[#666]'}`} />
                <div className={`text-sm font-bold ${scope === 'photos' ? 'text-white' : 'text-[#666]'}`}>Photos</div>
              </button>
              <button
                onClick={() => setScope('videos')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  scope === 'videos'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-[#333] bg-[#111] hover:bg-[#1a1a1a]'
                }`}
              >
                <Video className={`w-6 h-6 mx-auto mb-2 ${scope === 'videos' ? 'text-purple-400' : 'text-[#666]'}`} />
                <div className={`text-sm font-bold ${scope === 'videos' ? 'text-white' : 'text-[#666]'}`}>Vidéos</div>
              </button>
              <button
                onClick={() => setScope('all')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  scope === 'all'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-[#333] bg-[#111] hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="flex gap-1 justify-center mb-2">
                  <Image className={`w-5 h-5 ${scope === 'all' ? 'text-purple-400' : 'text-[#666]'}`} />
                  <Video className={`w-5 h-5 ${scope === 'all' ? 'text-purple-400' : 'text-[#666]'}`} />
                </div>
                <div className={`text-sm font-bold ${scope === 'all' ? 'text-white' : 'text-[#666]'}`}>Tout</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white font-bold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Durée d'accès
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setDuration('5m')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  duration === '5m'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-[#333] bg-[#111] hover:bg-[#1a1a1a]'
                }`}
              >
                <div className={`text-lg font-black ${duration === '5m' ? 'text-white' : 'text-[#666]'}`}>5 min</div>
              </button>
              <button
                onClick={() => setDuration('1h')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  duration === '1h'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-[#333] bg-[#111] hover:bg-[#1a1a1a]'
                }`}
              >
                <div className={`text-lg font-black ${duration === '1h' ? 'text-white' : 'text-[#666]'}`}>1 heure</div>
              </button>
              <button
                onClick={() => setDuration('always')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  duration === 'always'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-[#333] bg-[#111] hover:bg-[#1a1a1a]'
                }`}
              >
                <div className={`text-lg font-black ${duration === 'always' ? 'text-white' : 'text-[#666]'}`}>Toujours</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white font-bold mb-3">
              Sélectionnez vos médias ({selectedMedia.size} sélectionnés)
            </label>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : filteredMedia.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {filteredMedia.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleMedia(m.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedMedia.has(m.id)
                        ? 'border-purple-500 ring-4 ring-purple-500/30'
                        : 'border-transparent hover:border-[#333]'
                    }`}
                  >
                    <img
                      src={m.thumbnail_url || m.media_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {m.media_type === 'video' && (
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                        <Video className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {selectedMedia.has(m.id) && (
                      <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-black text-sm">✓</span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#111] rounded-xl border border-[#222]">
                <p className="text-[#666]">Aucun média disponible</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-white font-bold mb-3">Message (optionnel)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={400}
              placeholder="Ex: Hello, casting / booking : voici mon album & mes références"
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
            <div className="text-xs text-[#666] mt-1 text-right">
              {message.length}/400
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#222] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[#111] hover:bg-[#222] text-white rounded-xl font-bold transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={sending || selectedMedia.size === 0}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Envoyer ({getDurationLabel()})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
