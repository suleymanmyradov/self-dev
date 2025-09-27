"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { mockConversations } from "@/lib/mock-data"
import { useUI } from "@/store/uiStore"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function LeftNestedPanel() {
  const { isLeftPanelOpen, leftPanelType, closeLeftPanel, isSidebarCollapsed } = useUI()
  const [shouldRender, setShouldRender] = React.useState(false)
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    if (isLeftPanelOpen) {
      setShouldRender(true)
      // next tick to allow CSS transition
      const id = requestAnimationFrame(() => setShow(true))
      return () => cancelAnimationFrame(id)
    } else {
      // start exit animation
      setShow(false)
      const t = setTimeout(() => setShouldRender(false), 180)
      return () => clearTimeout(t)
    }
  }, [isLeftPanelOpen])

  if (!shouldRender) return null

  return (
    <aside
      className={cn(
        "fixed top-0 z-30 hidden h-screen w-80 border-r bg-background lg:block",
        "transition-all duration-200 ease-out",
        show ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
      )}
      style={{ left: isSidebarCollapsed ? '4rem' : '14rem' }}
    >
      <div className="flex h-full w-full flex-col">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold capitalize">
              {leftPanelType ?? ""}
            </h3>
            <button
              onClick={closeLeftPanel}
              className="text-xs text-muted-foreground hover:underline"
            >
              Close
            </button>
          </div>
          {leftPanelType === "search" && (
            <div className="mt-3">
              <Input placeholder="Search accounts..." />
            </div>
          )}
        </div>

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
