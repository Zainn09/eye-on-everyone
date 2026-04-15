"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, KanbanSquare, PieChart, Users, Settings, LogOut } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { getInitials, generateAvatarColor } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const user = session?.user

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Board", href: "/board", icon: KanbanSquare },
    { name: "Analytics", href: "/analytics", icon: PieChart },
  ]

  if (user?.role === "ADMIN") {
    navigation.push({ name: "Team", href: "/admin", icon: Users })
  }

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <h1>Eye-On Everyone</h1>
        <span>Project Manager</span>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Main Menu</div>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <div className="dropdown w-full">
            <button className="sidebar-user w-full border-none text-left" onClick={() => document.getElementById('user-menu')?.classList.toggle('hidden')}>
              <div 
                className="avatar avatar-sm" 
                style={{ backgroundColor: generateAvatarColor(user.name) }}
              >
                {getInitials(user.name)}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.name}</div>
                <div className="sidebar-user-role">{user.role.replace("_", " ")}</div>
              </div>
            </button>
            
            <div id="user-menu" className="dropdown-menu hidden" style={{ bottom: "100%", top: "auto", marginBottom: "8px" }}>
              <div className="p-4 border-b border-[var(--color-border)] mb-2">
                <div className="font-medium text-sm">{user.name}</div>
                <div className="text-xs text-muted truncate">{user.email}</div>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="dropdown-item danger"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
