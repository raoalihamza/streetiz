import { useQuery } from '@tanstack/react-query';
import { PostsService } from '../services';

/**
 * Hook to fetch all posts with caching and deduplication
 */
export function useQueryPosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => PostsService.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutes - posts update frequently
  });
}

/**
 * Hook to fetch posts by category
 */
export function useQueryPostsByCategory(category: string) {
  return useQuery({
    queryKey: ['posts', 'category', category],
    queryFn: () => PostsService.getByCategory(category),
    enabled: !!category,
  });
}

/**
 * Hook to fetch posts by user ID
 */
export function useQueryPostsByUser(userId: string) {
  return useQuery({
    queryKey: ['posts', 'user', userId],
    queryFn: () => PostsService.getByUserId(userId),
    enabled: !!userId,
  });
}
