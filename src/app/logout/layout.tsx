import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Logout | Growth',
  description: 'Sign out of your Growth account.',
};

export default function LogoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
