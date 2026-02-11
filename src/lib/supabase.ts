import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallback for local-only mode
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Create Supabase client only if env vars are set
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = !!supabase;

// Database types (matching our schema)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          unit_preference: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          unit_preference?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          unit_preference?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          date: string;
          notes: string | null;
          exercises: any; // JSONB
          duration: number | null;
          start_time: string | null;
          end_time: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          name: string;
          date: string;
          notes?: string | null;
          exercises?: any;
          duration?: number | null;
          start_time?: string | null;
          end_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          date?: string;
          notes?: string | null;
          exercises?: any;
          duration?: number | null;
          start_time?: string | null;
          end_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          user_id: string;
          xp: number;
          level: number;
          rank: string;
          achievements: any; // JSONB
          current_streak: number;
          longest_streak: number;
          total_workouts: number;
          total_volume: number;
          total_prs: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          xp?: number;
          level?: number;
          rank?: string;
          achievements?: any;
          current_streak?: number;
          longest_streak?: number;
          total_workouts?: number;
          total_volume?: number;
          total_prs?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          xp?: number;
          level?: number;
          rank?: string;
          achievements?: any;
          current_streak?: number;
          longest_streak?: number;
          total_workouts?: number;
          total_volume?: number;
          total_prs?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      personal_records: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string;
          weight: number;
          reps: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_id: string;
          weight: number;
          reps: number;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise_id?: string;
          weight?: number;
          reps?: number;
          date?: string;
          created_at?: string;
        };
      };
    };
  };
};
