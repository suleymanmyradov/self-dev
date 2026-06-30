import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Check Your Email | Growth',
  description: 'Verify your email to activate your account.',
};

export default function CheckEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
