import { supabase } from '../lib/supabase';
import type { Post } from '../types';

export const PostsService = {
  /**
   * Get all posts with profile information
   */
  async getAll() {
    const { data, error } = await supabase
      .from('posts')
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
    return data as Post[];
  },

  /**
   * Get posts by category
   */
  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('posts')
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
    return data as Post[];
  },

  /**
   * Get posts by user ID
   */
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Post[];
  },

  /**
   * Get posts by type
   */
  async getByType(postType: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('post_type', postType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Post[];
  },

  /**
   * Get a single post by ID
   */
  async getById(postId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;
    return data as Post;
  },

  /**
   * Create a new post
   */
  async create(postData: Partial<Post>) {
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (error) throw error;
    return data as Post;
  },

  /**
   * Update a post
   */
  async update(postId: string, postData: Partial<Post>) {
    const { data, error } = await supabase
      .from('posts')
      .update(postData)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data as Post;
  },

  /**
   * Delete a post
   */
  async delete(postId: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  },

  /**
   * Increment likes count
   */
  async incrementLikes(postId: string) {
    const { error } = await supabase.rpc('increment_post_likes', {
      post_id: postId,
    });

    if (error) throw error;
  },

  /**
   * Increment comments count
   */
  async incrementComments(postId: string) {
    const { error } = await supabase.rpc('increment_post_comments', {
      post_id: postId,
    });

    if (error) throw error;
  },
};
