import { RegisterForm } from '@/components/register-form';
import { Check } from 'lucide-react';

const BENEFITS = [
  'One habit at a time — no overwhelm',
  'A coach that remembers your patterns',
  'Daily check-ins that take 30 seconds',
];

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh">
      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-card p-6 md:p-10">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-foreground text-background">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v18H3z" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
          </div>

          <RegisterForm />
        </div>
      </div>

      {/* Benefits panel */}
      <div className="hidden md:flex w-[230px] shrink-0 border-l border-border bg-background flex-col justify-center p-8">
        <div className="space-y-5">
          <p className="font-display text-lg leading-relaxed">
            Small habits, built daily.
          </p>
          <ul className="space-y-4">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5">
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15">
                  <Check className="size-3 text-success" />
                </div>
                <span className="text-sm text-muted-foreground leading-relaxed">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
