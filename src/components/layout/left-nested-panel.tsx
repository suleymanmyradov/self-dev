"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { useUI } from "@/store/uiStore"
import { useNotifications, useConversations, useMarkAllNotificationsRead } from "@/hooks"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { X, MessageSquare, Bell, CheckCheck, Target, CalendarCheck, Trophy, AlertCircle, Sparkles, Info } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { NotificationType } from "@/api"

const typeIcon: Record<NotificationType, LucideIcon> = {
  habit_reminder: Target,
  goal_deadline: CalendarCheck,
  achievement: Trophy,
  system: Info,
  missed_check_in: AlertCircle,
  weekly_review: CalendarCheck,
  encouragement: Sparkles,
  ai_feedback: Sparkles,
}

export function LeftNestedPanel() {
  const { isLeftPanelOpen, leftPanelType, closeLeftPanel } = useUI()
  const [shouldRender, setShouldRender] = React.useState(false)
  const [show, setShow] = React.useState(false)
  const animationFrameId = React.useRef<number>()
  const timeoutId = React.useRef<NodeJS.Timeout>()

  React.useEffect(() => {
    if (isLeftPanelOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true)
      animationFrameId.current = requestAnimationFrame(() => {
        setShow(true)
      })
      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current)
        }
      }
    } else {
      setShow(false)
      timeoutId.current = setTimeout(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShouldRender(false)
      }, 200)
      return () => {
        if (timeoutId.current) {
          clearTimeout(timeoutId.current)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function NotificationsList() {
  const { data: notifications = [], isLoading } = useNotifications({ page: 1, limit: 20 })
  const markAllRead = useMarkAllNotificationsRead()
  const { closeLeftPanel } = useUI()

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
        <p className="text-xs">We&apos;ll notify you of important updates.</p>
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
        {notifications.map((n) => {
          const Icon = typeIcon[n.type] ?? Bell
          const content = (
            <>
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                <div className="text-xs text-muted-foreground/60 mt-1">
                  {relativeTime(n.createdAt)}
                </div>
              </div>
            </>
          )

          if (n.type === 'weekly_review') {
            return (
              <Link
                key={n.id}
                href="/weekly-review"
                onClick={closeLeftPanel}
                className={cn(
                  "flex gap-3 rounded-md p-3 text-sm hover:bg-accent",
                  !n.read && "bg-accent/50"
                )}
              >
                {content}
              </Link>
            )
          }

          return (
            <div
              key={n.id}
              className={cn(
                "flex gap-3 rounded-md p-3 text-sm hover:bg-accent",
                !n.read && "bg-accent/50"
              )}
            >
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
