"use client"

import * as React from "react"
import { SidebarNav } from "./sidebar-nav"
import { LeftNestedPanel } from "./left-nested-panel"
import { useUIStore } from "@/store/uiStore"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

function RouteChangeListener() {
  const pathname = usePathname()
  const closeLeftPanel = useUIStore(s => s.closeLeftPanel)
  React.useEffect(() => {
    closeLeftPanel()
  }, [pathname, closeLeftPanel])
  return null
}

export function LayoutFrame({ children }: { children: React.ReactNode }) {
  const isLeftPanelOpen = useUIStore(s => s.isLeftPanelOpen)
  const closeLeftPanel = useUIStore(s => s.closeLeftPanel)

  return (
    <div className="w-full flex-1 min-h-0 overflow-hidden">
      <RouteChangeListener />

      {/* Sidebar rail – always visible */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[var(--sidebar-width)] border-r border-border/40 bg-background md:block">
        <SidebarNav />
      </aside>

      {/* Left nested panel – slides out beside the sidebar */}
      <LeftNestedPanel />

      {/* Scrim – click to close left panel (desktop only) */}
      {isLeftPanelOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close panel"
          className="fixed inset-0 z-20 hidden bg-black/20 md:block cursor-pointer"
          style={{ left: `calc(var(--sidebar-width) + var(--left-panel-width))` }}
          onClick={closeLeftPanel}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter') closeLeftPanel();
          }}
        />
      )}

      {/* Main Content */}
      <main className={cn(
        "min-w-0 h-screen overflow-hidden overflow-x-hidden pt-14 pb-16 md:pt-0 md:pb-0 transition-[padding] duration-200 ease-out md:pl-[var(--sidebar-width)] md:pr-0",
      )}>
        {children}
      </main>
    </div>
  )
}

