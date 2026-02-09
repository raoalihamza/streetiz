import { supabase } from '../lib/supabase';
import type { Announcement } from '../types';

export const AnnouncementsService = {
  /**
   * Get all announcements
   */
  async getAll() {
    const { data, error } = await supabase
      .from('announcements')
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
    return data as Announcement[];
  },

  /**
   * Get announcements by type
   */
  async getByType(type: string) {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Announcement[];
  },

  /**
   * Get a single announcement by ID
   */
  async getById(announcementId: string) {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('id', announcementId)
      .single();

    if (error) throw error;
    return data as Announcement;
  },

  /**
   * Create a new announcement
   */
  async create(announcementData: Partial<Announcement>) {
    const { data, error } = await supabase
      .from('announcements')
      .insert(announcementData)
      .select()
      .single();

    if (error) throw error;
    return data as Announcement;
  },

  /**
   * Update an announcement
   */
  async update(announcementId: string, announcementData: Partial<Announcement>) {
    const { data, error } = await supabase
      .from('announcements')
      .update(announcementData)
      .eq('id', announcementId)
      .select()
      .single();

    if (error) throw error;
    return data as Announcement;
  },

  /**
   * Delete an announcement
   */
  async delete(announcementId: string) {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcementId);

    if (error) throw error;
  },
};
