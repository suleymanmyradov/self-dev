import { describe, expect, it } from 'vitest';
import { getDailyCheckInCounts } from './weekly-review-client';

describe('useDailyCheckInCounts', () => {
  it('preserves the completed check-in total when an even distribution rounds up', () => {
    const review = {
      completedCheckIns: 6,
      totalHabits: 2,
    } as Parameters<typeof getDailyCheckInCounts>[0];

    expect(getDailyCheckInCounts(review).reduce((total, count) => total + count, 0)).toBe(6);
  });
});
