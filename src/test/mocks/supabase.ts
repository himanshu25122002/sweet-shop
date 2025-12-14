import { vi } from 'vitest';

export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
  })),
};

vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabaseClient,
}));
