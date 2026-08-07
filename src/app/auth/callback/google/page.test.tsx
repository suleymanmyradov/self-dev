// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StrictMode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import GoogleCallbackPage from './page';
import type { AuthActionState } from '@/lib/actions/auth';

// ============================================
// Mocks
// ============================================

const mockRouterPush = vi.fn();
const mockGoogleLoginAction = vi.fn();
const mockSetAuth = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams('code=test-auth-code&state=xyz'),
}));

vi.mock('@/lib/actions/auth', () => ({
  googleLoginAction: (...args: unknown[]) => mockGoogleLoginAction(...args),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/store/auth', () => ({
  useAuthStore: (selector: (s: { login: unknown }) => unknown) =>
    selector({ login: mockSetAuth }),
}));

// ============================================
// Helpers
// ============================================

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

// ============================================
// Tests
// ============================================

describe('GoogleCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGoogleLoginAction.mockResolvedValue(successState());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('exchanges the authorization code exactly once, even under StrictMode double-invoke', async () => {
    // StrictMode double-invokes effects in dev (mount → cleanup → remount).
    // Google auth codes are single-use; a second exchange gets `invalid_grant`.
    render(
      <StrictMode>
        <GoogleCallbackPage />
      </StrictMode>,
    );

    await waitFor(() => {
      expect(mockGoogleLoginAction).toHaveBeenCalledTimes(1);
    });
    expect(mockGoogleLoginAction).toHaveBeenCalledWith('test-auth-code');
  });

  it('logs the user in and routes to /onboarding on success', async () => {
    render(<GoogleCallbackPage />);

    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith(successState().user);
    });
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('shows an error and does not navigate when the action fails', async () => {
    mockGoogleLoginAction.mockResolvedValue({
      success: false,
      error: 'Invalid Google authorization code.',
    });

    render(<GoogleCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText(/invalid google authorization code/i)).toBeInTheDocument();
    });
    expect(mockSetAuth).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
