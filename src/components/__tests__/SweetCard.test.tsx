import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SweetCard } from '../SweetCard';
import { AuthProvider } from '../../contexts/AuthContext';
import { mockSupabaseClient } from '../../test/mocks/supabase';
import { Sweet } from '../../types/database';

const mockSweet: Sweet = {
  id: '1',
  name: 'Chocolate Truffle',
  category: 'chocolate',
  price: 12.99,
  quantity: 50,
  description: 'Rich dark chocolate truffles',
  created_by: 'user123',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('SweetCard', () => {
  const mockOnUpdate = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it('should render sweet details', () => {
    render(
      <AuthProvider>
        <SweetCard sweet={mockSweet} onUpdate={mockOnUpdate} onEdit={mockOnEdit} />
      </AuthProvider>
    );

    expect(screen.getByText('Chocolate Truffle')).toBeInTheDocument();
    expect(screen.getByText('chocolate')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    expect(screen.getByText(/50 in stock/i)).toBeInTheDocument();
    expect(screen.getByText(/Rich dark chocolate truffles/i)).toBeInTheDocument();
  });

  it('should display purchase button for available sweets', () => {
    render(
      <AuthProvider>
        <SweetCard sweet={mockSweet} onUpdate={mockOnUpdate} onEdit={mockOnEdit} />
      </AuthProvider>
    );

    const purchaseButton = screen.getByRole('button', { name: /purchase/i });
    expect(purchaseButton).toBeInTheDocument();
    expect(purchaseButton).not.toBeDisabled();
  });

  it('should disable purchase button when out of stock', () => {
    const outOfStockSweet = { ...mockSweet, quantity: 0 };

    render(
      <AuthProvider>
        <SweetCard sweet={outOfStockSweet} onUpdate={mockOnUpdate} onEdit={mockOnEdit} />
      </AuthProvider>
    );

    const purchaseButton = screen.getByRole('button', { name: /out of stock/i });
    expect(purchaseButton).toBeDisabled();
  });

  it('should handle purchase action', async () => {
    const mockFrom = vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    }));

    mockSupabaseClient.from = mockFrom;

    render(
      <AuthProvider>
        <SweetCard sweet={mockSweet} onUpdate={mockOnUpdate} onEdit={mockOnEdit} />
      </AuthProvider>
    );

    const purchaseButton = screen.getByRole('button', { name: /purchase/i });
    fireEvent.click(purchaseButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('should show admin buttons for admin users', async () => {
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

    render(
      <AuthProvider>
        <SweetCard sweet={mockSweet} onUpdate={mockOnUpdate} onEdit={mockOnEdit} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTitle(/edit sweet/i)).toBeInTheDocument();
      expect(screen.getByTitle(/delete sweet/i)).toBeInTheDocument();
    });
  });

  it('should handle delete action with confirmation', async () => {
    const mockUser = { id: '123', email: 'admin@example.com' };
    const mockProfile = { id: '123', role: 'admin' as const, created_at: '2024-01-01' };

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    const mockDelete = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockFrom = vi.fn((table: string) => {
      if (table === 'user_profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        };
      }
      return {
        delete: vi.fn().mockReturnThis(),
        eq: mockDelete,
      };
    });

    mockSupabaseClient.from = mockFrom;

    global.confirm = vi.fn(() => true);

    render(
      <AuthProvider>
        <SweetCard sweet={mockSweet} onUpdate={mockOnUpdate} onEdit={mockOnEdit} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTitle(/delete sweet/i)).toBeInTheDocument();
    });

    const deleteButton = screen.getByTitle(/delete sweet/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled();
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('should apply correct styling based on stock levels', () => {
    const lowStockSweet = { ...mockSweet, quantity: 15 };

    render(
      <AuthProvider>
        <SweetCard sweet={lowStockSweet} onUpdate={mockOnUpdate} onEdit={mockOnEdit} />
      </AuthProvider>
    );

    const stockText = screen.getByText(/15 in stock/i);
    expect(stockText.className).toContain('text-yellow-600');
  });
});
