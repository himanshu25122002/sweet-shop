import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { mockSupabaseClient } from '../../test/mocks/supabase';

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide authentication context', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });

  it('should handle sign up', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const response = await result.current.signUp('test@example.com', 'password123');
    expect(response.error).toBeNull();
    expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should handle sign in', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const response = await result.current.signIn('test@example.com', 'password123');
    expect(response.error).toBeNull();
    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should handle sign out', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.signOut();
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
  });

  it('should identify admin users', async () => {
    const mockUser = { id: '123', email: 'admin@example.com' };
    const mockProfile = { id: '123', role: 'admin' as const, created_at: '2024-01-01' };

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    const mockFrom = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    }));

    mockSupabaseClient.from = mockFrom;

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAdmin).toBe(true);
  });
});
