import { supabase } from '../lib/supabase';
import type { Message, Conversation } from '../types';

export const MessagesService = {
  /**
   * Get user's conversations
   */
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:profiles!conversations_participant1_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        ),
        participant2:profiles!conversations_participant2_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data as Conversation[];
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Message[];
  },

  /**
   * Send a message
   */
  async sendMessage(conversationId: string, senderId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Message;
  },

  /**
   * Create or get conversation between two users
   */
  async getOrCreateConversation(user1Id: string, user2Id: string) {
    // First, try to find existing conversation
    const { data: existing, error: findError } = await supabase
      .from('conversations')
      .select('*')
      .or(
        `and(participant1_id.eq.${user1Id},participant2_id.eq.${user2Id}),and(participant1_id.eq.${user2Id},participant2_id.eq.${user1Id})`
      )
      .single();

    if (!findError && existing) {
      return existing as Conversation;
    }

    // Create new conversation if not found
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant1_id: user1Id,
        participant2_id: user2Id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Conversation;
  },

  /**
   * Subscribe to new messages in a conversation
   */
  subscribeToConversation(
    conversationId: string,
    onNewMessage: (message: Message) => void
  ) {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onNewMessage(payload.new as Message);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Unsubscribe from a conversation
   */
  async unsubscribeFromConversation(channel: any) {
    await supabase.removeChannel(channel);
  },

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string) {
    const { error } = await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId);

    if (error) throw error;
  },
};
