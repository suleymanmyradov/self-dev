"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useShallow } from "zustand/react/shallow";

type MenuEntry =
  | { type: "item"; label: string; href: string }
  | { type: "separator" };

const items: MenuEntry[] = [
  { type: "item", label: "Settings", href: "/me" },
  { type: "item", label: "Saved", href: "/library" },
  { type: "separator" },
  { type: "item", label: "Pricing", href: "/pricing" },
  { type: "separator" },
  { type: "item", label: "Help", href: "/help" },
  { type: "item", label: "Report a problem", href: "/report" },
  { type: "separator" },
  { type: "item", label: "Terms", href: "/terms" },
  { type: "item", label: "Privacy", href: "/privacy" },
  { type: "item", label: "Refunds", href: "/refunds" },
  { type: "item", label: "Contact support", href: "mailto:support@evolella.com" },
  { type: "separator" },
  { type: "item", label: "Log out", href: "/logout" },
];

// Logged-out variant — public routes only.
const publicItems: MenuEntry[] = [
  { type: "item", label: "Pricing", href: "/pricing" },
  { type: "item", label: "Library", href: "/library" },
  { type: "separator" },
  { type: "item", label: "Help", href: "/help" },
  { type: "separator" },
  { type: "item", label: "Terms", href: "/terms" },
  { type: "item", label: "Privacy", href: "/privacy" },
  { type: "item", label: "Refunds", href: "/refunds" },
  { type: "item", label: "Contact support", href: "mailto:support@evolella.com" },
  { type: "separator" },
  { type: "item", label: "Log in", href: "/login" },
  { type: "item", label: "Get started", href: "/register" },
];

export function MoreMenu() {
  const { user, hasHydrated } = useAuthStore(
    useShallow((s) => ({ user: s.user, hasHydrated: s.hasHydrated }))
  );
  const menuItems = hasHydrated && user ? items : publicItems;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground shadow-sm transition-[color,background-color,border-color,box-shadow] hover:border-border hover:bg-muted/50 hover:text-foreground"
          title="More"
        >
          <Menu className="h-[22px] w-[22px]" strokeWidth={1.7} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56 rounded-lg border-border/70 p-2 shadow-[0_20px_60px_-24px_rgb(0_0_0/35%)]">
        <DropdownMenuLabel className="px-2 pt-1 pb-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuItems.map((it, idx) =>
          it.type === "separator" ? (
            <DropdownMenuSeparator key={`sep-${idx}`} />
          ) : (
            <DropdownMenuItem key={it.label} asChild>
              <Link href={it.href} className="rounded-lg px-2 py-2">{it.label}</Link>
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
