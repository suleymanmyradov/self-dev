"use client"

import * as React from "react"
import { SidebarNav } from "./sidebar-nav"
import { RightSidebar } from "./right-sidebar"
import { LeftNestedPanel } from "./left-nested-panel"
import { useUI } from "@/store/uiStore"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function LayoutFrame({ children }: { children: React.ReactNode }) {
  const { isLeftPanelOpen, closeLeftPanel } = useUI()
  const pathname = usePathname()
  const isHome = pathname === "/"

  // Close any open left nested panel on route change
  React.useEffect(() => {
    closeLeftPanel()
  }, [pathname, closeLeftPanel])

  return (
    <div className="w-full flex-1 min-h-0 overflow-hidden">
      {/* Main Sidebar - hidden when left panel is open */}
      {!isLeftPanelOpen && (
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[72px] lg:block group hover:w-[250px] transition-[width] duration-200 ease-out bg-background">
          <SidebarNav />
        </aside>
      )}

      {/* Left Panel - full width panel that replaces sidebar */}
      {isLeftPanelOpen && <LeftNestedPanel />}

      {/* Fixed Right Sidebar (home page only) */}
      {isHome && (
        <aside className="fixed right-0 top-0 z-30 hidden h-screen w-80 lg:block">
          <RightSidebar />
        </aside>
      )}

      {/* Main Content - padding adjusts based on what's open */}
      <main className={cn(
        "min-w-0 h-screen overflow-hidden overflow-x-hidden pt-14 pb-16 md:pt-0 md:pb-0 transition-[padding] duration-200 ease-out",
        isLeftPanelOpen ? 'pl-[250px]' : 'pl-[72px]',
        isHome ? 'lg:pr-80' : 'lg:pr-0'
      )}>
        {children}
      </main>
    </div>
  )
}

