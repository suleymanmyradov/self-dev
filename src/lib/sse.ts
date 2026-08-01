/**
 * Shared SSE (Server-Sent Events) parsing utilities.
 *
 * Used by the voice-turn and weekly-review streaming API clients to parse
 * raw SSE event blocks into structured `{ event, data }` pairs.
 */

export interface SSEEvent {
  /** The event type from the `event:` field (defaults to `"message"`). */
  event: string;
  /** The concatenated `data:` payload (multiple `data:` lines joined with `\n`). */
  data: string;
}

/**
 * Parse a raw SSE event block (the text between two `\n\n` separators) into
 * an `SSEEvent`. Returns `null` when the block contains no `data:` field.
 *
 * Per the SSE spec:
 * - `event:` sets the event type (last one wins).
 * - Multiple `data:` lines are concatenated with `\n` to form the payload.
 * - Lines starting with `:` are comments and ignored.
 */
export function parseSSEEvent(raw: string): SSEEvent | null {
  let event = 'message';
  let data = '';
  for (const line of raw.split('\n')) {
    if (line.startsWith(':')) {
      // Comment line — ignore.
      continue;
    }
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      data += (data ? '\n' : '') + line.slice(5).trim();
    }
  }
  if (!data) return null;
  return { event, data };
}
