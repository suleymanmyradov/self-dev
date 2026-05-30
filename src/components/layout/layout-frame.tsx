"use client"

import * as React from "react"
import { SidebarNav } from "./sidebar-nav"
import { LeftNestedPanel } from "./left-nested-panel"
import { useUIStore } from "@/store/uiStore"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function LayoutFrame({ children }: { children: React.ReactNode }) {
  const isLeftPanelOpen = useUIStore(s => s.isLeftPanelOpen)
  const closeLeftPanel = useUIStore(s => s.closeLeftPanel)
  const pathname = usePathname()
  // Close any open left nested panel on route change
  React.useEffect(() => {
    closeLeftPanel()
  }, [pathname, closeLeftPanel])

  return (
    <div className="w-full flex-1 min-h-0 overflow-hidden">
      {/* Sidebar rail – always visible */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[var(--sidebar-width)] border-r border-border/40 bg-background lg:block">
        <SidebarNav />
      </aside>

      {/* Left nested panel – slides out beside the sidebar */}
      <LeftNestedPanel />

      {/* Scrim – click to close left panel */}
      {isLeftPanelOpen && (
        <div
          className="fixed inset-0 z-20 hidden bg-black/20 lg:block"
          style={{ left: `calc(var(--sidebar-width) + var(--left-panel-width))` }}
          onClick={closeLeftPanel}
        />
      )}

      {/* Main Content */}
      <main className={cn(
        "min-w-0 h-screen overflow-hidden overflow-x-hidden pt-14 pb-16 md:pt-0 md:pb-0 transition-[padding] duration-200 ease-out lg:pl-[var(--sidebar-width)] lg:pr-0",
      )}>
        {children}
      </main>
    </div>
  )
}

