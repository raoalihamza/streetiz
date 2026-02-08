import { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize2, Maximize2, Lock, Folder, MoreVertical, Camera, Mic } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SendPrivateAlbumModal from './SendPrivateAlbumModal';
import SendPortfolioModal from './SendPortfolioModal';

interface ChatWindowProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar: string | null;
  onClose: () => void;
  isFullScreen?: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export default function ChatWindow({ recipientId, recipientName, recipientAvatar, onClose, isFullScreen = false }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false);
  const [showPrivateAlbumModal, setShowPrivateAlbumModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadMessages();
      const subscription = setupRealtimeSubscription();
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      await supabase
        .from('user_chat_messages')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('sender_id', recipientId)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    return supabase
      .channel('user_chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_chat_messages',
          filter: `recipient_id=eq.${user?.id}`
        },
        (payload) => {
          if (payload.new.sender_id === recipientId) {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_chat_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: newMessage.trim()
        })
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    alert('Envoi de photos bientôt disponible!');
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      alert('Enregistrement vocal bientôt disponible!');
    } else {
      setIsRecording(true);
    }
  };

  return (
    <div className={isFullScreen ? "h-full flex flex-col" : "fixed bottom-4 right-4 z-50 w-[450px] bg-[#111] rounded-2xl border border-[#222] shadow-2xl overflow-hidden"}>
      <div className="bg-[#0a0a0a] border-b border-[#222] p-5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={recipientAvatar || `https://ui-avatars.com/api/?name=${recipientName}&background=ef4444&color=fff&size=48`}
            alt={recipientName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="text-white font-bold text-lg">{recipientName}</h3>
            <span className="text-sm text-green-400">En ligne</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowAdvancedMenu(!showAdvancedMenu)}
              className="w-10 h-10 rounded-lg bg-[#1a1a1a] hover:bg-[#222] border border-[#333] flex items-center justify-center transition-all"
              title="Options"
            >
              <MoreVertical className="w-5 h-5 text-[#999]" />
            </button>

            {showAdvancedMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowAdvancedMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#0a0a0a] border border-[#222] rounded-xl overflow-hidden shadow-2xl z-50">
                  <div className="p-2 border-b border-[#222]">
                    <p className="text-xs text-[#666] font-bold uppercase tracking-wider px-3 py-2">Options</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowAdvancedMenu(false);
                        setShowPrivateAlbumModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1a1a1a] transition-colors text-left"
                    >
                      <div className="w-9 h-9 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Lock className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">Ouvrir mon album privé</p>
                        <p className="text-[#666] text-xs">Partager vos photos privées</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowAdvancedMenu(false);
                        setShowPortfolioModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1a1a1a] transition-colors text-left"
                    >
                      <div className="w-9 h-9 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Folder className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">Envoyer dossier / maquette</p>
                        <p className="text-[#666] text-xs">Partager votre portfolio</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="w-px h-7 bg-[#333]" />
          {!isFullScreen && (
            <button
              onClick={() => setMinimized(!minimized)}
              className="w-10 h-10 rounded-lg hover:bg-[#1a1a1a] flex items-center justify-center transition-colors"
            >
              {minimized ? (
                <Maximize2 className="w-5 h-5 text-[#888]" />
              ) : (
                <Minimize2 className="w-5 h-5 text-[#888]" />
              )}
            </button>
          )}
          {isFullScreen && (
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg hover:bg-[#1a1a1a] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-[#888]" />
            </button>
          )}
          {!isFullScreen && (
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg hover:bg-[#1a1a1a] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-[#888]" />
            </button>
          )}
        </div>
      </div>

      {(isFullScreen || !minimized) && (
        <>
          <div className={isFullScreen ? "flex-1 overflow-y-auto p-5 space-y-4" : "h-[480px] overflow-y-auto p-5 space-y-4"}>
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#666] text-base">Aucun message. Dites bonjour!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] px-5 py-3 rounded-2xl ${
                        isOwn
                          ? 'bg-streetiz-red text-white rounded-br-none'
                          : 'bg-[#1a1a1a] text-white rounded-bl-none'
                      }`}
                    >
                      <p className="text-base leading-relaxed">{message.content}</p>
                      <span className="text-xs opacity-60 mt-2 block">
                        {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className={`border-t border-[#222] p-5 ${isFullScreen ? 'flex-shrink-0' : ''}`}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePhotoClick}
                className="w-11 h-11 bg-[#1a1a1a] hover:bg-blue-500/20 border border-[#333] hover:border-blue-500 rounded-full flex items-center justify-center transition-all flex-shrink-0"
                title="Envoyer une photo"
              >
                <Camera className="w-5 h-5 text-[#999]" />
              </button>
              <button
                type="button"
                onClick={handleVoiceRecord}
                className={`w-11 h-11 border border-[#333] rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                  isRecording
                    ? 'bg-streetiz-red hover:bg-red-600 border-streetiz-red animate-pulse'
                    : 'bg-[#1a1a1a] hover:bg-orange-500/20 hover:border-orange-500'
                }`}
                title={isRecording ? 'Arrêter l\'enregistrement' : 'Enregistrer un vocal'}
              >
                <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-[#999]'}`} />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message..."
                className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-full px-5 py-3 text-white text-base placeholder-[#666] focus:outline-none focus:border-streetiz-red"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || loading}
                className="w-12 h-12 bg-streetiz-red hover:bg-red-600 disabled:bg-[#333] disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors flex-shrink-0"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </form>
        </>
      )}

      {showPrivateAlbumModal && (
        <SendPrivateAlbumModal
          targetUserId={recipientId}
          targetUsername={recipientName}
          onClose={() => setShowPrivateAlbumModal(false)}
          onSent={() => {
            alert('Album privé envoyé avec succès');
            setShowPrivateAlbumModal(false);
          }}
        />
      )}

      {showPortfolioModal && (
        <SendPortfolioModal
          targetUserId={recipientId}
          targetUsername={recipientName}
          onClose={() => setShowPortfolioModal(false)}
          onSent={() => {
            alert('Portfolio envoyé avec succès');
            setShowPortfolioModal(false);
          }}
        />
      )}
    </div>
  );
}
