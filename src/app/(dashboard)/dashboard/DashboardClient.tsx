"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  FolderKanban, Clock, CheckCircle2, AlertTriangle,
  Calendar, FileText, MessageSquare, ArrowRight,
  Search, Filter, GitBranch, Plus, Activity, BarChart2,
  Palette, ThumbsUp, Code, Bug, Monitor, Rocket
} from "lucide-react"
import { Badge } from "@/components/ui"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
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
          <h1 className="flex items-center gap-2">
            <Activity className="text-primary" size={28} style={{ color: "#a78bfa" }} />
            {getGreeting()}, {userName.split(" ")[0]}
          </h1>
          <p>Here&apos;s what&apos;s happening across your projects</p>
        </div>
        <div className="page-header-actions">
          <Link href="/projects/new" className="btn btn-primary" style={{ boxShadow: '0 0 20px rgba(139,92,246,0.3)', padding: '0.6rem 1.25rem' }}>
            <Plus size={18} />
            <span>Create Project</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid mb-8">
        <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.01))", borderColor: "rgba(139,92,246,0.2)" }}>
          <div className="stat-icon" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
            <FolderKanban size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.totalProjects}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.01))", borderColor: "rgba(59,130,246,0.2)" }}>
          <div className="stat-icon" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.01))", borderColor: "rgba(16,185,129,0.2)" }}>
          <div className="stat-icon" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.01))", borderColor: "rgba(239,68,68,0.2)" }}>
          <div className="stat-icon" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.overdue}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
      </div>

      {/* Analytics Overview and Quick Actions */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2 p-5" style={{ background: "linear-gradient(180deg, rgba(22,22,31,0.4), rgba(22,22,31,0.8))" }}>
          <h3 className="font-semibold mb-4 text-sm tracking-wide text-muted uppercase flex items-center gap-2">
            <BarChart2 size={16} /> Status Overview
          </h3>
          <div style={{ height: "240px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Not Started', value: stats.totalProjects - stats.inProgress - stats.completed - stats.overdue, color: '#6b7280' },
                { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
                { name: 'Completed', value: stats.completed, color: '#10b981' },
                { name: 'Overdue', value: stats.overdue, color: '#ef4444' }
              ]}>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#16161f', borderColor: '#2a2a3a', borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {
                    [
                      { name: 'Not Started', color: '#6b7280' },
                      { name: 'In Progress', color: '#3b82f6' },
                      { name: 'Completed', color: '#10b981' },
                      { name: 'Overdue', color: '#ef4444' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card p-5" style={{ background: "linear-gradient(180deg, rgba(22,22,31,0.4), rgba(22,22,31,0.8))" }}>
          <h3 className="font-semibold mb-4 text-sm tracking-wide text-muted uppercase flex items-center gap-2">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-3">
             <Link href="/projects/new" className="btn btn-secondary w-full justify-start border-white/5 hover:border-primary/50 transition-all">
                <Plus size={16} style={{ color: "#a78bfa" }} /> Create New Project
             </Link>
             <Link href="/board" className="btn btn-secondary w-full justify-start border-white/5 hover:border-primary/50 transition-all">
                <FolderKanban size={16} style={{ color: "#60a5fa" }} /> Go to Kanban Board
             </Link>
             <Link href="/analytics" className="btn btn-secondary w-full justify-start border-white/5 hover:border-primary/50 transition-all">
                <Activity size={16} style={{ color: "#34d399" }} /> View Detailed Analytics
             </Link>
          </div>
        </div>
      </div>

      {/* Active Project Flowchart */}
      {filtered.length > 0 && (
        <div className="card mb-8 p-6" style={{ background: "linear-gradient(180deg, rgba(22,22,31,0.6), rgba(10,10,15,0.9))", borderColor: "rgba(139,92,246,0.3)" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <GitBranch className="text-primary" /> Active Project Workflow
              </h2>
              <p className="text-sm text-muted mt-1" style={{ color: "#9ca3af" }}>
                Tracking current progress for <strong className="text-white">{filtered[0].name}</strong> ({filtered[0].clientName})
              </p>
            </div>
            <Link href={`/projects/${filtered[0].id}`} className="btn btn-primary btn-sm">
              View Project <ArrowRight size={14} />
            </Link>
          </div>

          <div className="workflow-stepper py-4 overflow-x-auto no-scrollbar" style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { id: "DESIGN", label: "Design", icon: <Palette size={18} /> },
              { id: "DESIGN_QA", label: "Design QA", icon: <CheckCircle2 size={18} /> },
              { id: "DESIGN_APPROVAL", label: "Client Approval", icon: <ThumbsUp size={18} /> },
              { id: "DEVELOPMENT", label: "Development", icon: <Code size={18} /> },
              { id: "DEV_QA", label: "Dev QA", icon: <Bug size={18} /> },
              { id: "CLIENT_PREVIEW", label: "Preview", icon: <Monitor size={18} /> },
              { id: "DELIVERED", label: "Delivered", icon: <Rocket size={18} /> }
            ].map((phase, idx, arr) => {
              const currentIdx = arr.findIndex(p => p.id === filtered[0].currentPhase);
              const isCompleted = currentIdx > idx || filtered[0].status === "COMPLETED";
              const isActive = currentIdx === idx && filtered[0].status !== "COMPLETED";
              
              let color = "#6b7280"; 
              let bgColor = "rgba(107, 114, 128, 0.1)";
              if (isCompleted) { color = "#10b981"; bgColor = "rgba(16, 185, 129, 0.15)"; }
              else if (isActive) { color = "#8b5cf6"; bgColor = "rgba(139, 92, 246, 0.25)"; }

              return (
                <div key={phase.id} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center gap-3 w-28 relative transition-all duration-300 hover:-translate-y-1">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 z-10 transition-all`}
                      style={{ 
                        borderColor: color, 
                        backgroundColor: bgColor,
                        color: color,
                        boxShadow: isActive ? `0 0 20px ${color}80` : 'none'
                      }}
                    >
                      {phase.icon}
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold" style={{ color: isActive || isCompleted ? '#f1f0ff' : '#6b7280' }}>
                        {phase.label}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider mt-1" style={{ color }}>
                        {isCompleted ? "Done" : isActive ? "Active" : "Pending"}
                      </div>
                    </div>
                  </div>
                  
                  {idx < arr.length - 1 && (
                    <div className="w-10 h-[3px] shrink-0 -mt-10 rounded-full" style={{ 
                      background: isCompleted ? "linear-gradient(90deg, #10b981, rgba(16, 185, 129, 0.3))" : "#32324a" 
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

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
