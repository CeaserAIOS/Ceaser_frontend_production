"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { ShieldCheck } from "lucide-react"
import favicon from "@/public/favicon.png"
import darkWordmark from "@/public/ceaser-wordmark-dark-transparent.png"
import { useApp } from "@/lib/app-context"
import { navigationItems } from "@/lib/ceaser"
import { adminApi } from "@/lib/api/admin"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const { currentPage, setCurrentPage, setSelectedAgentId, sidebarCollapsed, setSidebarCollapsed } = useApp()
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const expandSidebar = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setSidebarCollapsed(false), 45)
  }

  const collapseSidebar = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setSidebarCollapsed(true), 90)
  }

  useEffect(() => () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
  }, [])

  useEffect(() => {
    let mounted = true
    adminApi.me()
      .then((result) => {
        if (mounted) setIsAdmin(Boolean(result.is_admin))
      })
      .catch(() => {
        if (mounted) setIsAdmin(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const visibleNavigation = isAdmin
    ? [...navigationItems, { id: "admin" as const, label: "Admin", icon: ShieldCheck }]
    : navigationItems
  const chatNavigation = currentPage === "chat"

  return (
    <aside 
      onMouseEnter={expandSidebar}
      onMouseLeave={collapseSidebar}
      className={cn(
        "spatial-panel flex h-[calc(100vh-1rem)] transform-gpu flex-col rounded-lg will-change-[width] transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        chatNavigation ? "w-24" : sidebarCollapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <button
        type="button"
        onClick={() => setCurrentPage("chat")}
        className="flex h-20 w-full items-center justify-center border-b border-border px-4 py-3 transition-[padding,background-color] duration-200 hover:bg-white/[0.035]"
        aria-label="Open a new CEASER chat"
      >
        {sidebarCollapsed || chatNavigation ? (
          <Image
            src={favicon}
            alt="CEASER"
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl object-contain"
            priority
          />
        ) : (
          <Image
            src={darkWordmark}
            alt="CEASER"
            width={178}
            height={46}
            className="h-10 w-full max-w-[178px] object-contain"
            priority
          />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {visibleNavigation.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-[background-color,color,padding] duration-150",
                  isActive 
                    ? "spatial-active-glow bg-primary/15 text-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  (sidebarCollapsed || chatNavigation) && "flex-col justify-center gap-1 px-0 py-3 text-[11px]"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {(!sidebarCollapsed || chatNavigation) && <span>{item.label}</span>}
              </button>
            )
          })}
        </div>

      </nav>

    </aside>
  )
}


