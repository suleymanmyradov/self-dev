import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
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

          <LoginForm />
        </div>
      </div>

      {/* Quote panel */}
      <div className="hidden md:flex w-[230px] shrink-0 border-l border-border bg-background flex-col justify-center p-8">
        <div className="space-y-6">
          <p className="font-display text-lg leading-relaxed">
            &ldquo;The best time to plant a tree was 20 years ago. The second best time is now.&rdquo;
          </p>
          <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            From the library
          </p>
        </div>
      </div>
    </div>
  );
}
