'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavButtonProps = {
  href?: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
  className?: string;
};

const baseStyles =
  'group flex w-14 flex-col items-center justify-center gap-1 rounded-lg py-2 text-xs transition-[color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const activeStyles = 'bg-muted/80 text-foreground';

const idleStyles =
  'text-muted-foreground hover:bg-muted/50 hover:text-foreground';

export function NavButton({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
  className,
}: NavButtonProps) {
  const buttonContent = (
    <>
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="text-[10px] font-medium">{label}</span>
    </>
  );

  const buttonClassName = cn(
    baseStyles,
    isActive ? activeStyles : idleStyles,
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={buttonClassName}
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
        onClick={onClick}
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      className={buttonClassName}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );
}
