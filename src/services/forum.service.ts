import { supabase } from '../lib/supabase';
import type { ForumTopic } from '../types';

export const ForumService = {
  /**
   * Get all forum topics
   */
  async getAll() {
    const { data, error } = await supabase
      .from('forum_topics')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ForumTopic[];
  },

  /**
   * Get forum topics by category
   */
  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('forum_topics')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ForumTopic[];
  },

  /**
   * Get a single forum topic by ID
   */
  async getById(topicId: string) {
    const { data, error } = await supabase
      .from('forum_topics')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('id', topicId)
      .single();

    if (error) throw error;
    return data as ForumTopic;
  },

  /**
   * Create a new forum topic
   */
  async create(topicData: Partial<ForumTopic>) {
    const { data, error } = await supabase
      .from('forum_topics')
      .insert(topicData)
      .select()
      .single();

    if (error) throw error;
    return data as ForumTopic;
  },

  /**
   * Update a forum topic
   */
  async update(topicId: string, topicData: Partial<ForumTopic>) {
    const { data, error } = await supabase
      .from('forum_topics')
      .update(topicData)
      .eq('id', topicId)
      .select()
      .single();

    if (error) throw error;
    return data as ForumTopic;
  },

  /**
   * Delete a forum topic
   */
  async delete(topicId: string) {
    const { error } = await supabase
      .from('forum_topics')
      .delete()
      .eq('id', topicId);

    if (error) throw error;
  },

  /**
   * Increment views count
   */
  async incrementViews(topicId: string) {
    const { error } = await supabase.rpc('increment_topic_views', {
      topic_id: topicId,
    });

    if (error) throw error;
  },

  /**
   * Increment replies count
   */
  async incrementReplies(topicId: string) {
    const { error } = await supabase.rpc('increment_topic_replies', {
      topic_id: topicId,
    });

    if (error) throw error;
  },

  /**
   * Search forum topics
   */
  async search(query: string) {
    const { data, error } = await supabase
      .from('forum_topics')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data as ForumTopic[];
  },
};
