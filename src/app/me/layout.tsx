import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | Growth',
  description: 'Manage your Growth profile and personal information.',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
