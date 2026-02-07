import { useState, useEffect } from 'react';
import { X, Eye, MessageSquare, Send, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ForumTopicModalProps {
  topicId: string;
  onClose: () => void;
}

interface Topic {
  id: string;
  title: string;
  category: string;
  content: string;
  photos: string[];
  views_count: number;
  replies_count: number;
  is_resolved: boolean;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

export default function ForumTopicModal({ topicId, onClose }: ForumTopicModalProps) {
  const { user } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTopic();
    loadReplies();
    incrementViews();
  }, [topicId]);

  const loadTopic = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('id', topicId)
        .single();

      if (error) throw error;
      setTopic(data);
    } catch (error) {
      console.error('Error loading topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const incrementViews = async () => {
    try {
      await supabase.rpc('increment', {
        table_name: 'forum_topics',
        row_id: topicId,
        column_name: 'views_count'
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !user || submitting) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('forum_replies')
        .insert({
          topic_id: topicId,
          user_id: user.id,
          content: replyContent.trim()
        });

      if (error) throw error;

      setReplyContent('');
      await loadReplies();
      await loadTopic();
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Erreur lors de l\'envoi de la réponse');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Electro': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'DJing': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Events': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Matériel': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Danse': 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  if (loading || !topic) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] p-8 w-full max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#222] rounded w-3/4"></div>
            <div className="h-4 bg-[#222] rounded w-full"></div>
            <div className="h-4 bg-[#222] rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#222] flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getCategoryColor(topic.category)}`}>
                  {topic.category}
                </span>
                <span className="flex items-center gap-2 text-sm text-[#666]">
                  <Eye className="w-4 h-4" />
                  {topic.views_count}
                </span>
                <span className="flex items-center gap-2 text-sm text-[#666]">
                  <MessageSquare className="w-4 h-4" />
                  {topic.replies_count}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">
                {topic.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-[#666] hover:text-white transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-[#111] rounded-2xl border border-[#222] p-6">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={topic.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topic.profiles?.username}`}
                  alt={topic.profiles?.username}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-white font-bold">{topic.profiles?.username}</p>
                  <p className="text-sm text-[#666]">{formatDate(topic.created_at)}</p>
                </div>
              </div>

              <p className="text-[#ddd] whitespace-pre-wrap mb-4">{topic.content}</p>

              {topic.photos && topic.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {topic.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt=""
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-black text-lg">
                {replies.length} Réponse{replies.length !== 1 ? 's' : ''}
              </h3>

              {replies.map((reply) => (
                <div key={reply.id} className="bg-[#111] rounded-2xl border border-[#222] p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={reply.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.profiles?.username}`}
                      alt={reply.profiles?.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="text-white font-bold text-sm">{reply.profiles?.username}</p>
                      <p className="text-xs text-[#666]">{formatDate(reply.created_at)}</p>
                    </div>
                  </div>
                  <p className="text-[#ddd] whitespace-pre-wrap">{reply.content}</p>
                </div>
              ))}
            </div>
          </div>

          {user && (
            <div className="p-6 border-t border-[#222]">
              <form onSubmit={handleSubmitReply} className="flex gap-3">
                <img
                  src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt="You"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 flex gap-3">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Écrire une réponse..."
                    className="flex-1 bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
                  />
                  <button
                    type="submit"
                    disabled={!replyContent.trim() || submitting}
                    className="bg-gradient-to-r from-streetiz-red to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-streetiz-red/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {!user && (
            <div className="p-6 border-t border-[#222] text-center">
              <p className="text-[#666]">
                Connectez-vous pour répondre à ce topic
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
