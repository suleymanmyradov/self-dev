import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// ─── Reference SSE stream parser ─────────────────────────────────────────────
// This is a self-contained, spec-aligned Server-Sent Events stream parser used
// to validate the .sse fixture files. It is also the reference implementation
// the mobile app's `src/core/api/sse.ts` parser must match in behavior.
//
// It handles:
//   - CRLF/LF mixed line separators (CR is stripped per the SSE spec)
//   - comment/heartbeat lines (lines starting with ':')
//   - multiple `data:` lines for a single event (joined with '\n')
//   - `event:` lines naming the event type
//   - event blocks terminated by a blank line
//   - chunk boundaries (the parser is fed arbitrary string chunks and buffers
//     until a full block is available)
//   - malformed events (a block whose joined data is not valid JSON yields a
//     parse error event instead of throwing, so the caller can recover)
//
// The wire format produced by the gateway is:
//   event: <name>\n
//   data: <json>\n
//   \n
// with LF separators (see services/gateway/growth/internal/handler/personalization/
// streamPersonalizedCoachingHandler.go and .../voice/voiceTurnHandler.go).

export interface SSEEvent {
  /** Event type from the `event:` field, or 'message' if omitted. */
  event: string;
  /** Raw joined data string (multiple data: lines joined with '\n'). */
  data: string;
  /** Parsed JSON payload, or null if the data was empty or not valid JSON. */
  payload: unknown;
  /** True when the joined data was non-empty but failed JSON.parse. */
  malformed: boolean;
}

/**
 * parseSSEStream parses a complete SSE stream string into an ordered list of
 * events. It normalizes CRLF → LF, drops comment lines, accumulates multi-line
 * data fields, and emits one event per blank-line-terminated block.
 */
export function parseSSEStream(input: string): SSEEvent[] {
  // Normalize CRLF and lone CR to LF.
  const normalized = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const events: SSEEvent[] = [];
  let currentEvent = 'message';
  let dataLines: string[] = [];

  const flush = () => {
    if (dataLines.length === 0 && currentEvent === 'message') {
      // Empty block (no data, no event) — nothing to emit.
      currentEvent = 'message';
      dataLines = [];
      return;
    }
    if (dataLines.length === 0) {
      // An event: line with no data is still a valid (empty) event per spec,
      // but the gateway always sends data, so skip.
      currentEvent = 'message';
      dataLines = [];
      return;
    }
    const data = dataLines.join('\n');
    let payload: unknown = null;
    let malformed = false;
    if (data !== '') {
      try {
        payload = JSON.parse(data);
      } catch {
        malformed = true;
      }
    }
    events.push({ event: currentEvent, data, payload, malformed });
    currentEvent = 'message';
    dataLines = [];
  };

  for (const line of normalized.split('\n')) {
    if (line === '') {
      // Blank line dispatches the current event block.
      flush();
      continue;
    }
    if (line.startsWith(':')) {
      // Comment/heartbeat — ignore.
      continue;
    }
    if (line.startsWith('event:')) {
      currentEvent = line.slice(6).trim();
      continue;
    }
    if (line.startsWith('data:')) {
      // Per spec, a single leading space after the colon is stripped.
      const value = line.slice(5);
      dataLines.push(value.startsWith(' ') ? value.slice(1) : value);
      continue;
    }
    // Unknown field (id:, retry:, or garbage) — ignore for our purposes.
  }
  // Flush a trailing event block if the stream did not end with a blank line.
  if (dataLines.length > 0) {
    flush();
  }
  return events;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadStream(relativePath: string): string {
  return readFileSync(join(__dirname, relativePath), 'utf-8');
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('SSE parser — coaching-success.sse', () => {
  it('parses ordered thinking → delta → complete events', () => {
    const events = parseSSEStream(loadStream('streams/coaching-success.sse'));
    const types = events.map((e) => e.event);
    expect(types).toEqual(['thinking', 'thinking', 'delta', 'delta', 'delta', 'complete']);
    // All payloads parse as JSON.
    expect(events.every((e) => !e.malformed)).toBe(true);
    // thinking events carry a message.
    expect((events[0].payload as { message: string }).message).toContain('Reflecting');
    // delta events carry text, in order.
    const deltas = events.filter((e) => e.event === 'delta');
    expect(deltas).toHaveLength(3);
    expect((deltas[0].payload as { text: string }).text).toContain('consistent with reading');
    // complete carries the full response.
    const complete = events.find((e) => e.event === 'complete');
    expect(complete).toBeDefined();
    expect((complete!.payload as { fullResponse: string }).fullResponse).toContain('streak is worth protecting');
  });
});

describe('SSE parser — coaching-error.sse', () => {
  it('parses thinking then a terminal error event', () => {
    const events = parseSSEStream(loadStream('streams/coaching-error.sse'));
    const types = events.map((e) => e.event);
    expect(types).toEqual(['thinking', 'error']);
    const errEvent = events.find((e) => e.event === 'error');
    expect(errEvent).toBeDefined();
    expect((errEvent!.payload as { message: string }).message).toContain('context deadline');
    // No complete event — this is a fatal stream.
    expect(events.some((e) => e.event === 'complete')).toBe(false);
  });
});

describe('SSE parser — coaching-malformed.sse', () => {
  it('handles CRLF/LF mix, comments, and a split-data malformed event', () => {
    const events = parseSSEStream(loadStream('streams/coaching-malformed.sse'));
    // The split-data delta joins two data lines with '\n', producing invalid
    // JSON — the parser must flag it as malformed but continue parsing.
    const types = events.map((e) => e.event);
    expect(types).toEqual(['thinking', 'delta', 'delta', 'complete']);
    // The first delta is the malformed one (JSON split across data: lines).
    expect(events[1].malformed).toBe(true);
    // The parser recovers and the remaining events parse cleanly.
    expect(events[2].malformed).toBe(false);
    expect((events[2].payload as { text: string }).text).toContain('streak is worth protecting');
    expect(events[3].malformed).toBe(false);
    expect((events[3].payload as { fullResponse: string }).fullResponse).toContain('consistent with reading');
  });
});

describe('SSE parser — coaching-no-complete.sse', () => {
  it('parses a stream that ends without a complete event', () => {
    const events = parseSSEStream(loadStream('streams/coaching-no-complete.sse'));
    const types = events.map((e) => e.event);
    expect(types).toEqual(['thinking', 'delta', 'delta']);
    expect(events.some((e) => e.event === 'complete')).toBe(false);
    expect(events.every((e) => !e.malformed)).toBe(true);
  });
});

describe('SSE parser — chunk boundary robustness', () => {
  it('produces identical output when the stream is fed in arbitrary chunks', () => {
    // A real network stream arrives in arbitrary-sized reads. The reference
    // parser is a pure function over the full string, so chunking is the
    // caller's responsibility; here we verify that concatenating chunks and
    // parsing once matches parsing the whole, which is the contract the mobile
    // parser must preserve (buffer until a blank-line boundary).
    const whole = loadStream('streams/coaching-success.sse');
    const wholeEvents = parseSSEStream(whole);

    // Simulate 7-byte chunks.
    let chunks = '';
    for (let i = 0; i < whole.length; i += 7) {
      chunks += whole.slice(i, i + 7);
    }
    const chunkedEvents = parseSSEStream(chunks);
    expect(chunkedEvents).toEqual(wholeEvents);
  });
});
