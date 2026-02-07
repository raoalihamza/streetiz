import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, Filter, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import ChatWindow from '../components/ChatWindow';

interface Conversation {
  id: string;
  participant_ids: string[];
  is_group: boolean;
  name: string | null;
  last_message_at: string;
  created_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_by: string[];
}

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [lastMessages, setLastMessages] = useState<Map<string, Message>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    name: string;
    avatar: string | null;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', [user.id])
        .order('last_message_at', { ascending: false });

      if (convError) throw convError;

      if (convData && convData.length > 0) {
        setConversations(convData);

        const allParticipantIds = Array.from(
          new Set(convData.flatMap(c => c.participant_ids))
        ).filter(id => id !== user.id);

        if (allParticipantIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .in('id', allParticipantIds);

          if (profilesError) throw profilesError;
          if (profilesData) {
            const profilesMap = new Map(profilesData.map(p => [p.id, p]));
            setProfiles(profilesMap);
          }
        }

        const conversationIds = convData.map(c => c.id);
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false });

        if (messagesError) throw messagesError;
        if (messagesData) {
          const lastMessagesMap = new Map<string, Message>();
          convData.forEach(conv => {
            const convMessages = messagesData.filter(m => m.conversation_id === conv.id);
            if (convMessages.length > 0) {
              lastMessagesMap.set(conv.id, convMessages[0]);
            }
          });
          setLastMessages(lastMessagesMap);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConversationParticipant = (conv: Conversation): Profile | null => {
    const otherParticipantId = conv.participant_ids.find(id => id !== user?.id);
    return otherParticipantId ? profiles.get(otherParticipantId) || null : null;
  };

  const getConversationName = (conv: Conversation): string => {
    if (conv.name) return conv.name;
    const participant = getConversationParticipant(conv);
    return participant?.display_name || participant?.username || 'Unknown';
  };

  const getConversationAvatar = (conv: Conversation): string => {
    const participant = getConversationParticipant(conv);
    return participant?.avatar_url || `https://ui-avatars.com/api/?name=${getConversationName(conv)}&background=ef4444&color=fff&size=128`;
  };

  const handleOpenChat = (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      const participant = getConversationParticipant(conv);
      setSelectedConversation({
        id: participant?.id || '',
        name: getConversationName(conv),
        avatar: getConversationAvatar(conv)
      });
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const name = getConversationName(conv).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navigation currentPage="messages" />

      <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Messages</h1>
          <p className="text-[#888]">Conversations avec la communauté Streetiz</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-[#0f0f0f] rounded-2xl border border-[#222] overflow-hidden">
              <div className="p-4 border-b border-[#222]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une conversation..."
                    className="w-full bg-[#1a1a1a] text-white pl-10 pr-4 py-3 rounded-xl border border-[#333] focus:border-streetiz-red outline-none"
                  />
                </div>
              </div>

              <div className="divide-y divide-[#222] max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 border-4 border-streetiz-red/20 border-t-streetiz-red rounded-full animate-spin mx-auto" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="w-16 h-16 text-[#333] mx-auto mb-4" />
                    <p className="text-[#666]">
                      {searchQuery ? 'Aucune conversation trouvée' : 'Aucun message pour le moment'}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const lastMessage = lastMessages.get(conv.id);
                    const isUnread = lastMessage && user && !lastMessage.read_by.includes(user.id) && lastMessage.sender_id !== user.id;

                    return (
                      <button
                        key={conv.id}
                        onClick={() => handleOpenChat(conv.id)}
                        className="w-full p-4 hover:bg-[#1a1a1a] transition-colors flex items-start gap-3 text-left"
                      >
                        <img
                          src={getConversationAvatar(conv)}
                          alt={getConversationName(conv)}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className={`font-bold truncate ${isUnread ? 'text-white' : 'text-[#888]'}`}>
                              {getConversationName(conv)}
                            </h3>
                            {lastMessage && (
                              <span className="text-xs text-[#666] flex-shrink-0 ml-2">
                                {formatTime(lastMessage.created_at)}
                              </span>
                            )}
                          </div>
                          {lastMessage && (
                            <div className="flex items-center gap-2">
                              <p className={`text-sm truncate ${isUnread ? 'text-white font-semibold' : 'text-[#666]'}`}>
                                {lastMessage.content}
                              </p>
                              {isUnread && (
                                <span className="w-2 h-2 bg-streetiz-red rounded-full flex-shrink-0" />
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="bg-[#0f0f0f] rounded-2xl border border-[#222] overflow-hidden h-[600px]">
                <ChatWindow
                  recipientId={selectedConversation.id}
                  recipientName={selectedConversation.name}
                  recipientAvatar={selectedConversation.avatar}
                  onClose={() => setSelectedConversation(null)}
                  isFullScreen
                />
              </div>
            ) : (
              <div className="bg-[#0f0f0f] rounded-2xl border border-[#222] h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-20 h-20 text-[#333] mx-auto mb-4" />
                  <h3 className="text-xl font-black text-white mb-2">Sélectionne une conversation</h3>
                  <p className="text-[#666]">Choisis une conversation pour commencer à discuter</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
