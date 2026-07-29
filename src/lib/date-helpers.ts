import type { Habit } from '@/api';

// =============================================================================
// Date helpers
// =============================================================================

export function getDateEyebrow(): string {
  const now = new Date();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const day = days[now.getDay()];
  const date = String(now.getDate()).padStart(2, '0');
  const month = months[now.getMonth()];
  const hour = now.getHours();
  const period = hour < 12 ? 'MORNING' : hour < 18 ? 'AFTERNOON' : 'EVENING';
  return `${day} ${date} ${month} · ${period}`;
}

export function getWeekDayLabels(): string[] {
  return ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
}

// Build a 7-value array (Mon-Sun) of check-in counts from habits' recentHistory.
// recentHistory is oldest-first (index 0 = 27 days ago). We take the last 7
// entries and count completed habits per day. Today is the last index.
export function getWeeklyCheckInCounts(habits: Habit[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const habit of habits) {
    const history = habit.recentHistory ?? [];
    const last7 = history.slice(-7);
    last7.forEach((done, i) => {
      if (done && counts[i] !== undefined) counts[i] += 1;
    });
  }
  return counts;
}
