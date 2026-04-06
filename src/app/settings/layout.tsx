import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Growth',
  description: 'Manage your Growth account settings.',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
