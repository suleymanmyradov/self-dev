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
          className="w-full flex items-center justify-center group-hover:justify-start gap-0 group-hover:gap-4 rounded-lg px-3 py-3 text-sm hover:bg-accent transition-all duration-200"
          title="More"
        >
          <Menu className="h-6 w-6 flex-shrink-0" strokeWidth={1.8} />
          <span className="font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-0 group-hover:w-auto overflow-hidden">More</span>
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
