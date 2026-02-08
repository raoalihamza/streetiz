import { useState, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, FileText, Radio } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Activity {
  id: string;
  type: 'post' | 'like' | 'comment' | 'follow' | 'online';
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  metadata?: any;
}

interface ActivityFeedProps {
  onViewProfile: (userId: string) => void;
}

export default function ActivityFeed({ onViewProfile }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadActivities = async () => {
    try {
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          created_at,
          profiles (username, display_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: onlineData } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          avatar_url,
          profile_extensions (online_status, last_seen)
        `)
        .limit(20);

      const activities: Activity[] = [];

      (postsData || []).forEach((post: any) => {
        activities.push({
          id: `post-${post.id}`,
          type: 'post',
          user_id: post.user_id,
          username: post.profiles.username,
          display_name: post.profiles.display_name,
          avatar_url: post.profiles.avatar_url,
          created_at: post.created_at,
        });
      });

      (onlineData || [])
        .filter((user: any) => user.profile_extensions?.[0]?.online_status === 'online')
        .forEach((user: any) => {
          activities.push({
            id: `online-${user.id}`,
            type: 'online',
            user_id: user.id,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            created_at: user.profile_extensions[0].last_seen || new Date().toISOString(),
          });
        });

      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setActivities(activities.slice(0, 4));
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return FileText;
      case 'like': return Heart;
      case 'comment': return MessageCircle;
      case 'follow': return UserPlus;
      case 'online': return Radio;
      default: return FileText;
    }
  };

  const getActivityText = (activity: Activity) => {
    const name = activity.display_name || activity.username;
    switch (activity.type) {
      case 'post': return `${name} a publié`;
      case 'like': return `${name} a aimé un post`;
      case 'comment': return `${name} a commenté`;
      case 'follow': return `${name} suit maintenant`;
      case 'online': return `${name} est en ligne`;
      default: return name;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'post': return 'text-blue-400';
      case 'like': return 'text-red-400';
      case 'comment': return 'text-green-400';
      case 'follow': return 'text-purple-400';
      case 'online': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'à l\'instant';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}j`;
  };

  if (loading) {
    return (
      <div className="bg-[#111] rounded-2xl border border-[#222] p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1a1a1a] rounded-full" />
              <div className="flex-1 bg-[#1a1a1a] h-4 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
      <div className="p-3 border-b border-[#222]">
        <h3 className="text-white font-black text-xs uppercase tracking-wider">
          Activité Récente
        </h3>
      </div>

      <div className="max-h-[240px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-4 text-center">
            <FileText className="w-8 h-8 text-[#333] mx-auto mb-2" />
            <p className="text-[#666] text-xs">Aucune activité récente</p>
          </div>
        ) : (
          <div className="p-2">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <button
                  key={activity.id}
                  onClick={() => onViewProfile(activity.user_id)}
                  className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#1a1a1a] transition-colors text-left group"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={activity.avatar_url || `https://ui-avatars.com/api/?name=${activity.username}&background=ef4444&color=fff&size=40`}
                      alt={activity.username}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    {activity.type === 'online' && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#111] rounded-full animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-base font-semibold mb-0.5 truncate">
                      {getActivityText(activity)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${getActivityColor(activity.type)}`} />
                      <span className="text-[#666] text-sm">
                        {getTimeAgo(activity.created_at)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
