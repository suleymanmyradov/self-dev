"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function SearchPage() {
  const [query, setQuery] = React.useState("")

  const accounts = React.useMemo(() => (
    [
      { id: "1", name: "shadcn", handle: "@shadcn" },
      { id: "2", name: "acme", handle: "@acme" },
      { id: "3", name: "growth", handle: "@growth" },
      { id: "4", name: "mindful", handle: "@mindful" },
      { id: "5", name: "coachai", handle: "@coachai" },
    ]
  ), [])

  const filtered = accounts.filter(a =>
    [a.name, a.handle].some(v => v.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="h-full w-full bg-background text-foreground">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-xl font-semibold mb-4">Search</h1>
        <div className="mb-6">
          <Input
            placeholder="Search accounts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">No accounts found.</div>
          )}
          {filtered.map((a) => (
            <Link
              key={a.id}
              href={`/profile/${a.id}`}
              className="flex items-center justify-between rounded-md p-3 hover:bg-accent"
            >
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.handle}</div>
              </div>
              <div className="text-xs text-muted-foreground">View</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
