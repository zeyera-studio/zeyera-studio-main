
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
