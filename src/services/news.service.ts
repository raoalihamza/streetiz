import { supabase } from '../lib/supabase';
import type { News } from '../types';

export const NewsService = {
  /**
   * Get all news articles (optimized single query)
   */
  async getAll() {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) throw error;
    return data as News[];
  },

  /**
   * Get featured news
   */
  async getFeatured() {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data as News[];
  },

  /**
   * Get latest news (excluding featured)
   */
  async getLatest(limit: number = 10) {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as News[];
  },

  /**
   * Get news by category
   */
  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('category', category)
      .order('published_at', { ascending: false });

    if (error) throw error;
    return data as News[];
  },

  /**
   * Get a single news article by ID
   */
  async getById(newsId: string) {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', newsId)
      .single();

    if (error) throw error;
    return data as News;
  },

  /**
   * Increment views count
   */
  async incrementViews(newsId: string) {
    const { error } = await supabase.rpc('increment_news_views', {
      news_id: newsId,
    });

    if (error) throw error;
  },

  /**
   * Create a news article
   */
  async create(newsData: Partial<News>) {
    const { data, error } = await supabase
      .from('news')
      .insert(newsData)
      .select()
      .single();

    if (error) throw error;
    return data as News;
  },

  /**
   * Update a news article
   */
  async update(newsId: string, newsData: Partial<News>) {
    const { data, error } = await supabase
      .from('news')
      .update(newsData)
      .eq('id', newsId)
      .select()
      .single();

    if (error) throw error;
    return data as News;
  },

  /**
   * Delete a news article
   */
  async delete(newsId: string) {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', newsId);

    if (error) throw error;
  },
};
