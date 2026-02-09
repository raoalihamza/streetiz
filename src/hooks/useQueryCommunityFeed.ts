import { useQuery } from '@tanstack/react-query';
import { PostsService } from '../services';
import { supabase } from '../lib/supabase';

/**
 * Optimized hook for CommunityPage feed that batches all required queries
 * Eliminates duplicate calls by fetching posts, follows, likes, and saves in parallel
 */
export function useQueryCommunityFeed(userId: string | undefined, feedType: 'global' | 'following' | 'trending') {
  return useQuery({
    queryKey: ['community', 'feed', feedType, userId || 'anonymous'],
    queryFn: async () => {
      // Batch all queries in parallel for maximum efficiency
      const [posts, follows, likes, saves] = await Promise.all([
        PostsService.getAll(),
        userId ? supabase.from('user_follows').select('following_id').eq('follower_id', userId) : Promise.resolve(null),
        userId ? supabase.from('post_likes').select('post_id').eq('user_id', userId) : Promise.resolve(null),
        userId ? supabase.from('post_saves').select('post_id').eq('user_id', userId) : Promise.resolve(null),
      ]);

      return {
        posts: posts || [],
        followingIds: follows?.data?.map((f: any) => f.following_id) || [],
        likedPostIds: likes?.data?.map((l: any) => l.post_id) || [],
        savedPostIds: saves?.data?.map((s: any) => s.post_id) || [],
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - frequently changing data
  });
}

/**
 * Hook to fetch follower counts for multiple users in a single query
 * Eliminates 50+ individual API calls from FeedPost components
 */
export function useQueryFollowerCounts(userIds: string[]) {
  return useQuery({
    queryKey: ['followers', 'counts', userIds.sort().join(',')],
    queryFn: async () => {
      if (userIds.length === 0) return {};

      const { data, error } = await supabase
        .from('user_follows')
        .select('following_id')
        .in('following_id', userIds);

      if (error) throw error;

      // Group and count followers for each user
      const counts: Record<string, number> = {};
      userIds.forEach(id => counts[id] = 0);

      data?.forEach((follow: any) => {
        counts[follow.following_id] = (counts[follow.following_id] || 0) + 1;
      });

      return counts;
    },
    enabled: userIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes - follower counts change slowly
  });
}

// Note: useQueryFriends is in useQueryProfiles.ts to avoid duplication
