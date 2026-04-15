"use client"

import { Bell, Search, Plus, Check, CheckCheck } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useState, useEffect, useRef, useTransition } from "react"
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/actions/misc"
import { formatRelativeTime } from "@/lib/utils"

export function Header() {
  const { data: session } = useSession()
  const canCreate = session?.user?.role === "ADMIN" || session?.user?.role === "PROJECT_MANAGER"

  const [notifications, setNotifications] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isPending, startTransition] = useTransition()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!session?.user?.id) return
    startTransition(async () => {
      const data = await getNotifications()
      setNotifications(data as any[])
    })
  }, [session?.user?.id])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function handleMarkRead(id: string) {
    await markNotificationRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <header className="app-header">
      <div className="search-wrapper flex-1 max-w-md">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search projects, clients..."
          className="input search-input"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        {canCreate && (
          <Link href="/projects/new" className="btn btn-primary btn-sm">
            <Plus size={16} /> New Project
          </Link>
        )}

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="btn btn-icon btn-ghost relative"
            onClick={() => setShowDropdown((v) => !v)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute", top: "4px", right: "4px",
                  width: "16px", height: "16px",
                  background: "var(--color-danger)",
                  borderRadius: "9999px",
                  border: "2px solid var(--color-bg-card)",
                  fontSize: "0.6rem", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div
              style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                width: "340px",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)",
                zIndex: 200,
                overflow: "hidden",
              }}
            >
              <div style={{
                padding: "0.875rem 1rem",
                borderBottom: "1px solid var(--color-border)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  Notifications {unreadCount > 0 && (
                    <span style={{
                      background: "var(--color-danger)", color: "#fff",
                      fontSize: "0.65rem", fontWeight: 700,
                      padding: "0.1em 0.45em", borderRadius: "9999px",
                      marginLeft: "0.35rem",
                    }}>{unreadCount}</span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      fontSize: "0.72rem", color: "var(--color-primary-light)",
                      background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "0.25rem",
                    }}
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: "380px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{
                    padding: "2.5rem 1rem", textAlign: "center",
                    fontSize: "0.82rem", color: "var(--color-text-muted)",
                  }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.read && handleMarkRead(n.id)}
                      style={{
                        padding: "0.75rem 1rem",
                        borderBottom: "1px solid var(--color-border)",
                        background: n.read ? "transparent" : "rgba(139,92,246,0.06)",
                        cursor: n.read ? "default" : "pointer",
                        display: "flex", gap: "0.625rem", alignItems: "flex-start",
                        transition: "background 120ms ease",
                      }}
                    >
                      {!n.read && (
                        <span style={{
                          width: "7px", height: "7px", borderRadius: "50%",
                          background: "var(--color-primary)", flexShrink: 0,
                          marginTop: "5px",
                        }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.1rem" }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                          {formatRelativeTime(n.createdAt)}
                        </div>
                      </div>
                      {n.read && (
                        <Check size={12} style={{ color: "var(--color-text-muted)", flexShrink: 0, marginTop: "3px" }} />
                      )}
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div style={{
                  padding: "0.625rem 1rem",
                  borderTop: "1px solid var(--color-border)",
                  textAlign: "center",
                }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    Showing last {notifications.length} notifications
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
