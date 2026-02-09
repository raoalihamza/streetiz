import { useQuery } from '@tanstack/react-query';
import { MessagesService } from '../services';

/**
 * Hook to fetch user's conversations
 */
export function useQueryConversations(userId: string) {
  return useQuery({
    queryKey: ['messages', 'conversations', userId],
    queryFn: () => MessagesService.getConversations(userId),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds - messages need fresher data
  });
}

/**
 * Hook to fetch messages for a specific conversation
 */
export function useQueryMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', 'conversation', conversationId],
    queryFn: () => MessagesService.getMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  });
}
