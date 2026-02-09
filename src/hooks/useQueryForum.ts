import { useQuery } from '@tanstack/react-query';
import { ForumService } from '../services';

/**
 * Hook to fetch all forum topics with caching
 */
export function useQueryForumTopics() {
  return useQuery({
    queryKey: ['forum', 'topics'],
    queryFn: () => ForumService.getAll(),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook to fetch forum topics by category
 */
export function useQueryForumTopicsByCategory(category: string) {
  return useQuery({
    queryKey: ['forum', 'topics', 'category', category],
    queryFn: () => ForumService.getByCategory(category),
    enabled: !!category,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Hook to fetch single forum topic by ID
 */
export function useQueryForumTopic(topicId: string) {
  return useQuery({
    queryKey: ['forum', 'topic', topicId],
    queryFn: () => ForumService.getById(topicId),
    enabled: !!topicId,
    staleTime: 5 * 60 * 1000,
  });
}
