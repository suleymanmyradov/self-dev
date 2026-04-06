import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Growth',
  description: 'Sign in to your Growth account to track habits and achieve your goals.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
