// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/components/register-form';
import type { AuthActionState } from '@/lib/actions/auth';

// ============================================
// Mocks
// ============================================

const mockRouterPush = vi.fn();
const mockRegisterAction = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/lib/actions/auth', () => ({
  registerAction: (...args: unknown[]) => mockRegisterAction(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// In-memory storage for Zustand persist
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

function successRequiresVerificationState(): AuthActionState {
  return {
    success: true,
    requiresVerification: true,
    message: 'Check your email to verify your account.',
  };
}

function errorState(message: string): AuthActionState {
  return { success: false, error: message };
}

function fieldErrorState(field: string, message: string): AuthActionState {
  return { success: false, fieldErrors: { [field]: [message] } };
}

const STRONG_PASSWORD = 'Abcdef1!';

// ============================================
// Tests
// ============================================

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegisterAction.mockResolvedValue(errorState('Registration failed.'));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders fullName, username, email, password, and confirmPassword inputs', () => {
      render(<RegisterForm />);
      // Use exact match for "Name" to avoid matching "Username"
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    });

    it('renders a "Create account" submit button', () => {
      render(<RegisterForm />);
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('renders a "Sign in" link to /login', () => {
      render(<RegisterForm />);
      const link = screen.getByRole('link', { name: /sign in/i });
      expect(link).toHaveAttribute('href', '/login');
    });

    it('does NOT render the Google button when googleClientId is empty', () => {
      render(<RegisterForm />);
      expect(screen.queryByRole('button', { name: /google/i })).not.toBeInTheDocument();
    });

    it('renders the heading "Start with one habit."', () => {
      render(<RegisterForm />);
      expect(screen.getByRole('heading', { name: /start with one habit/i })).toBeInTheDocument();
    });
  });

  describe('client-side validation (blocks submit)', () => {
    it('blocks submit when fullName is empty', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);
      await user.type(screen.getByLabelText(/username/i), 'janedoe');
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
      await user.type(screen.getByLabelText(/^password/i), STRONG_PASSWORD);
      await user.type(screen.getByLabelText(/confirm password/i), STRONG_PASSWORD);
      await user.click(screen.getByRole('button', { name: /create account/i }));
      await waitFor(() => {
        expect(mockRegisterAction).not.toHaveBeenCalled();
      });
    });

    it('blocks submit when username is too short', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);
      await user.type(screen.getByLabelText('Name'), 'Jane Doe');
      await user.type(screen.getByLabelText(/username/i), 'ab');
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
      await user.type(screen.getByLabelText(/^password/i), STRONG_PASSWORD);
      await user.type(screen.getByLabelText(/confirm password/i), STRONG_PASSWORD);
      await user.click(screen.getByRole('button', { name: /create account/i }));
      await waitFor(() => {
        expect(mockRegisterAction).not.toHaveBeenCalled();
      });
    });

    it('blocks submit when password is too short', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);
      await user.type(screen.getByLabelText('Name'), 'Jane Doe');
      await user.type(screen.getByLabelText(/username/i), 'janedoe');
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'Ab1!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Ab1!');
      await user.click(screen.getByRole('button', { name: /create account/i }));
      await waitFor(() => {
        expect(mockRegisterAction).not.toHaveBeenCalled();
      });
    });

    it('blocks submit when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);
      await user.type(screen.getByLabelText('Name'), 'Jane Doe');
      await user.type(screen.getByLabelText(/username/i), 'janedoe');
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
      await user.type(screen.getByLabelText(/^password/i), STRONG_PASSWORD);
      await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPass1!');
      await user.click(screen.getByRole('button', { name: /create account/i }));
      await waitFor(() => {
        expect(mockRegisterAction).not.toHaveBeenCalled();
      });
    });

    it('blocks submit when email is invalid', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);
      await user.type(screen.getByLabelText('Name'), 'Jane Doe');
      await user.type(screen.getByLabelText(/username/i), 'janedoe');
      await user.type(screen.getByLabelText(/email/i), 'notanemail');
      await user.type(screen.getByLabelText(/^password/i), STRONG_PASSWORD);
      await user.type(screen.getByLabelText(/confirm password/i), STRONG_PASSWORD);
      await user.click(screen.getByRole('button', { name: /create account/i }));
      await waitFor(() => {
        expect(mockRegisterAction).not.toHaveBeenCalled();
      });
    });
  });

  describe('successful submission (requires verification)', () => {
    it('calls registerAction, shows success toast, and navigates to /check-email', async () => {
      mockRegisterAction.mockResolvedValue(successRequiresVerificationState());
      const { toast } = await import('sonner');
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText('Name'), 'Jane Doe');
      await user.type(screen.getByLabelText(/username/i), 'janedoe');
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
      await user.type(screen.getByLabelText(/^password/i), STRONG_PASSWORD);
      await user.type(screen.getByLabelText(/confirm password/i), STRONG_PASSWORD);
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockRegisterAction).toHaveBeenCalledTimes(1);
      });

      const [, formData] = mockRegisterAction.mock.calls[0];
      expect(formData.get('fullName')).toBe('Jane Doe');
      expect(formData.get('username')).toBe('janedoe');
      expect(formData.get('email')).toBe('jane@example.com');
      expect(formData.get('password')).toBe(STRONG_PASSWORD);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Account created. Check your email to verify your account.',
        );
      });
      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/check-email');
      });
    });
  });

  describe('server-side errors', () => {
    it('displays the error message when registration fails', async () => {
      mockRegisterAction.mockResolvedValue(errorState('user already exists'));
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText('Name'), 'Jane Doe');
      await user.type(screen.getByLabelText(/username/i), 'janedoe');
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
      await user.type(screen.getByLabelText(/^password/i), STRONG_PASSWORD);
      await user.type(screen.getByLabelText(/confirm password/i), STRONG_PASSWORD);
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('User already exists')).toBeInTheDocument();
      });
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it('displays a field error from the server', async () => {
      mockRegisterAction.mockResolvedValue(
        fieldErrorState('username', 'Username must be at least 3 characters'),
      );
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText('Name'), 'Jane Doe');
      await user.type(screen.getByLabelText(/username/i), 'janedoe');
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
      await user.type(screen.getByLabelText(/^password/i), STRONG_PASSWORD);
      await user.type(screen.getByLabelText(/confirm password/i), STRONG_PASSWORD);
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
      });
    });
  });

  describe('username auto-lowercasing', () => {
    it('lowercases uppercase letters as the user types', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);
      const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement;
      await user.type(usernameInput, 'JaneDoe');
      // The form hook lowercases via setUsername(e.target.value.toLowerCase())
      expect(usernameInput.value).toBe('janedoe');
    });
  });
});
