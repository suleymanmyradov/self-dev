// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckEmailPage from '@/app/check-email/page';

// ============================================
// Mocks
// ============================================

const mockRouterPush = vi.fn();
const mockResendVerificationAction = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/lib/actions/auth', () => ({
  resendVerificationAction: (...args: unknown[]) => mockResendVerificationAction(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ============================================
// Tests
// ============================================

describe('CheckEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the check email heading and description', () => {
    render(<CheckEmailPage />);
    expect(screen.getByText('Check your email')).toBeInTheDocument();
    expect(
      screen.getByText(/We sent a verification link to your email/i),
    ).toBeInTheDocument();
  });

  it('shows the 1 hour expiry notice', () => {
    render(<CheckEmailPage />);
    expect(screen.getByText(/The link expires in 1 hour/i)).toBeInTheDocument();
  });

  it('renders the resend form with email input and button', () => {
    render(<CheckEmailPage />);
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /resend verification email/i }),
    ).toBeInTheDocument();
  });

  it('renders the "Already verified? Sign in" link', () => {
    render(<CheckEmailPage />);
    const signInButton = screen.getByText('Sign in');
    expect(signInButton).toBeInTheDocument();
  });

  it('navigates to /login when "Sign in" is clicked', async () => {
    const user = userEvent.setup();
    render(<CheckEmailPage />);
    await user.click(screen.getByText('Sign in'));
    expect(mockRouterPush).toHaveBeenCalledWith('/login');
  });

  it('calls resendVerificationAction with the email on form submit', async () => {
    const user = userEvent.setup();
    mockResendVerificationAction.mockResolvedValue({
      success: true,
      message: 'Verification email sent.',
    });

    render(<CheckEmailPage />);

    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /resend verification email/i }));

    await waitFor(() => {
      expect(mockResendVerificationAction).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows success toast on successful resend', async () => {
    const { toast } = await import('sonner');
    const user = userEvent.setup();
    mockResendVerificationAction.mockResolvedValue({
      success: true,
      message: 'Verification email sent.',
    });

    render(<CheckEmailPage />);

    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /resend verification email/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Verification email sent.');
    });
  });

  it('shows error toast on failed resend', async () => {
    const { toast } = await import('sonner');
    const user = userEvent.setup();
    mockResendVerificationAction.mockResolvedValue({
      success: false,
      error: 'Failed to resend.',
    });

    render(<CheckEmailPage />);

    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /resend verification email/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to resend.');
    });
  });

  it('disables the form while sending', async () => {
    const user = userEvent.setup();
    // Make the action hang so we can observe the "Sending…" state
    mockResendVerificationAction.mockReturnValue(new Promise(() => {}));

    render(<CheckEmailPage />);

    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /resend verification email/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
    });
  });

  it('does not submit when email is empty', async () => {
    const user = userEvent.setup();
    render(<CheckEmailPage />);

    // The form has `required` on the input, so clicking won't trigger submit
    // in jsdom. But even if it did, handleResend checks for empty email.
    const button = screen.getByRole('button', { name: /resend verification email/i });
    await user.click(button);

    // The action should not have been called (form validation prevents it)
    expect(mockResendVerificationAction).not.toHaveBeenCalled();
  });

  it('shows the Self Dev AI brand link', () => {
    render(<CheckEmailPage />);
    expect(screen.getByText('Self Dev AI')).toBeInTheDocument();
  });
});
