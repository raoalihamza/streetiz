import { supabase } from '../lib/supabase';
import type { MarketplaceItem } from '../types';

export const MarketplaceService = {
  /**
   * Get all marketplace items
   */
  async getAll() {
    const { data, error } = await supabase
      .from('marketplace_items')
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
    return data as MarketplaceItem[];
  },

  /**
   * Get marketplace items by category
   */
  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('marketplace_items')
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
    return data as MarketplaceItem[];
  },

  /**
   * Get marketplace items by listing type
   */
  async getByListingType(listingType: string) {
    const { data, error } = await supabase
      .from('marketplace_items')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('listing_type', listingType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as MarketplaceItem[];
  },

  /**
   * Get marketplace items by seller ID
   */
  async getBySellerId(sellerId: string) {
    const { data, error } = await supabase
      .from('marketplace_items')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as MarketplaceItem[];
  },

  /**
   * Get a single marketplace item by ID
   */
  async getById(itemId: string) {
    const { data, error } = await supabase
      .from('marketplace_items')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          profile_extensions (
            location,
            country
          )
        )
      `)
      .eq('id', itemId)
      .single();

    if (error) throw error;
    return data as MarketplaceItem;
  },

  /**
   * Create a new marketplace item
   */
  async create(itemData: Partial<MarketplaceItem>) {
    const { data, error } = await supabase
      .from('marketplace_items')
      .insert(itemData)
      .select()
      .single();

    if (error) throw error;
    return data as MarketplaceItem;
  },

  /**
   * Update a marketplace item
   */
  async update(itemId: string, itemData: Partial<MarketplaceItem>) {
    const { data, error } = await supabase
      .from('marketplace_items')
      .update(itemData)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data as MarketplaceItem;
  },

  /**
   * Delete a marketplace item
   */
  async delete(itemId: string) {
    const { error } = await supabase
      .from('marketplace_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  /**
   * Search marketplace items
   */
  async search(query: string) {
    const { data, error } = await supabase
      .from('marketplace_items')
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data as MarketplaceItem[];
  },
};
