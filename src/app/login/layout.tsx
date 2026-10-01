import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Evolella',
  description: 'Sign in to your Evolella account to track habits and achieve your goals.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
