import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started | Growth',
  description: 'Set up your AI accountability coach — define your goal, build your habit plan, and choose how you want to be held accountable.',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
