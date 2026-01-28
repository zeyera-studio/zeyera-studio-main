
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'Movie' | 'TV Series';
  rating?: string;
  year?: string;
}

export interface RecommendationResponse {
  recommendations: ContentItem[];
}

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  created_at?: string;
}

// Content Management Types
export type ContentStatus = 'unpublished' | 'published' | 'archived';
export type ContentType = 'Movie' | 'TV Series';
export type Genre = 'Action' | 'Comedy' | 'Romance' | 'Sci-Fi' | 'Drama' | 'Horror' | 'Thriller' | 'Fantasy' | 'Western';

export interface Content {
  id: string;
  title: string;
  description: string;
  content_type: ContentType;
  genre: Genre;
  poster_url: string;
  video_url?: string;
  trailer_url?: string;
  year?: string;
  rating?: string;
  duration?: string; // "2h 15m" or "3 Seasons"
  cast_members?: string[]; // Renamed from 'cast' (SQL reserved keyword)
  director?: string;
  language?: string;
  quality?: string;
  price?: number; // Price in LKR for movies
  status: ContentStatus;
  uploaded_by?: string;
  published_by?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadProgress {
  poster?: number;
  video?: number;
}

export interface ContentStats {
  total: number;
  unpublished: number;
  published: number;
  archived: number;
}

// Episode Management Types
export type EpisodeStatus = 'unpublished' | 'published' | 'archived';

export interface Episode {
  id: string;
  content_id: string; // Foreign key to Content (TV Series)
  season_number: number;
  episode_number: number;
  title: string;
  description: string;
  video_url: string; // Required for episodes
  thumbnail_url?: string; // Optional, falls back to series poster
  duration?: string; // e.g., "45m", "1h 15m"
  status: EpisodeStatus;
  uploaded_by?: string;
  published_by?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SeasonGroup {
  seasonNumber: number;
  episodes: Episode[];
}

export interface EpisodeStats {
  total: number;
  published: number;
  seasons: number;
}

// Comments System Types
export interface Comment {
  id: string;
  content_id: string; // Foreign key to Content (Movie or TV Series)
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  // Joined data from profiles table
  username?: string;
  user_email?: string;
}

// Payment & Purchase Types
export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Purchase {
  id: string;
  user_id: string;
  content_id: string;
  season_number?: number; // NULL for movies, specific season for TV series
  order_id: string; // PayHere order_id
  amount: number;
  currency: string;
  status: PurchaseStatus;
  payment_method?: string;
  purchased_at: string;
  completed_at?: string;
  // Joined data
  content?: Content;
}

export interface SeasonPrice {
  id: string;
  content_id: string;
  season_number: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface PayHerePaymentData {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
}