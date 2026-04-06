import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | Growth',
  description: 'Create a Growth account to start tracking habits and achieving your goals.',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
