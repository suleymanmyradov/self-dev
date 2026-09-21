import type { Metadata } from 'next';
import Link from 'next/link';
import { CookieSettingsButton } from '@/components/shared/cookie-settings-button';

export const metadata: Metadata = {
  title: 'Privacy Policy — Evolella',
  description:
    'How Evolella collects, uses, stores, and protects your personal data, and the rights you have over it.',
};

const UPDATED = 'September 8, 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display-face text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back
      </Link>
      <h1 className="font-display-face mt-4 text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: September 8, 2026</p>

      <div className="mt-8 space-y-8">
        <section className="space-y-3">
          <p className="text-foreground">
            Evolella (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates a self-development platform
            including an AI accountability coach. This policy explains what personal data we
            collect, why, and the choices you have.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold">Data we collect</h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              <strong>Account data.</strong> When you register we store your email address, name,
              and a hashed password. If you sign in with Google, we receive your Google account
              name, email address, and profile picture.
            </p>
            <p>
              <strong>Content you create.</strong> Habits, goals, check-ins, weekly reviews,
              saved articles, settings, and everything you write to your AI coach — including
              conversation transcripts and personal facts you share with it.
            </p>
            <p>
              <strong>Voice input.</strong> If you use voice mode, your audio is transcribed to
              text to answer you. Transcripts are stored with your conversations.
            </p>
            <p>
              <strong>Files.</strong> Images you upload (e.g. avatars, article media) are stored
              in object storage.
            </p>
            <p>
              <strong>Usage data.</strong> Basic service logs (requests, errors, performance).
              Product analytics are off by default and only run if you opt in.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold">How we use your data</h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>We use your data to provide the service: your account, your plans, and your AI
            coaching. Your coaching context (goals, habits, memories, conversation history) is
            used to personalize responses.</p>
            <p>
              We do not sell your data, and we do not use your personal conversations to train
              AI models.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold">AI processing</h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              To generate coaching, relevant parts of your conversations and profile are sent to
              our AI provider (Google Gemini) and voice audio is transcribed by it. That provider
              processes this content on our behalf to produce your coaching responses. Avoid
              sharing information in coaching conversations that you would not want processed by
              an AI service.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold">Service providers</h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              We run on Amazon Web Services (US region) and rely on: Google (OAuth sign-in and AI
              processing), Resend (transactional email such as verification and password reset),
              and Stripe (payments — card data goes directly to Stripe, we never store card
              numbers).
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold">Your rights</h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              <strong>Export.</strong> You can download your data (habits, goals, check-ins,
              conversations, saved articles, settings) at any time from your profile.
            </p>
            <p>
              <strong>Deletion.</strong> Deleting your account removes your data across our
              services, including your AI conversation history and personal memory.
            </p>
            <p>
              To exercise any right or ask a question about your data, contact{' '}
              <a className="underline" href="mailto:support@evolella.com">
                support@evolella.com
              </a>
              .
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold">Cookies &amp; analytics</h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              We use strictly necessary storage to keep you signed in and remember your
              preferences. Product analytics are off by default and only run if you opt in
              from the consent banner or your settings — you can withdraw that consent at
              any time, which stops future analytics collection on this device.
            </p>
            <p>
              Change your choice here: <CookieSettingsButton />
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold">Security &amp; retention</h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              Data is stored in a private cloud environment with encrypted transport (TLS),
              hashed passwords, and access controls. We keep your data while your account is
              active; deleting your account deletes your personal data as described above.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold">Changes</h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              If we make material changes to this policy we will notify you in the app or by
              email before they take effect.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold">Contact</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Questions or requests: <a className="underline" href="mailto:support@evolella.com">support@evolella.com</a>.
            See also our <Link className="underline" href="/terms">Terms of Service</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
