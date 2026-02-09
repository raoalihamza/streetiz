// Common types used across the application

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  created_at?: string;
  profile_extensions?: ProfileExtension[];
}

export interface ProfileExtension {
  id: string;
  location?: string;
  country?: string;
  nationality?: string;
  city?: string;
  profile_role?: string;
  roles?: string[];
  styles?: string[];
  followers_count?: number;
  following_count?: number;
  online_status?: string;
  team_collective?: string;
  social_links?: any;
  music_url?: string;
  music_type?: string;
}

export interface Post {
  id: string;
  user_id: string;
  post_type: string;
  content: string;
  media_urls?: string[];
  youtube_url?: string;
  tiktok_url?: string;
  audio_url?: string;
  audio_title?: string;
  audio_artist?: string;
  audio_cover_url?: string;
  article_title?: string;
  article_link?: string;
  article_image_url?: string;
  tags?: string[];
  category?: string;
  likes_count?: number;
  comments_count?: number;
  created_at?: string;
  profiles?: Profile;
}

export interface MarketplaceItem {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  listing_type: string;
  price?: number;
  rental_price_per_day?: number;
  condition: string;
  location: string;
  images?: string[];
  created_at?: string;
  profiles?: Profile;
}

export interface ForumTopic {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string;
  tags?: string[];
  photos?: string[];
  views_count?: number;
  replies_count?: number;
  is_resolved?: boolean;
  created_at?: string;
  profiles?: Profile;
}

export interface Announcement {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  location?: string;
  event_date?: string;
  tags?: string[];
  created_at?: string;
  profiles?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message?: string;
  last_message_at?: string;
  participant1?: Profile;
  participant2?: Profile;
}

export interface News {
  id: string;
  title: string;
  slug?: string;
  subtitle?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  image_url?: string;
  featured_image?: string;
  thumbnail_url?: string;
  author?: string;
  published_at?: string;
  is_featured?: boolean;
  views_count?: number;
  status?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_type?: string;
  date?: string;
  location?: string;
  image_url?: string;
  organizer_id?: string;
}
