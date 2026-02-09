import { useState, useEffect } from 'react';
import { Search, MessageCircle, Send, MoreVertical, Check, CheckCheck, Circle } from 'lucide-react';
import { MessagesService } from '../services';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Conversation {
  id: string;
  recipient_id: string;
  recipient_name: string;
  recipient_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_online: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface MessagesInboxProps {
  onViewProfile: (userId: string) => void;
}

export default function MessagesInbox({ onViewProfile }: MessagesInboxProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (!user || !selectedConversation) return;

    // OPTIMIZED: Use MessagesService for real-time subscription
    const channel = MessagesService.subscribeToConversation(
      selectedConversation,
      (newMsg) => {
        if (newMsg.sender_id !== user.id) {
          const formattedMessage: Message = {
            id: newMsg.id,
            sender_id: newMsg.sender_id,
            content: newMsg.content,
            created_at: newMsg.created_at,
            read: false,
          };
          setMessages((prev) => [...prev, formattedMessage]);
        }
      }
    );

    return () => {
      MessagesService.unsubscribeFromConversation(channel);
    };
  }, [user, selectedConversation]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', [user.id])
        .order('last_message_at', { ascending: false });

      if (convError) throw convError;

      if (convData && convData.length > 0) {
        const allParticipantIds = Array.from(
          new Set(convData.flatMap(c => c.participant_ids))
        ).filter(id => id !== user.id);

        if (allParticipantIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .in('id', allParticipantIds);

          const { data: extensionsData } = await supabase
            .from('profile_extensions')
            .select('user_id, online_status')
            .in('user_id', allParticipantIds);

          const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
          const extensionsMap = new Map(extensionsData?.map(e => [e.user_id, e.online_status]) || []);

          const conversationIds = convData.map(c => c.id);
          const { data: messagesData } = await supabase
            .from('messages')
            .select('*')
            .in('conversation_id', conversationIds)
            .order('created_at', { ascending: false });

          const lastMessagesMap = new Map();
          convData.forEach(conv => {
            const convMessages = messagesData?.filter(m => m.conversation_id === conv.id) || [];
            if (convMessages.length > 0) {
              lastMessagesMap.set(conv.id, convMessages[0]);
            }
          });

          const conversationsList: Conversation[] = convData.map(conv => {
            const otherParticipantId = conv.participant_ids.find(id => id !== user.id) || '';
            const profile = profilesMap.get(otherParticipantId);
            const lastMessage = lastMessagesMap.get(conv.id);
            const unreadMessages = messagesData?.filter(m =>
              m.conversation_id === conv.id &&
              m.sender_id !== user.id &&
              !m.read_by?.includes(user.id)
            ) || [];

            return {
              id: conv.id,
              recipient_id: otherParticipantId,
              recipient_name: profile?.display_name || profile?.username || 'Unknown',
              recipient_avatar: profile?.avatar_url || null,
              last_message: lastMessage?.content || 'Aucun message',
              last_message_time: lastMessage?.created_at || conv.created_at,
              unread_count: unreadMessages.length,
              is_online: extensionsMap.get(otherParticipantId) === 'online',
            };
          });

          setConversations(conversationsList);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!user) return;

    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = (messagesData || []).map(m => ({
        id: m.id,
        sender_id: m.sender_id,
        content: m.content,
        created_at: m.created_at,
        read: m.read_by?.includes(user.id) || m.sender_id === user.id,
      }));

      setMessages(formattedMessages);

      await supabase
        .from('messages')
        .update({ read_by: [...(messagesData?.[0]?.read_by || []), user.id] })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .not('read_by', 'cs', `{${user.id}}`);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: messageText.trim(),
          read_by: [user.id],
        })
        .select()
        .single();

      if (error) throw error;

      const newMessage: Message = {
        id: data.id,
        sender_id: data.sender_id,
        content: data.content,
        created_at: data.created_at,
        read: true,
      };

      setMessages([...messages, newMessage]);
      setMessageText('');

      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation);

      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'à l\'instant';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}j`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.recipient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-streetiz-red/20 border-t-streetiz-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 h-[calc(100vh-200px)]">
      <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden shadow-lg shadow-black/50 flex flex-col">
        <div className="p-4 border-b border-[#222]">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-6 h-6 text-streetiz-red" />
            <h2 className="text-white font-black text-lg">Messages</h2>
            {conversations.filter(c => c.unread_count > 0).length > 0 && (
              <span className="ml-auto bg-streetiz-red text-white text-xs font-bold px-2 py-1 rounded-full">
                {conversations.reduce((acc, c) => acc + c.unread_count, 0)}
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une conversation..."
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-[#666] focus:outline-none focus:border-streetiz-red transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="w-12 h-12 text-[#333] mx-auto mb-3" />
              <p className="text-[#666] text-sm">Aucune conversation</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                    selectedConversation === conv.id
                      ? 'bg-streetiz-red/20 border border-streetiz-red/30'
                      : 'hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={conv.recipient_avatar || `https://ui-avatars.com/api/?name=${conv.recipient_name}&background=ef4444&color=fff&size=48`}
                      alt={conv.recipient_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conv.is_online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#111] rounded-full" />
                    )}
                    {conv.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-streetiz-red rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-[#111]">
                        {conv.unread_count}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-bold text-sm truncate">
                        {conv.recipient_name}
                      </p>
                      <span className="text-[#666] text-xs flex-shrink-0 ml-2">
                        {getTimeAgo(conv.last_message_time)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${
                      conv.unread_count > 0 ? 'text-white font-semibold' : 'text-[#666]'
                    }`}>
                      {conv.last_message}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden shadow-lg shadow-black/50 flex flex-col">
        {selectedConv ? (
          <>
            <div className="p-4 border-b border-[#222] flex items-center justify-between">
              <button
                onClick={() => onViewProfile(selectedConv.recipient_id)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="relative">
                  <img
                    src={selectedConv.recipient_avatar || `https://ui-avatars.com/api/?name=${selectedConv.recipient_name}&background=ef4444&color=fff&size=40`}
                    alt={selectedConv.recipient_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {selectedConv.is_online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#111] rounded-full" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-sm">{selectedConv.recipient_name}</p>
                  <p className="text-[#666] text-xs">
                    {selectedConv.is_online ? 'En ligne' : 'Hors ligne'}
                  </p>
                </div>
              </button>
              <button className="w-9 h-9 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] rounded-full flex items-center justify-center transition-colors">
                <MoreVertical className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.sender_id === user?.id
                        ? 'bg-gradient-to-r from-streetiz-red to-red-600 text-white'
                        : 'bg-[#1a1a1a] text-white border border-[#222]'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.sender_id === user?.id && (
                        msg.read ? <CheckCheck className="w-3 h-3 opacity-70" /> : <Check className="w-3 h-3 opacity-70" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#222]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Écrivez votre message..."
                  className="flex-1 bg-[#0a0a0a] border border-[#222] rounded-xl px-4 py-3 text-white text-sm placeholder-[#666] focus:outline-none focus:border-streetiz-red transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                  className="w-11 h-11 bg-gradient-to-r from-streetiz-red to-red-600 hover:from-red-600 hover:to-streetiz-red disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all shadow-lg shadow-streetiz-red/30"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-[#333] mx-auto mb-4" />
              <h3 className="text-white font-black text-xl mb-2">Sélectionnez une conversation</h3>
              <p className="text-[#666] text-sm">Choisissez une conversation pour commencer à discuter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
