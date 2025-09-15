"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const items: Array<
  | { type: "item"; label: string; href: string }
  | { type: "separator" }
> = [
  { type: "item", label: "Settings", href: "/settings" },
  { type: "item", label: "Your activity", href: "/activity" },
  { type: "item", label: "Saved", href: "/saved" },
  { type: "separator" },
  { type: "item", label: "Switch appearance", href: "/appearance" },
  { type: "item", label: "Report", href: "/report" },
  { type: "separator" },
  { type: "item", label: "Logout", href: "/logout" },
];

export function MoreMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <MoreHorizontal className="mr-2 h-4 w-4" /> More
        </Button>
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
