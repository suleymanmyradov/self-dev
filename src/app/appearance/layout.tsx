import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Appearance | Growth',
  description: 'Customize the look and feel of your Growth experience.',
};

export default function AppearanceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
