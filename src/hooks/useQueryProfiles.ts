import { useQuery } from '@tanstack/react-query';
import { ProfilesService } from '../services';

/**
 * Hook to fetch online members with caching
 * Reduced refetch interval from 60s to 5min to minimize API calls (180/hour → 12/hour)
 */
export function useQueryOnlineMembers() {
  return useQuery({
    queryKey: ['profiles', 'online'],
    queryFn: () => ProfilesService.getOnlineMembers(),
    staleTime: 2 * 60 * 1000, // 2 minutes instead of 30 seconds
    refetchInterval: 5 * 60 * 1000, // 5 minutes instead of 60 seconds (12 calls/hour instead of 180)
  });
}

/**
 * Hook to fetch profile by ID
 */
export function useQueryProfile(userId: string) {
  return useQuery({
    queryKey: ['profiles', userId],
    queryFn: () => ProfilesService.getById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - profiles don't change often
  });
}

/**
 * Hook to fetch profile by username
 */
export function useQueryProfileByUsername(username: string) {
  return useQuery({
    queryKey: ['profiles', 'username', username],
    queryFn: () => ProfilesService.getByUsername(username),
    enabled: !!username,
  });
}

/**
 * Hook to fetch user's friends
 */
export function useQueryFriends(userId: string) {
  return useQuery({
    queryKey: ['friends', userId],
    queryFn: () => ProfilesService.getFriends(userId),
    enabled: !!userId,
  });
}

/**
 * Hook to fetch user's following list
 */
export function useQueryFollowing(userId: string) {
  return useQuery({
    queryKey: ['following', userId],
    queryFn: () => ProfilesService.getFollowing(userId),
    enabled: !!userId,
  });
}
