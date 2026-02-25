"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { mockConversations } from "@/lib/mock-data"
import { useUI } from "@/store/uiStore"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export function LeftNestedPanel() {
  const { isLeftPanelOpen, leftPanelType, closeLeftPanel } = useUI()
  const [shouldRender, setShouldRender] = React.useState(false)
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    if (isLeftPanelOpen) {
      setShouldRender(true)
      const id = requestAnimationFrame(() => setShow(true))
      return () => cancelAnimationFrame(id)
    } else {
      setShow(false)
      const t = setTimeout(() => setShouldRender(false), 200)
      return () => clearTimeout(t)
    }
  }, [isLeftPanelOpen])

  if (!shouldRender) return null

  return (
    <aside
      className={cn(
        "fixed top-0 z-30 hidden h-screen w-[280px] border-r border-border/40 bg-background shadow-lg lg:block",
        "transition-transform duration-200 ease-out",
        show ? "translate-x-0" : "-translate-x-full"
      )}
      style={{ left: 72 }}
    >
      <div className="flex h-full w-full flex-col">
        {/* Header */}
        <div className="flex h-[72px] items-center justify-between px-4 shrink-0 border-b border-border/40">
          <h3 className="text-sm font-semibold capitalize tracking-wide">
            {leftPanelType ?? ""}
          </h3>
          <button
            onClick={closeLeftPanel}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search input */}
        {leftPanelType === "search" && (
          <div className="px-4 py-3 shrink-0">
            <Input placeholder="Search accounts..." className="h-9" />
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-2">
          {leftPanelType === "messages" && <MessagesList />}
          {leftPanelType === "notifications" && <NotificationsList />}
          {leftPanelType === "search" && <SearchList />}
        </div>
      </div>
    </aside>
  )
}

function MessagesList() {
  const conversations = mockConversations.filter((c) => c.type === "therapist")
  if (!conversations.length) {
    return <div className="p-4 text-sm text-muted-foreground">No conversations yet.</div>
  }
  return (
    <div className="space-y-1">
      {conversations.map((c) => (
        <Link
          key={c.id}
          href={`/ai-therapist/${c.id}`}
          className="block rounded-md p-3 text-sm hover:bg-accent"
        >
          <div className="font-medium">{c.title}</div>
          <div className="line-clamp-2 text-xs text-muted-foreground">{c.lastMessage}</div>
        </Link>
      ))}
    </div>
  )
}

function NotificationsList() {
  const items = Array.from({ length: 10 }).map((_, i) => ({
    id: i,
    text: `You have a new notification #${i + 1}`,
  }))
  return (
    <div className="space-y-1">
      {items.map((n) => (
        <div key={n.id} className="rounded-md p-3 text-sm hover:bg-accent">
          {n.text}
        </div>
      ))}
    </div>
  )
}

function SearchList() {
  const accounts = [
    { id: "1", name: "shadcn", handle: "@shadcn" },
    { id: "2", name: "acme", handle: "@acme" },
    { id: "3", name: "growth", handle: "@growth" },
  ]
  return (
    <div className="space-y-1">
      {accounts.map((a) => (
        <div key={a.id} className="rounded-md p-3 text-sm hover:bg-accent">
          <div className="font-medium">{a.name}</div>
          <div className="text-xs text-muted-foreground">{a.handle}</div>
        </div>
      ))}
    </div>
  )
}
