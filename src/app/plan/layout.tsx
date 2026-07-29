import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Habits | Growth',
  description: 'Track your daily habits and build consistent routines.',
};

export default function HabitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
