"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { useUI } from "@/store/uiStore"
import { useNotifications, useConversations, useMarkAllNotificationsRead } from "@/hooks"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { X, MessageSquare, Bell, CheckCheck } from "lucide-react"

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

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-2">
          {leftPanelType === "messages" && <MessagesList />}
          {leftPanelType === "notifications" && <NotificationsList />}
        </div>
      </div>
    </aside>
  )
}

function MessagesList() {
  const { data: conversations = [], isLoading } = useConversations({ page: 1, limit: 20 })

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Loading conversations...
      </div>
    )
  }

  if (!conversations?.length) {
    return (
      <div className="p-4 text-sm text-muted-foreground flex flex-col items-center gap-3">
        <MessageSquare className="h-8 w-8 opacity-50" />
        <p>No conversations yet.</p>
        <p className="text-xs">Start a conversation with your AI accountability coach.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {conversations.map((c) => (
        <Link
          key={c.id}
          href={`/ai-coach/${c.id}`}
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
  const { data: notifications = [], isLoading } = useNotifications({ page: 1, limit: 20 })
  const markAllRead = useMarkAllNotificationsRead()

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Loading notifications...
      </div>
    )
  }

  if (!notifications?.length) {
    return (
      <div className="p-4 text-sm text-muted-foreground flex flex-col items-center gap-3">
        <Bell className="h-8 w-8 opacity-50" />
        <p>No notifications yet.</p>
        <p className="text-xs">We'll notify you of important updates.</p>
      </div>
    )
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        </div>
      )}
      <div className="space-y-1">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              "rounded-md p-3 text-sm hover:bg-accent",
              !n.read && "bg-accent/50"
            )}
          >
            <div className="font-medium">{n.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{n.message}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(n.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
