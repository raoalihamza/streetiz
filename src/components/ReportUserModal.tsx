import { useState } from 'react';
import { X, Flag, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ReportUserModalProps {
  targetUserId: string;
  targetUsername: string;
  onClose: () => void;
  onReported?: () => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam ou contenu indésirable' },
  { value: 'harassment', label: 'Harcèlement ou intimidation' },
  { value: 'hate_speech', label: 'Discours haineux ou discrimination' },
  { value: 'violence', label: 'Violence ou contenu dangereux' },
  { value: 'sexual_content', label: 'Contenu sexuel inapproprié' },
  { value: 'fake_profile', label: 'Faux profil ou usurpation d\'identité' },
  { value: 'scam', label: 'Arnaque ou fraude' },
  { value: 'other', label: 'Autre raison' }
];

export default function ReportUserModal({
  targetUserId,
  targetUsername,
  onClose,
  onReported
}: ReportUserModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

  const handleReport = async () => {
    if (!user || !reason) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_user_id: user.id,
          reported_user_id: targetUserId,
          reason,
          description: description.trim() || null,
          status: 'pending'
        });

      if (error) throw error;

      onReported?.();
      onClose();
    } catch (error) {
      console.error('Error reporting user:', error);
      alert('Erreur lors du signalement');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-[#222] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#222]">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Flag className="w-6 h-6 text-red-400" />
              Signaler un profil
            </h2>
            <p className="text-[#666] text-sm mt-1">
              Signaler @{targetUsername}
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
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-white font-bold mb-1">Important</div>
                <div className="text-sm text-[#999]">
                  Votre signalement sera examiné par notre équipe de modération. Les fausses déclarations peuvent entraîner des sanctions.
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-white font-bold mb-3">Raison du signalement</label>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    reason === r.value
                      ? 'border-red-500 bg-red-500/20'
                      : 'border-[#333] bg-[#111] hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      reason === r.value
                        ? 'border-red-500 bg-red-500'
                        : 'border-[#666]'
                    }`}>
                      {reason === r.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className={`font-semibold ${
                      reason === r.value ? 'text-white' : 'text-[#999]'
                    }`}>
                      {r.label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white font-bold mb-3">
              Détails supplémentaires (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              placeholder="Décrivez la situation en détail..."
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
            />
            <div className="text-xs text-[#666] mt-1 text-right">
              {description.length}/500
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
            onClick={handleReport}
            disabled={sending || !reason}
            className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Flag className="w-4 h-4" />
                Envoyer le signalement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
