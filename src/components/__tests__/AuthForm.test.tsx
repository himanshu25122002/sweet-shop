import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthForm } from '../AuthForm';
import { AuthProvider } from '../../contexts/AuthContext';
import { mockSupabaseClient } from '../../test/mocks/supabase';

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it('should render login form by default', () => {
    render(
      <AuthProvider>
        <AuthForm />
      </AuthProvider>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should switch between login and register modes', () => {
    render(
      <AuthProvider>
        <AuthForm />
      </AuthProvider>
    );

    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);

    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should handle login submission', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null,
    });

    render(
      <AuthProvider>
        <AuthForm />
      </AuthProvider>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should display error message on failed login', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    });

    render(
      <AuthProvider>
        <AuthForm />
      </AuthProvider>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('should handle registration submission', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { id: '123', email: 'newuser@example.com' } },
      error: null,
    });

    render(
      <AuthProvider>
        <AuthForm />
      </AuthProvider>
    );

    const registerTab = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerTab);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
      });
    });
  });

  it('should display success message after registration', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { id: '123', email: 'newuser@example.com' } },
      error: null,
    });

    render(
      <AuthProvider>
        <AuthForm />
      </AuthProvider>
    );

    const registerTab = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerTab);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/account created successfully/i)).toBeInTheDocument();
    });
  });

  it('should require email and password', () => {
    render(
      <AuthProvider>
        <AuthForm />
      </AuthProvider>
    );

    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
    expect(passwordInput.minLength).toBe(6);
  });
});
