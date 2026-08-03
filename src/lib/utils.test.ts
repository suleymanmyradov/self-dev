import { describe, it, expect } from 'vitest';
import { capitalizeFirst } from '@/lib/utils';

describe('capitalizeFirst', () => {
  it('capitalizes the first letter of a lowercase string', () => {
    expect(capitalizeFirst('invalid credentials')).toBe('Invalid credentials');
  });

  it('leaves an already-capitalized string unchanged', () => {
    expect(capitalizeFirst('Invalid credentials')).toBe('Invalid credentials');
  });

  it('capitalizes a single character', () => {
    expect(capitalizeFirst('a')).toBe('A');
  });

  it('returns empty string unchanged', () => {
    expect(capitalizeFirst('')).toBe('');
  });

  it('does not modify the rest of the string', () => {
    expect(capitalizeFirst('hello World')).toBe('Hello World');
  });

  it('does NOT capitalize if the first character is a space', () => {
    // Only the first char is capitalized; a leading space is already non-lowercase
    // so the string is returned as-is. The backend now capitalizes at source,
    // so this edge case should not occur in practice.
    expect(capitalizeFirst(' precondition failed')).toBe(' precondition failed');
  });

  it('returns empty string for null', () => {
    expect(capitalizeFirst(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(capitalizeFirst(undefined)).toBe('');
  });
});
