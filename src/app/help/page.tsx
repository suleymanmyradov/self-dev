import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { HelpPage } from '@/components/help/help-page';

export const metadata: Metadata = {
  title: 'Help & guide — Self Dev AI',
  description:
    'Learn how to use Self Dev AI: check-ins, habits and goals, the AI coach, weekly reviews, voice mode, settings, billing, and more.',
};

const AUTH_COOKIE_NAME = 'auth-token';

export default async function HelpRoutePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  // Presence-only check — the proxy enforces real auth on protected routes.
  // We only use this to decide which "Back" link to show and whether to render
  // the signed-in hint. No user data is fetched.
  const authenticated = Boolean(token);

  return <HelpPage authenticated={authenticated} />;
}
