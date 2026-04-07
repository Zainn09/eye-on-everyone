"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  FolderKanban, Clock, CheckCircle2, AlertTriangle,
  Calendar, FileText, MessageSquare, ArrowRight,
  Search, Filter, GitBranch
} from "lucide-react"
import { Badge } from "@/components/ui"
import {
  formatRelativeTime, getDaysUntilDeadline,
  calculateProjectProgress, getPhaseLabel, getPhaseColor
} from "@/lib/utils"

interface DashboardClientProps {
  projects: any[]
  activities: any[]
  stats: {
    totalProjects: number
    inProgress: number
    completed: number
    overdue: number
  }
  userName: string
}

export function DashboardClient({ projects, activities, stats, userName }: DashboardClientProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [phaseFilter, setPhaseFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.clientName.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || p.status === statusFilter
      const matchPhase = !phaseFilter || p.currentPhase === phaseFilter
      const matchPriority = !priorityFilter || p.priority === priorityFilter
      return matchSearch && matchStatus && matchPhase && matchPriority
    })
  }, [projects, search, statusFilter, phaseFilter, priorityFilter])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const getPriorityVariant = (p: string) => {
    switch (p) {
      case "URGENT": return "danger"
      case "HIGH": return "warning"
      case "MEDIUM": return "info"
      default: return "muted"
    }
  }

  const getStatusVariant = (s: string) => {
    switch (s) {
      case "COMPLETED": return "success"
      case "IN_PROGRESS": return "info"
      case "BLOCKED": return "danger"
      case "ON_HOLD": return "warning"
      default: return "muted"
    }
  }

  const getActivityIcon = (action: string) => {
    if (action.includes("created")) return "🚀"
    if (action.includes("phase")) return "🔄"
    if (action.includes("comment")) return "💬"
    if (action.includes("design")) return "🎨"
    if (action.includes("dev")) return "⚡"
    if (action.includes("qa")) return "✅"
    if (action.includes("revision")) return "📝"
    if (action.includes("assigned")) return "👤"
    return "📌"
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1>{getGreeting()}, {userName.split(" ")[0]}</h1>
          <p>Here&apos;s what&apos;s happening across your projects</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
            <FolderKanban size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.totalProjects}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.overdue}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar mb-4">
        <div className="search-wrapper flex-1" style={{ maxWidth: "320px" }}>
          <Search className="search-icon" size={16} />
          <input
            type="text"
            className="input search-input"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="BLOCKED">Blocked</option>
          <option value="ON_HOLD">On Hold</option>
        </select>

        <select
          className="select filter-select"
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
        >
          <option value="">All Phases</option>
          <option value="DESIGN">Design</option>
          <option value="DESIGN_QA">Design QA</option>
          <option value="DESIGN_APPROVAL">Approval</option>
          <option value="DEVELOPMENT">Development</option>
          <option value="DEV_QA">Dev QA</option>
          <option value="CLIENT_PREVIEW">Client Preview</option>
          <option value="DELIVERED">Delivered</option>
        </select>

        <select
          className="select filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priority</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Main Content */}
      <div className="flex gap-6" style={{ alignItems: "flex-start" }}>
        {/* Projects Grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <FolderKanban className="empty-state-icon" />
              <div className="empty-state-title">No projects found</div>
              <div className="empty-state-desc">
                {search || statusFilter || phaseFilter || priorityFilter
                  ? "Try adjusting your filters"
                  : "Create your first project to get started"
                }
              </div>
            </div>
          ) : (
            <div className="projects-grid">
              {filtered.map((project) => {
                const days = getDaysUntilDeadline(project.deadline)
                const progress = calculateProjectProgress(project)
                const phaseColor = getPhaseColor(project.currentPhase)
                return (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div
                      className="project-card"
                      style={{ "--phase-color": phaseColor } as any}
                    >
                      <div
                        style={{
                          position: "absolute", top: 0, left: 0, right: 0,
                          height: "3px", background: phaseColor
                        }}
                      />
                      <div className="project-card-header">
                        <div>
                          <div className="project-card-title">{project.name}</div>
                          <div className="project-card-client">{project.clientName}</div>
                        </div>
                        <Badge variant={getPriorityVariant(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getStatusVariant(project.status)} dot>
                          {project.status.replace(/_/g, " ")}
                        </Badge>
                        <span style={{
                          fontSize: "0.72rem", color: phaseColor,
                          display: "inline-flex", alignItems: "center", gap: "4px"
                        }}>
                          <GitBranch size={12} />
                          {getPhaseLabel(project.currentPhase)}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-muted">Progress</span>
                          <span className="text-xs text-secondary">{progress}%</span>
                        </div>
                        <div className="progress progress-sm">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${progress}%`,
                              background: `linear-gradient(90deg, ${phaseColor}, ${phaseColor}aa)`
                            }}
                          />
                        </div>
                      </div>

                      <div className="project-card-footer">
                        <div className="project-card-meta">
                          <span className={`project-card-deadline ${days < 0 ? "overdue" : ""}`}>
                            <Calendar size={12} />
                            {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                          </span>
                          <span className="project-card-pages">
                            <FileText size={12} />
                            {project.pages.length} pages
                          </span>
                          <span className="project-card-pages">
                            <MessageSquare size={12} />
                            {project._count.comments}
                          </span>
                        </div>
                        <ArrowRight size={16} className="text-muted" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Activity Sidebar */}
        <div className="card" style={{ width: "340px", flexShrink: 0 }}>
          <div className="card-header">
            <h3 className="font-semibold" style={{ fontSize: "0.95rem" }}>Recent Activity</h3>
          </div>
          <div className="card-body" style={{ padding: 0, maxHeight: "500px", overflowY: "auto" }}>
            {activities.length === 0 ? (
              <div className="p-4 text-sm text-muted" style={{ textAlign: "center" }}>
                No recent activity
              </div>
            ) : (
              <div className="flex flex-col">
                {activities.map((activity) => (
                  <Link
                    key={activity.id}
                    href={`/projects/${activity.projectId}`}
                    className="notification-item"
                  >
                    <span style={{ fontSize: "1.1rem" }}>{getActivityIcon(activity.action)}</span>
                    <div className="notification-content">
                      <div className="notification-title">
                        {activity.user?.name}
                      </div>
                      <div className="notification-msg">
                        {activity.details || activity.action.replace(/_/g, " ")}
                      </div>
                      <div className="notification-time">
                        {formatRelativeTime(activity.createdAt)}
                        {activity.project && (
                          <> · {activity.project.name}</>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
