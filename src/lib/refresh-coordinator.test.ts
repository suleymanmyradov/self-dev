import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  exchangeRefreshToken,
  peekRefreshToken,
  resetRefreshCoordinatorForTests,
} from './refresh-coordinator';

function refreshResponse(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const OK_BODY = { accessToken: 'new-at', refreshToken: 'new-rt' };

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  resetRefreshCoordinatorForTests();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('exchangeRefreshToken', () => {
  it('exchanges the token once for concurrent callers', async () => {
    let resolveFetch!: (r: Response) => void;
    fetchMock.mockReturnValue(
      new Promise<Response>((r) => {
        resolveFetch = r;
      }),
    );

    const p1 = exchangeRefreshToken('rt-1');
    const p2 = exchangeRefreshToken('rt-1');
    resolveFetch(refreshResponse(200, OK_BODY));

    const [o1, o2] = await Promise.all([p1, p2]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(o1).toEqual({ kind: 'ok', ...OK_BODY });
    expect(o2).toBe(o1);
  });

  it('replays the completed result to stragglers holding the rotated token', async () => {
    fetchMock.mockResolvedValue(refreshResponse(200, OK_BODY));
    const first = await exchangeRefreshToken('rt-1');
    // A second request arriving later still holding the OLD token must get
    // the same pair — not trigger a second rotation.
    const second = await exchangeRefreshToken('rt-1');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });

  it('maps 401/403 to rejected and caches the rejection', async () => {
    fetchMock.mockResolvedValue(refreshResponse(401, { error: 'invalid' }));
    expect(await exchangeRefreshToken('rt-dead')).toEqual({ kind: 'rejected' });
    expect(await exchangeRefreshToken('rt-dead')).toEqual({ kind: 'rejected' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('maps 5xx and network errors to unavailable', async () => {
    fetchMock.mockResolvedValueOnce(refreshResponse(503));
    expect(await exchangeRefreshToken('rt-x')).toEqual({ kind: 'unavailable' });

    resetRefreshCoordinatorForTests();
    fetchMock.mockRejectedValueOnce(new Error('conn refused'));
    expect(await exchangeRefreshToken('rt-x')).toEqual({ kind: 'unavailable' });
  });

  it('maps malformed bodies to unavailable', async () => {
    fetchMock.mockResolvedValue(refreshResponse(200, { accessToken: 'only' }));
    expect(await exchangeRefreshToken('rt-x')).toEqual({ kind: 'unavailable' });
  });

  it('times out entries after the grace window', async () => {
    vi.useFakeTimers();
    try {
      fetchMock.mockResolvedValue(refreshResponse(200, OK_BODY));
      await exchangeRefreshToken('rt-1');
      vi.advanceTimersByTime(31_000);
      // Outside the grace window the old token is presented to the backend
      // again (which will reject it — single-use rotation).
      fetchMock.mockResolvedValue(refreshResponse(401));
      expect(await exchangeRefreshToken('rt-1')).toEqual({ kind: 'rejected' });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('peekRefreshToken', () => {
  it('returns null when no exchange exists for the token', () => {
    expect(peekRefreshToken('rt-nope')).toBeNull();
  });

  it('never initiates an exchange', async () => {
    expect(peekRefreshToken('rt-nope')).toBeNull();
    await Promise.resolve();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shares an in-flight exchange', async () => {
    let resolveFetch!: (r: Response) => void;
    fetchMock.mockReturnValue(
      new Promise<Response>((r) => {
        resolveFetch = r;
      }),
    );
    const started = exchangeRefreshToken('rt-1');
    const peeked = peekRefreshToken('rt-1');
    expect(peeked).not.toBeNull();
    resolveFetch(refreshResponse(200, OK_BODY));
    expect(await peeked!).toEqual(await started);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('replays a completed exchange', async () => {
    fetchMock.mockResolvedValue(refreshResponse(200, OK_BODY));
    await exchangeRefreshToken('rt-1');
    const peeked = peekRefreshToken('rt-1');
    expect(peeked).not.toBeNull();
    expect(await peeked!).toEqual({ kind: 'ok', ...OK_BODY });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
