"use client"

import * as React from "react"
import { SidebarNav } from "./sidebar-nav"
import { RightSidebar } from "./right-sidebar"
import { LeftNestedPanel } from "./left-nested-panel"
import { useUI } from "@/store/uiStore"
import { usePathname } from "next/navigation"

export function LayoutFrame({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useUI()
  const { closeLeftPanel } = useUI()
  const pathname = usePathname()
  const isHome = pathname === "/"

  const leftWidth = isSidebarCollapsed ? 'w-16' : 'w-56'
  const leftPadding = isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-56'

  // Close any open left nested panel on route change to avoid lingering therapist/search panels
  React.useEffect(() => {
    closeLeftPanel()
  }, [pathname, closeLeftPanel])

  return (
    <div className="w-full flex-1 min-h-0 overflow-hidden">
      {/* Fixed Left Sidebar with dynamic width */}
      <aside className={`fixed left-0 top-0 z-30 hidden h-screen ${leftWidth} lg:block transition-[width] duration-200 ease-out`}>
        <SidebarNav />
      </aside>

      {/* Nested left panel (search/notifications/messages) */}
      <LeftNestedPanel />

      {/* Fixed Right Sidebar (home page only) */}
      {isHome && (
        <aside className="fixed right-0 top-0 z-30 hidden h-screen w-80 lg:block">
          <RightSidebar />
        </aside>
      )}

      {/* Main Content with dynamic left padding and conditional right padding on home */}
      <main className={`min-w-0 h-screen overflow-hidden overflow-x-hidden pt-14 pb-16 md:pt-0 md:pb-0 ${leftPadding} ${isHome ? 'lg:pr-80' : 'lg:pr-0'} transition-[padding] duration-200 ease-out`}>
        {children}
      </main>
    </div>
  )
}

