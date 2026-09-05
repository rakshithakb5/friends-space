export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at?: string;
}

export interface PrivacySettings {
  user_id: string;
  share_move: boolean;
  share_read: boolean;
  share_screen: boolean;
  updated_at?: string;
}

export interface DailyHabit {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  
  // Move Metrics
  steps: number;
  distance_km: number;
  active_duration_minutes: number;
  step_source: 'manual' | 'apple_health' | 'health_connect' | 'google_fit';

  // Read Metrics
  book_title: string | null;
  book_author: string | null;
  book_cover_url: string | null;
  current_page: number | null;
  total_pages: number | null;
  reading_progress_percent: number | null;

  // Screen Time Metrics
  screen_time_minutes: number;
  screen_source: 'manual' | 'api';

  created_at: string;
  updated_at: string;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'declined';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  addressee?: Profile;
}

export interface FriendFeedItem {
  friend_id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  
  share_move: boolean;
  steps: number | null;
  distance_km: number | null;
  active_duration_minutes: number | null;

  share_read: boolean;
  book_title: string | null;
  book_author: string | null;
  book_cover_url: string | null;
  reading_progress_percent: number | null;
  current_page: number | null;
  total_pages: number | null;

  share_screen: boolean;
  screen_time_minutes: number | null;
}
