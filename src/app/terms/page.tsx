import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — Evolella',
  description: 'The terms that apply when you use Evolella.',
};

export default function TermsPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="font-display-face text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: September 8, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold text-foreground">1. Acceptance</h2>
          <p>
            By creating an account or using Evolella (the &ldquo;Service&rdquo;) you agree to
            these Terms. If you do not agree, do not use the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold text-foreground">2. The Service</h2>
          <p>
            Evolella is a self-development platform providing habit and goal tracking, check-ins,
            and an AI-based accountability coach. The AI coach offers general guidance and
            motivation — it is <strong>not medical, psychological, or financial advice</strong>.
            Always consult a qualified professional for health or mental-health decisions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold text-foreground">3. Your account</h2>
          <p>
            You are responsible for keeping your credentials secure and for activity under your
            account. You must provide accurate information and be at least 16 years old (or the
            minimum digital-consent age in your country).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold text-foreground">4. Acceptable use</h2>
          <p>
            Do not misuse the Service: no unlawful content, no attempting to access other users&rsquo;
            data, no scraping or reselling the Service, no abusing the AI coach to generate
            harmful content, and no disrupting the infrastructure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold text-foreground">5. Subscriptions</h2>
          <p>
            Paid features are billed through Stripe. Subscriptions renew until cancelled; you can
            cancel at any time and keep access until the end of the paid period. Refunds are
            handled case by case — contact support.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold text-foreground">6. Your content</h2>
          <p>
            You keep ownership of the content you create. You grant us the limited right to
            process and store it to operate the Service (including sending relevant context to
            our AI provider to generate your coaching). We may remove content that violates
            these Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold text-foreground">7. Availability &amp; changes</h2>
          <p>
            We aim for high availability but the Service is provided &ldquo;as is&rdquo; without
            warranties. We may modify or discontinue features; material adverse changes will be
            communicated in advance where practical.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold text-foreground">8. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, we are not liable for indirect or
            consequential damages, and our total liability is limited to the amount you paid us
            in the 12 months before the claim.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold text-foreground">9. Termination</h2>
          <p>
            You can delete your account at any time. We may suspend accounts that violate these
            Terms. See our <Link className="underline" href="/privacy">Privacy Policy</Link> for
            what happens to your data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display-face text-xl font-semibold text-foreground">10. Contact</h2>
          <p>
            Questions: <a className="underline" href="mailto:support@evolella.com">support@evolella.com</a>.
          </p>
        </section>
      </div>
    </section>
  );
}
