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

const items: Array<
  | { type: "item"; label: string; href: string }
  | { type: "separator" }
> = [
  { type: "item", label: "Settings", href: "/settings" },
  { type: "item", label: "Saved", href: "/saved" },
  { type: "separator" },
  { type: "item", label: "Report a problem", href: "/report" },
  { type: "separator" },
  { type: "item", label: "Log out", href: "/logout" },
];

export function MoreMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors"
          title="More"
        >
          <Menu className="h-[22px] w-[22px]" strokeWidth={1.7} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuLabel>Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((it, idx) =>
          it.type === "separator" ? (
            <DropdownMenuSeparator key={`sep-${idx}`} />
          ) : (
            <DropdownMenuItem key={it.href} asChild>
              <Link href={it.href}>{it.label}</Link>
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
