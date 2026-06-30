import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Email | Growth',
  description: 'Confirm your email address to activate your account.',
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
