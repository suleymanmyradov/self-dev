'use client';

import { cn } from '@/lib/utils';
import { Check, Pencil } from 'lucide-react';

interface SplitCheckInControlProps {
  /** Whether the habit is already checked in today. */
  checked: boolean;
  /** Fired when the user clicks the fast check-in half (left). */
  onCheckIn: () => void;
  /** Fired when the user clicks the detailed half (right). */
  onLogDetails: () => void;
  /** Disable both halves (e.g. while a mutation is pending). */
  disabled?: boolean;
  /** Hide the detailed half when there is no log path for this surface. */
  hideDetails?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * Two-target check-in control: left half is a one-tap fast check-in (or undo),
 * right half opens the detailed check-in modal (mood / energy / blocker / note).
 *
 * Renders as a single capsule so it reads as one control with two actions,
 * keeping both paths visible at the row level without menu digging.
 */
export function SplitCheckInControl({
  checked,
  onCheckIn,
  onLogDetails,
  disabled = false,
  hideDetails = false,
  className,
  'aria-label': ariaLabel = 'Check in',
}: SplitCheckInControlProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-stretch overflow-hidden rounded-full border-2 transition-[border-color] ease-out',
        checked
          ? 'border-success'
          : 'border-muted-foreground/30',
        disabled && 'opacity-60',
        className,
      )}
    >
      {/* Fast check-in half */}
      <button
        type="button"
        onClick={onCheckIn}
        disabled={disabled}
        aria-label={checked ? `Undo ${ariaLabel}` : ariaLabel}
        aria-pressed={checked}
        className={cn(
          'flex items-center justify-center transition-[background-color,transform] duration-200 ease-out',
          'hover:bg-success/5 active:scale-[0.96] disabled:cursor-not-allowed disabled:active:scale-100',
          checked && 'bg-success text-success-foreground hover:bg-success',
        )}
        style={{ width: 28, height: 28 }}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
      </button>

      {/* Detailed half — opens the check-in modal */}
      {!hideDetails && (
        <>
          <div className={cn('w-px self-stretch', checked ? 'bg-success/40' : 'bg-muted-foreground/20')} />
          <button
            type="button"
            onClick={onLogDetails}
            disabled={disabled}
            aria-label={`Log details for ${ariaLabel}`}
            className={cn(
              'flex items-center justify-center transition-[background-color,transform] duration-200 ease-out',
              'text-muted-foreground hover:text-foreground hover:bg-accent active:scale-[0.96] disabled:cursor-not-allowed disabled:active:scale-100',
              checked && 'text-success-foreground/80 hover:text-success-foreground',
            )}
            style={{ width: 22, height: 28 }}
          >
            <Pencil className="h-3 w-3" strokeWidth={2.25} />
          </button>
        </>
      )}
    </div>
  );
}
