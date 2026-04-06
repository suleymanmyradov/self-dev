import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 active:scale-[0.98] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/15",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/15 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-border/70 bg-background hover:border-border hover:bg-muted/50 hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/85",
        ghost:
          "hover:bg-muted/60 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        /* Psychology-informed variants */
        calm: "bg-[var(--calm)] text-[var(--calm-foreground)] shadow-sm hover:bg-[var(--calm)]/92 hover:shadow-lg hover:shadow-[var(--calm)]/15",
        growth: "bg-[var(--growth)] text-[var(--growth-foreground)] shadow-sm hover:bg-[var(--growth)]/92 hover:shadow-lg hover:shadow-[var(--growth)]/15",
        energy: "bg-[var(--energy)] text-[var(--energy-foreground)] shadow-sm hover:bg-[var(--energy)]/92 hover:shadow-lg hover:shadow-[var(--energy)]/15 hover:scale-[1.01]",
        success: "bg-[var(--success)] text-[var(--success-foreground)] shadow-sm hover:bg-[var(--success)]/92 hover:shadow-lg hover:shadow-[var(--success)]/15",
        "calm-outline": "border border-[var(--calm)]/30 text-[var(--calm)] bg-transparent hover:bg-[var(--calm-soft)]/55 hover:border-[var(--calm)]/45",
        "growth-outline": "border border-[var(--growth)]/30 text-[var(--growth)] bg-transparent hover:bg-[var(--growth-soft)]/55 hover:border-[var(--growth)]/45",
        "energy-outline": "border border-[var(--energy)]/30 text-[var(--energy)] bg-transparent hover:bg-[var(--energy-soft)]/55 hover:border-[var(--energy)]/45",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-full gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-11 rounded-full px-6 text-base has-[>svg]:px-4",
        xl: "h-12 rounded-full px-8 text-base has-[>svg]:px-5",
        icon: "size-10 rounded-full",
        "icon-sm": "size-8 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
