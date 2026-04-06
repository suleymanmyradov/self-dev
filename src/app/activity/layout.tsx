import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activity | Growth',
  description: 'View your recent activity and track your progress.',
};

export default function ActivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
