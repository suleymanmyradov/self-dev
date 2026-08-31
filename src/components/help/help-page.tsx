'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { helpSections } from './help-content';
import { HelpBlockRenderer } from './help-blocks';
import { cn } from '@/lib/utils';

export function HelpPage({ authenticated }: { authenticated: boolean }) {
  const [activeId, setActiveId] = useState<string>(helpSections[0]?.id ?? '');
  const [tocOpen, setTocOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const ids = helpSections.flatMap((s) => [
      s.id,
      ...s.subsections.map((sub) => sub.id),
    ]);
    if (ids.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the topmost intersecting section.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Trigger when a section's top crosses ~25% from the viewport top,
        // accounting for the sidebar offset on desktop.
        rootMargin: '-96px 0px -65% 0px',
        threshold: 0,
      },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, []);

  const handleTocClick = useCallback(() => setTocOpen(false), []);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 md:py-12">
      {/* Back link */}
      <Link
        href={authenticated ? '/' : '/login'}
        className="inline-flex items-center gap-1 text-sm font-medium text-success hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Header */}
      <header className="mt-6 max-w-3xl space-y-3">
        <h1 className="font-display text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
          Help &amp; guide
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Everything you can do in Self Dev AI — from your first check-in to
          voice coaching, weekly reviews, and tuning how your AI coach talks to
          you.
        </p>
        {authenticated && (
          <p className="text-xs text-muted-foreground">
            You&apos;re signed in — jump straight to any section below.
          </p>
        )}
      </header>

      {/* Mobile TOC toggle */}
      <div className="mt-6 md:hidden">
        <button
          type="button"
          onClick={() => setTocOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-border/70 bg-card px-4 py-3 text-sm font-medium text-foreground shadow-sm"
          aria-expanded={tocOpen}
        >
          On this page
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform',
              tocOpen && 'rotate-90',
            )}
          />
        </button>
        {tocOpen && (
          <TableOfContents
            activeId={activeId}
            onNavigate={handleTocClick}
            className="mt-2 rounded-lg border border-border/70 bg-card p-3"
          />
        )}
      </div>

      {/* Body: sticky TOC + content */}
      <div className="mt-8 flex gap-10">
        {/* Sticky TOC (desktop) */}
        <aside className="hidden w-56 shrink-0 md:block">
          <nav
            aria-label="On this page"
            className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pr-2"
          >
            <TableOfContents activeId={activeId} onNavigate={() => {}} />
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-14">
          {helpSections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <section.icon className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-display text-2xl font-normal tracking-tight text-foreground">
                  {section.title}
                </h2>
              </div>
              {section.intro && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {section.intro}
                </p>
              )}

              <div className="mt-6 space-y-8">
                {section.subsections.map((sub) => (
                  <div key={sub.id} id={sub.id} className="scroll-mt-24 space-y-3">
                    <h3 className="text-base font-semibold text-foreground">
                      {sub.title}
                    </h3>
                    <div className="space-y-3">
                      {sub.blocks.map((block, i) => (
                        <HelpBlockRenderer key={i} block={block} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Footer */}
          <footer className="border-t border-border/60 pt-6 text-sm text-muted-foreground">
            <p>
              Still stuck?{' '}
              <Link href="/report" className="text-success hover:underline">
                Report a problem
              </Link>{' '}
              or send feedback and we&apos;ll take a look.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function TableOfContents({
  activeId,
  onNavigate,
  className,
}: {
  activeId: string;
  onNavigate: () => void;
  className?: string;
}) {
  return (
    <ul className={cn('space-y-1 text-sm', className)}>
      {helpSections.map((section) => {
        const isActive = activeId === section.id;
        return (
          <li key={section.id}>
            <Link
              href={`#${section.id}`}
              onClick={onNavigate}
              className={cn(
                'block rounded-md px-2 py-1.5 transition-colors',
                isActive
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              {section.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
