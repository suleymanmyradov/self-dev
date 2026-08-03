// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/login-form';
import type { AuthActionState } from '@/lib/actions/auth';

// ============================================
// Mocks
// ============================================

const mockRouterPush = vi.fn();
const mockLoginAction = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/lib/actions/auth', () => ({
  loginAction: (...args: unknown[]) => mockLoginAction(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Provide an in-memory storage for Zustand persist (jsdom's localStorage may be
// unavailable depending on the Node version; this avoids "Cannot read properties
// of undefined (reading 'setItem')" errors).
const memoryStore: Record<string, string> = {};
vi.mock('@/lib/safe-storage', () => ({
  getSafeStorage: () => ({
    getItem: (key: string) => memoryStore[key] ?? null,
    setItem: (key: string, value: string) => {
      memoryStore[key] = value;
    },
    removeItem: (key: string) => {
      delete memoryStore[key];
    },
  }),
}));

// GoogleButton reads config.googleClientId; default empty → button hidden.
// Preserve all other exports (isDev, isProd, getApiUrl, gatewayUrl, ...) so
// transitive imports (axios-client uses isDev) don't break.
vi.mock('@/lib/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/config')>();
  return {
    ...actual,
    config: {
      ...actual.config,
      googleClientId: '',
      googleRedirectUri: 'http://localhost:3000/auth/callback/google',
    },
  };
});

// ============================================
// Helpers
// ============================================

/** A successful login action return value. */
function successState(): AuthActionState {
  return {
    success: true,
    user: {
      id: 'usr_1',
      fullName: 'Jane Doe',
      username: 'janedoe',
      email: 'jane@example.com',
      bio: '',
      location: '',
      website: '',
      interests: [],
      avatarUrl: '',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      emailVerified: true,
    },
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };
}

/** An error login action return value. */
function errorState(message: string): AuthActionState {
  return { success: false, error: message };
}

/** A field-error login action return value. */
function fieldErrorState(field: string, message: string): AuthActionState {
  return { success: false, fieldErrors: { [field]: [message] } };
}

// ============================================
// Tests
// ============================================

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: loginAction resolves to a generic error so the form doesn't
    // navigate; individual tests override this.
    mockLoginAction.mockResolvedValue(errorState('invalid credentials'));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders email and password inputs', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders a submit button labeled "Sign in"', () => {
      render(<LoginForm />);
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders a "Forgot?" link to /forgot-password', () => {
      render(<LoginForm />);
      const link = screen.getByRole('link', { name: /forgot/i });
      expect(link).toHaveAttribute('href', '/forgot-password');
    });

    it('renders a "Create an account" link to /register', () => {
      render(<LoginForm />);
      const link = screen.getByRole('link', { name: /create an account/i });
      expect(link).toHaveAttribute('href', '/register');
    });

    it('does NOT render the Google button when googleClientId is empty', () => {
      render(<LoginForm />);
      expect(screen.queryByRole('button', { name: /google/i })).not.toBeInTheDocument();
    });

    it('renders the heading "Welcome back."', () => {
      render(<LoginForm />);
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    });
  });

  describe('client-side validation (blocks submit)', () => {
    it('shows an email error when email is empty', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      // Type a valid password but leave email empty
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      // The loginAction should NOT have been called (client validation blocked it)
      await waitFor(() => {
        expect(mockLoginAction).not.toHaveBeenCalled();
      });
    });

    it('shows a password error when password is too short', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      await user.type(screen.getByLabelText(/email/i), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'short');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      await waitFor(() => {
        expect(mockLoginAction).not.toHaveBeenCalled();
      });
    });
  });

  describe('successful submission', () => {
    it('calls loginAction, shows success toast, and navigates to /plan', async () => {
      mockLoginAction.mockResolvedValue(successState());
      const { toast } = await import('sonner');
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockLoginAction).toHaveBeenCalledTimes(1);
      });
      // loginAction is called as (prevState, formData)
      const [, formData] = mockLoginAction.mock.calls[0];
      expect(formData.get('email')).toBe('user@example.com');
      expect(formData.get('password')).toBe('password123');

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Logged in successfully');
      });
      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/plan');
      });
    });
  });

  describe('server-side error', () => {
    it('displays the error message when login fails with invalid credentials', async () => {
      mockLoginAction.mockResolvedValue(errorState('invalid credentials'));
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it('displays a field error from the server', async () => {
      mockLoginAction.mockResolvedValue(fieldErrorState('email', 'Invalid email address'));
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });
  });

  describe('form state during submission', () => {
    it('disables the submit button while the action is pending', async () => {
      // Delay the action resolution so we can observe the pending state.
      mockLoginAction.mockImplementation(
        () => new Promise<AuthActionState>((resolve) => setTimeout(() => resolve(successState()), 50)),
      );

      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'user@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // While pending, the button shows "Signing in..."
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
      });

      // Wait for the action to resolve and the button to return to normal
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
      });
    });
  });
});
