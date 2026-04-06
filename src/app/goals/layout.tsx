import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Goals | Growth',
  description: 'Set goals, track progress, and achieve personal growth.',
};

export default function GoalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
