'use client';

import { useActionState, startTransition } from 'react';
import Link from 'next/link';
import { submitReportAction, type ReportActionState } from '@/lib/actions/report';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft } from 'lucide-react';
import type { ReportType } from '@/api';

const CATEGORIES: { value: ReportType; label: string }[] = [
  { value: 'bug', label: 'Bug' },
  { value: 'abuse', label: 'Abuse / Spam' },
  { value: 'feedback', label: 'Feedback' },
];

export default function ReportPage() {
  const [state, dispatch, isPending] = useActionState<ReportActionState, FormData>(
    submitReportAction,
    { success: false }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => {
      dispatch(new FormData(e.currentTarget));
    });
  };

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-10 md:py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-success text-sm font-medium hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="mt-6 space-y-1.5">
        <h1 className="font-display text-3xl font-normal tracking-tight text-foreground">
          Report a problem
        </h1>
        <p className="text-sm text-muted-foreground">
          Spotted a bug, abusive content, or have feedback? Let us know.
        </p>
      </div>

      {state.success ? (
        <div className="mt-8 rounded-xl border border-border bg-card p-6 text-center">
          <p className="font-display text-lg text-foreground">Thank you</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your report was submitted. We&apos;ll review it as soon as we can.
          </p>
          <Link href="/">
            <Button variant="outline" className="mt-4">Back to home</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {state.error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="type" className="text-sm font-medium">Category</Label>
            <Select name="type" defaultValue="bug">
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="title" className="text-sm font-medium">Subject</Label>
            <Input
              id="title"
              name="title"
              placeholder="Brief summary"
              disabled={isPending}
              required
              maxLength={200}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description" className="text-sm font-medium">Details</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What happened, what did you expect, and any links?"
              disabled={isPending}
              required
              maxLength={5000}
              rows={6}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Only if you want a reply"
              disabled={isPending}
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Submitting…' : 'Submit report'}
          </Button>
        </form>
      )}
    </div>
  );
}
