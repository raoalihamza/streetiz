import { useState, useEffect } from 'react';
import { MessageSquare, Eye, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { ForumService } from '../services';

interface ForumTopic {
  id: string;
  title: string;
  category: string;
  content: string;
  photos: string[];
  views_count: number;
  replies_count: number;
  is_resolved: boolean;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

interface ForumListProps {
  onTopicClick: (topicId: string) => void;
  sortBy: string;
}

export default function ForumList({ onTopicClick, sortBy }: ForumListProps) {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopics();
  }, [sortBy]);

  const loadTopics = async () => {
    setLoading(true);
    try {
      // OPTIMIZED: Use ForumService instead of direct supabase call
      const data = await ForumService.getAll();

      // Client-side filtering and sorting based on sortBy
      let filteredTopics = data || [];

      if (sortBy === 'recent') {
        filteredTopics.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      } else if (sortBy === 'popular') {
        filteredTopics.sort((a, b) => (b.replies_count || 0) - (a.replies_count || 0));
      } else if (sortBy === 'unresolved') {
        filteredTopics = filteredTopics.filter((topic: any) => !topic.is_resolved);
      }

      setTopics(filteredTopics.slice(0, 50));
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#111] rounded-2xl border border-[#222] p-6 animate-pulse">
            <div className="h-6 bg-[#222] rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-[#222] rounded w-full mb-2"></div>
            <div className="h-4 bg-[#222] rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <div
          key={topic.id}
          onClick={() => onTopicClick(topic.id)}
          className="bg-[#111] rounded-2xl border border-[#222] p-6 hover:border-streetiz-red/50 transition-all cursor-pointer group"
        >
          <div className="flex items-start gap-4">
            <img
              src={topic.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topic.profiles?.username}`}
              alt={topic.profiles?.username}
              className="w-12 h-12 rounded-full"
            />

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getCategoryColor(topic.category)}`}>
                      {topic.category}
                    </span>
                    {topic.is_resolved && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Résolu
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-lg group-hover:text-streetiz-red transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-[#888] text-sm mt-2 line-clamp-2">
                    {topic.content}
                  </p>
                </div>

                {topic.photos && topic.photos.length > 0 && (
                  <img
                    src={topic.photos[0]}
                    alt=""
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-[#666]">
                <span className="text-xs">
                  par <span className="text-white font-semibold">{topic.profiles?.username}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(topic.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {topic.views_count}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {topic.replies_count} réponses
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {topics.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-[#333] mx-auto mb-4" />
          <p className="text-[#666] text-lg">Aucun topic trouvé</p>
        </div>
      )}
    </div>
  );
}
