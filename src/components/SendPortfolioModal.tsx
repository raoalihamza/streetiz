import { useState } from 'react';
import { X, Folder, Send, Link as LinkIcon, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SendPortfolioModalProps {
  targetUserId: string;
  targetUsername: string;
  onClose: () => void;
  onSent?: () => void;
}

const PORTFOLIO_TYPES = [
  { value: 'epk_dj', label: 'EPK DJ' },
  { value: 'portfolio_danse', label: 'Portfolio Danse' },
  { value: 'maquettes_musique', label: 'Maquettes Musique' },
  { value: 'portfolio_video', label: 'Portfolio Vidéo' },
  { value: 'lien_externe', label: 'Lien externe' }
];

export default function SendPortfolioModal({
  targetUserId,
  targetUsername,
  onClose,
  onSent
}: SendPortfolioModalProps) {
  const { user } = useAuth();
  const [portfolioType, setPortfolioType] = useState('epk_dj');
  const [externalLink, setExternalLink] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!user) return;

    if (!externalLink.trim() && !message.trim()) {
      alert('Veuillez ajouter un lien ou un message');
      return;
    }

    setSending(true);
    try {
      const { data: canSend, error: rateLimitError } = await supabase
        .rpc('check_portfolio_rate_limit', {
          sender_id: user.id,
          target_id: targetUserId
        });

      if (rateLimitError) throw rateLimitError;

      if (!canSend) {
        alert('Limite atteinte : maximum 5 portfolios par 24h à cette personne');
        setSending(false);
        return;
      }

      const { error } = await supabase
        .from('portfolio_shares')
        .insert({
          sender_user_id: user.id,
          target_user_id: targetUserId,
          portfolio_type: portfolioType,
          message: message.trim() || null,
          external_link: externalLink.trim() || null,
          status: 'active'
        });

      if (error) throw error;

      onSent?.();
      onClose();
    } catch (error) {
      console.error('Error sending portfolio:', error);
      alert('Erreur lors de l\'envoi du portfolio');
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
              <Folder className="w-6 h-6 text-green-400" />
              Envoyer un portfolio
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
            <label className="block text-white font-bold mb-3">Type de portfolio</label>
            <div className="grid grid-cols-2 gap-3">
              {PORTFOLIO_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setPortfolioType(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    portfolioType === type.value
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-[#333] bg-[#111] hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      portfolioType === type.value ? 'bg-green-500/30' : 'bg-[#222]'
                    }`}>
                      <FileText className={`w-5 h-5 ${
                        portfolioType === type.value ? 'text-green-400' : 'text-[#666]'
                      }`} />
                    </div>
                    <div className={`font-bold ${
                      portfolioType === type.value ? 'text-white' : 'text-[#666]'
                    }`}>
                      {type.label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white font-bold mb-3 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-green-400" />
              Lien externe (Drive, Dropbox, Notion...)
            </label>
            <input
              type="url"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              maxLength={600}
              placeholder="https://drive.google.com/... ou https://www.dropbox.com/..."
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="text-xs text-[#666] mt-1">
              Partagez un lien vers votre portfolio hébergé en ligne
            </div>
          </div>

          <div>
            <label className="block text-white font-bold mb-3">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={600}
              placeholder="Ex: Salut, je candidate pour le casting... voici mon dossier."
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={4}
            />
            <div className="text-xs text-[#666] mt-1 text-right">
              {message.length}/600
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-white font-bold mb-1">Conseil</div>
                <div className="text-sm text-[#999]">
                  Idéal pour un casting, booking DJ, ou présentation artistique. Incluez vos meilleures références, vidéos de performances, et coordonnées.
                </div>
              </div>
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
            disabled={sending || (!externalLink.trim() && !message.trim())}
            className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Envoyer le portfolio
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
