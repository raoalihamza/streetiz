import { useQuery } from '@tanstack/react-query';
import { NewsService } from '../services';

/**
 * Hook to fetch all news articles
 */
export function useQueryNews() {
  return useQuery({
    queryKey: ['news', 'all'],
    queryFn: () => NewsService.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes - news changes slowly
  });
}

/**
 * Hook to fetch featured news articles
 */
export function useQueryFeaturedNews() {
  return useQuery({
    queryKey: ['news', 'featured'],
    queryFn: () => NewsService.getFeatured(),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch latest news articles
 */
export function useQueryLatestNews(limit = 10) {
  return useQuery({
    queryKey: ['news', 'latest', limit],
    queryFn: () => NewsService.getLatest(limit),
    staleTime: 10 * 60 * 1000,
  });
}
