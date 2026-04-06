import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore | Growth',
  description: 'Discover articles, habits, and goals to inspire your growth journey.',
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
