import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved | Growth',
  description: 'Your saved articles, habits, and goals.',
};

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
