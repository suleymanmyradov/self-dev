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

export function MoreMenu({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {collapsed ? (
          <Button variant="ghost" size="icon" className="w-full justify-center" title="More">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <MoreHorizontal className="mr-2 h-4 w-4" /> More
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={collapsed ? "right" : "top"} align={collapsed ? "end" : "start"} className="w-56">
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
