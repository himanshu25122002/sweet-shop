export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          role: 'user' | 'admin';
          created_at: string;
        };
        Insert: {
          id: string;
          role?: 'user' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: 'user' | 'admin';
          created_at?: string;
        };
      };
      sweets: {
        Row: {
          id: string;
          name: string;
          category: string;
          price: number;
          quantity: number;
          description: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          price: number;
          quantity?: number;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          price?: number;
          quantity?: number;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Sweet = Database['public']['Tables']['sweets']['Row'];
