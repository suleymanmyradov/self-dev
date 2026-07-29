'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CheckInControlProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function CheckInControl({
  checked,
  onToggle,
  size = 28,
  className,
  disabled = false,
  'aria-label': ariaLabel = 'Check in',
}: CheckInControlProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={checked}
      style={{ width: size, height: size, transitionDuration: '220ms' }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border-2 transition-[background-color,border-color,transform] ease-out disabled:cursor-not-allowed disabled:opacity-60',
        checked
          ? 'border-success bg-success text-success-foreground scale-100'
          : 'border-muted-foreground/30 bg-transparent hover:border-success hover:bg-success/5 active:scale-[0.94]',
        className,
      )}
    >
      {checked && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
    </button>
  );
}
