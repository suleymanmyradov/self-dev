'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  'group flex h-11 w-11 items-center justify-center rounded-lg border text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const activeStyles = 'border-border/70 bg-muted/80 text-foreground shadow-sm';

const idleStyles =
  'border-border/60 bg-card/80 text-muted-foreground hover:-translate-y-0.5 hover:border-border hover:bg-muted/70 hover:text-foreground hover:shadow-sm';

export function NavButton({
  href,
  label,
  icon: Icon,
  isActive,
  isCollapsed,
  onClick,
  className,
}: NavButtonProps) {
  const buttonContent = (
    <>
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="sr-only">{label}</span>
    </>
  );

  const buttonClassName = cn(
    baseStyles,
    isActive ? activeStyles : idleStyles,
    className
  );

  const inner = href ? (
    <Link href={href} className={buttonClassName} aria-label={label} onClick={onClick}>
      {buttonContent}
    </Link>
  ) : (
    <button className={buttonClassName} aria-label={label} onClick={onClick}>
      {buttonContent}
    </button>
  );

  if (!isCollapsed) {
    return inner;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{inner}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
