import { supabase } from '../lib/supabase';
import type { Profile, ProfileExtension } from '../types';

export const ProfilesService = {
  /**
   * Get profile by user ID with extensions
   */
  async getById(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_extensions (*)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get profile by username
   */
  async getByUsername(username: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_extensions (*)
      `)
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get multiple profiles by role
   */
  async getByRole(role: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_extensions (*)
      `)
      .eq('profile_extensions.profile_role', role);

    if (error) throw error;
    return data;
  },

  /**
   * Get online members
   */
  async getOnlineMembers() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        display_name,
        avatar_url,
        profile_extensions (
          online_status,
          location,
          country
        )
      `)
      .eq('profile_extensions.online_status', 'online')
      .limit(20);

    if (error) throw error;
    return data;
  },

  /**
   * Search profiles by username or display name
   */
  async search(query: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_extensions (*)
      `)
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data;
  },

  /**
   * Update profile
   */
  async updateProfile(userId: string, profileData: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update profile extension
   */
  async updateExtension(userId: string, extensionData: Partial<ProfileExtension>) {
    const { data, error } = await supabase
      .from('profile_extensions')
      .upsert({
        id: userId,
        ...extensionData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update profile stats (followers, following, etc.)
   */
  async updateStats(userId: string) {
    const { error } = await supabase.rpc('update_profile_stats', {
      target_user_id: userId,
    });

    if (error) throw error;
  },

  /**
   * Get profile media (photos and videos)
   */
  async getMedia(userId: string) {
    const { data, error } = await supabase
      .from('profile_media')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Add profile media
   */
  async addMedia(mediaData: any) {
    const { data, error } = await supabase
      .from('profile_media')
      .insert(mediaData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete profile media
   */
  async deleteMedia(mediaId: string) {
    const { error } = await supabase
      .from('profile_media')
      .delete()
      .eq('id', mediaId);

    if (error) throw error;
  },

  /**
   * Get user's friends
   */
  async getFriends(userId: string) {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        friend_id,
        profiles!friendships_friend_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error) throw error;
    return data;
  },

  /**
   * Get friendship status between two users
   */
  async getFriendshipStatus(userId: string, friendId: string) {
    const { data, error } = await supabase
      .from('friendships')
      .select('status')
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No friendship found
      throw error;
    }
    return data;
  },

  /**
   * Send friend request
   */
  async sendFriendRequest(userId: string, friendId: string) {
    const { data, error } = await supabase
      .from('friendships')
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Accept friend request
   */
  async acceptFriendRequest(friendshipId: string) {
    const { data, error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get user follows
   */
  async getFollowing(userId: string) {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        following_id,
        profiles!user_follows_following_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('follower_id', userId);

    if (error) throw error;
    return data;
  },

  /**
   * Get user followers
   */
  async getFollowers(userId: string) {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        follower_id,
        profiles!user_follows_follower_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('following_id', userId);

    if (error) throw error;
    return data;
  },

  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string) {
    const { data, error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string) {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
  },
};
