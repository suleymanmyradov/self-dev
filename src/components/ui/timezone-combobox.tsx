"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Globe } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Searchable timezone picker.
 *
 * Uses the browser's Intl.supportedValuesOf("timeZone") for the IANA list and
 * Intl.DateTimeFormat to compute each zone's current UTC offset, so the labels
 * read like "Ashgabat (UTC+05:00)" instead of raw "Asia/Ashgabat". Searching
 * matches against the raw IANA id, the derived city name, and a few common
 * aliases (e.g. "turkmenistan", "est", "pst") so users can find their zone
 * without knowing the IANA name.
 *
 * The value stored/returned is the canonical IANA id (e.g. "Asia/Ashgabat"),
 * which is what the backend persists in settings.timezone.
 */
export interface TimezoneOption {
  id: string; // IANA id, e.g. "Asia/Ashgabat"
  label: string; // "Ashgabat (UTC+05:00)"
  city: string; // "Ashgabat"
  region: string; // "Asia"
  offset: string; // "+05:00"
  search: string; // lowercased match target
}

// Country/region aliases → IANA id prefixes. Lets users type "turkmenistan",
// "uae", "uk", etc. and still find their zone even though the IANA id is a
// city name. Extend freely — kept intentionally short.
const ALIASES: Record<string, string[]> = {
  turkmenistan: ["Asia/Ashgabat"],
  uae: ["Asia/Dubai"],
  uk: ["Europe/London"],
  england: ["Europe/London"],
  america: ["America/"],
  us: ["America/"],
  usa: ["America/"],
  europe: ["Europe/"],
  asia: ["Asia/"],
  africa: ["Africa/"],
  pacific: ["Pacific/"],
  australia: ["Australia/"],
};

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60)
    .toString()
    .padStart(2, "0");
  const m = (abs % 60).toString().padStart(2, "0");
  return `${sign}${h}:${m}`;
}

function buildOptions(): TimezoneOption[] {
  const ids = Intl.supportedValuesOf("timeZone");
  // Use a fixed reference date so offsets are stable across a render pass.
  const now = new Date();
  return ids.map((id) => {
    // Derive the UTC offset for this zone at `now`.
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: id,
      timeZoneName: "longOffset",
    }).formatToParts(now);
    const longOffset =
      parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
    // longOffset looks like "GMT+05:00" or "GMT-08:00". Strip "GMT".
    const offset = longOffset.replace(/^GMT/, "").trim() || "+00:00";

    const city = id.split("/").pop()?.replace(/_/g, " ") ?? id;
    const region = id.split("/")[0] ?? "";
    const label = `${city} (UTC${offset})`;
    const search = `${id} ${city} ${region} ${label}`.toLowerCase();
    return { id, label, city, region, offset, search };
  });
}

let cachedOptions: TimezoneOption[] | null = null;
function getOptions(): TimezoneOption[] {
  if (!cachedOptions) cachedOptions = buildOptions();
  return cachedOptions;
}

export interface TimezoneComboboxProps {
  value: string | undefined;
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TimezoneCombobox({
  value,
  onChange,
  placeholder = "Search timezone…",
  disabled,
  className,
}: TimezoneComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const options = useMemo(getOptions, []);

  const selected = useMemo(
    () => options.find((o) => o.id === value) ?? null,
    [options, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    // Alias expansion: if the query matches a known alias, include all zones
    // matching that alias's prefixes in addition to the substring matches.
    const aliasPrefixes = ALIASES[q]?.filter((p) => p.endsWith("/"));
    const aliasIds = ALIASES[q]?.filter((p) => !p.endsWith("/")) ?? [];
    return options.filter((o) => {
      if (aliasIds.includes(o.id)) return true;
      if (aliasPrefixes?.some((p) => o.id.startsWith(p))) return true;
      return o.search.includes(q);
    });
  }, [options, query]);

  const runFilter = (raw: string) => setQuery(raw);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className={cn("flex items-center gap-2 truncate", !selected && "text-muted-foreground")}>
            <Globe className="size-4 opacity-50 shrink-0" />
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="size-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[20rem] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search city or region…"
            value={query}
            onValueChange={runFilter}
          />
          <CommandList>
            {filtered.length === 0 ? (
              <CommandEmpty>No timezone found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filtered.map((o) => (
                  <CommandItem
                    key={o.id}
                    value={o.id}
                    onSelect={() => {
                      onChange(o.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="gap-2"
                  >
                    <Check
                      className={cn(
                        "size-4 shrink-0",
                        value === o.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="flex-1 truncate">{o.label}</span>
                    <span className="text-xs text-muted-foreground font-mono shrink-0">
                      {o.region}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
