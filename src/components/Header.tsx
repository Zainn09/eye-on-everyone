"use client"

import { Bell, Search, Plus } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

export function Header() {
  const { data: session } = useSession()
  const canCreate = session?.user?.role === "ADMIN" || session?.user?.role === "PROJECT_MANAGER"

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
        
        <button className="btn btn-icon btn-ghost relative">
          <Bell size={20} />
          {/* Notification badge mock */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-danger)] rounded-full border border-[var(--color-bg-card)]"></span>
        </button>
      </div>
    </header>
  )
}
