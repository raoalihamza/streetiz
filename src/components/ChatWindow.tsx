import { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize2, Maximize2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import MediaAccessSheet from './MediaAccessSheet';

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
  const [showMediaAccessSheet, setShowMediaAccessSheet] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className={isFullScreen ? "h-full flex flex-col" : "fixed bottom-4 right-4 z-50 w-96 bg-[#111] rounded-2xl border border-[#222] shadow-2xl overflow-hidden"}>
      <div className="bg-[#0a0a0a] border-b border-[#222] p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={recipientAvatar || `https://ui-avatars.com/api/?name=${recipientName}&background=ef4444&color=fff&size=40`}
            alt={recipientName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="text-white font-bold text-sm">{recipientName}</h3>
            <span className="text-xs text-green-400">En ligne</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMediaAccessSheet(true)}
            className="w-8 h-8 rounded-lg hover:bg-streetiz-red/10 hover:border-streetiz-red flex items-center justify-center transition-colors border border-transparent"
            title="Accès médias"
          >
            <ImageIcon className="w-4 h-4 text-[#888] hover:text-streetiz-red" />
          </button>
          {!isFullScreen && (
            <button
              onClick={() => setMinimized(!minimized)}
              className="w-8 h-8 rounded-lg hover:bg-[#1a1a1a] flex items-center justify-center transition-colors"
            >
              {minimized ? (
                <Maximize2 className="w-4 h-4 text-[#888]" />
              ) : (
                <Minimize2 className="w-4 h-4 text-[#888]" />
              )}
            </button>
          )}
          {isFullScreen && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[#1a1a1a] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-[#888]" />
            </button>
          )}
          {!isFullScreen && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[#1a1a1a] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-[#888]" />
            </button>
          )}
        </div>
      </div>

      {(isFullScreen || !minimized) && (
        <>
          <div className={isFullScreen ? "flex-1 overflow-y-auto p-4 space-y-3" : "h-96 overflow-y-auto p-4 space-y-3"}>
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#666] text-sm">Aucun message. Dites bonjour!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-streetiz-red text-white rounded-br-none'
                          : 'bg-[#1a1a1a] text-white rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-60 mt-1 block">
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

          <form onSubmit={handleSendMessage} className={`border-t border-[#222] p-4 ${isFullScreen ? 'flex-shrink-0' : ''}`}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez un message..."
                className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 text-white text-sm placeholder-[#666] focus:outline-none focus:border-streetiz-red"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || loading}
                className="w-10 h-10 bg-streetiz-red hover:bg-red-600 disabled:bg-[#333] disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </form>
        </>
      )}

      {showMediaAccessSheet && (
        <MediaAccessSheet
          targetUserId={recipientId}
          targetUsername={recipientName}
          onClose={() => setShowMediaAccessSheet(false)}
        />
      )}
    </div>
  );
}
