"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  FolderKanban, Clock, CheckCircle2, AlertTriangle,
  Calendar, FileText, MessageSquare, ArrowRight,
  Search, GitBranch, Plus, Activity, BarChart2,
  Palette, ThumbsUp, Code, Bug, Monitor, Rocket,
  CalendarDays, X
} from "lucide-react"
import { Badge } from "@/components/ui"
import { StatusTag } from "@/components/StatusTag"
import { ChecklistSummaryWidget } from "./ChecklistSummaryWidget"
import { computeStatusTag } from "@/lib/statusTags"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import {
  formatRelativeTime, getDaysUntilDeadline,
  calculateProjectProgress, getPhaseLabel, getPhaseColor
} from "@/lib/utils"
import type { ChecklistSummaryWidgetProps } from "@/types/platform"

interface DashboardClientProps {
  projects: any[]
  activities: any[]
  stats: {
    totalProjects: number
    inProgress: number
    completed: number
    overdue: number
  }
  checklists: ChecklistSummaryWidgetProps["checklists"]
  userName: string
  currentUserId: string
  currentUserRole: string
}

type DateRange = "all" | "1y" | "6m" | "1m" | "1w"

function getDateRangeStart(range: DateRange): Date | null {
  const now = new Date()
  switch (range) {
    case "1y": return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    case "6m": return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    case "1m": return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case "1w": return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    default: return null
  }
}

export function DashboardClient({ projects, activities, stats, checklists, userName, currentUserId, currentUserRole }: DashboardClientProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [phaseFilter, setPhaseFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [dateRange, setDateRange] = useState<DateRange>("all")
  const [statClickFilter, setStatClickFilter] = useState<string | null>(null)

  const dateStart = useMemo(() => getDateRangeStart(dateRange), [dateRange])

  // Projects filtered by date range
  const dateFilteredProjects = useMemo(() => {
    if (!dateStart) return projects
    return projects.filter(p => new Date(p.createdAt) >= dateStart!)
  }, [projects, dateStart])

  // Computed stats based on date range
  const filteredStats = useMemo(() => {
    const p = dateFilteredProjects
    return {
      totalProjects: p.length,
      inProgress: p.filter(x => x.status === "IN_PROGRESS").length,
      completed: p.filter(x => x.status === "COMPLETED").length,
      overdue: p.filter(x => new Date(x.deadline) < new Date() && x.status !== "COMPLETED").length,
    }
  }, [dateFilteredProjects])

  const filtered = useMemo(() => {
    let base = dateFilteredProjects

    // Apply stat click filter
    if (statClickFilter === "IN_PROGRESS") base = base.filter(p => p.status === "IN_PROGRESS")
    else if (statClickFilter === "COMPLETED") base = base.filter(p => p.status === "COMPLETED")
    else if (statClickFilter === "OVERDUE") base = base.filter(p => new Date(p.deadline) < new Date() && p.status !== "COMPLETED")

    return base.filter(p => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.clientName.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || p.status === statusFilter
      const matchPhase = !phaseFilter || p.currentPhase === phaseFilter
      const matchPriority = !priorityFilter || p.priority === priorityFilter
      return matchSearch && matchStatus && matchPhase && matchPriority
    })
  }, [dateFilteredProjects, search, statusFilter, phaseFilter, priorityFilter, statClickFilter])

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

      {/* Date Range Filter */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <CalendarDays size={16} style={{ color: "var(--color-text-muted)" }} />
        <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginRight: "0.25rem" }}>Period:</span>
        {([
          { value: "all", label: "All Time" },
          { value: "1y", label: "1 Year" },
          { value: "6m", label: "6 Months" },
          { value: "1m", label: "1 Month" },
          { value: "1w", label: "1 Week" },
        ] as { value: DateRange; label: string }[]).map(opt => (
          <button
            key={opt.value}
            onClick={() => setDateRange(opt.value)}
            style={{
              padding: "0.3rem 0.75rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.78rem",
              fontWeight: 500,
              border: "1px solid",
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: dateRange === opt.value ? "var(--color-primary)" : "var(--color-bg-elevated)",
              borderColor: dateRange === opt.value ? "var(--color-primary)" : "var(--color-border)",
              color: dateRange === opt.value ? "#fff" : "var(--color-text-secondary)",
            }}
          >
            {opt.label}
          </button>
        ))}
        {statClickFilter && (
          <button
            onClick={() => setStatClickFilter(null)}
            style={{
              display: "flex", alignItems: "center", gap: "0.35rem",
              padding: "0.3rem 0.75rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.78rem",
              fontWeight: 500,
              border: "1px solid rgba(139,92,246,0.4)",
              cursor: "pointer",
              background: "rgba(139,92,246,0.1)",
              color: "#a78bfa",
            }}
          >
            <X size={12} />
            Clear: {statClickFilter.replace("_", " ")}
          </button>
        )}
      </div>

      {/* Stats Cards — Clickable */}
      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => setStatClickFilter(statClickFilter === null ? null : null)}
          style={{ all: "unset", cursor: "pointer", display: "block" }}
        >
          <div className="stat-card" style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.01))",
            borderColor: "rgba(139,92,246,0.2)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}>
            <div className="stat-icon" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
              <FolderKanban size={24} />
            </div>
            <div>
              <div className="stat-value">{filteredStats.totalProjects}</div>
              <div className="stat-label">Total Projects</div>
              {dateRange !== "all" && (
                <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                  in selected period
                </div>
              )}
            </div>
          </div>
        </button>

        <button
          onClick={() => setStatClickFilter(statClickFilter === "IN_PROGRESS" ? null : "IN_PROGRESS")}
          style={{ all: "unset", cursor: "pointer", display: "block" }}
        >
          <div className="stat-card" style={{
            background: statClickFilter === "IN_PROGRESS"
              ? "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(59,130,246,0.05))"
              : "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.01))",
            borderColor: statClickFilter === "IN_PROGRESS" ? "rgba(59,130,246,0.5)" : "rgba(59,130,246,0.2)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: statClickFilter === "IN_PROGRESS" ? "0 0 16px rgba(59,130,246,0.2)" : "none",
          }}>
            <div className="stat-icon" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
              <Clock size={24} />
            </div>
            <div>
              <div className="stat-value">{filteredStats.inProgress}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setStatClickFilter(statClickFilter === "COMPLETED" ? null : "COMPLETED")}
          style={{ all: "unset", cursor: "pointer", display: "block" }}
        >
          <div className="stat-card" style={{
            background: statClickFilter === "COMPLETED"
              ? "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.05))"
              : "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.01))",
            borderColor: statClickFilter === "COMPLETED" ? "rgba(16,185,129,0.5)" : "rgba(16,185,129,0.2)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: statClickFilter === "COMPLETED" ? "0 0 16px rgba(16,185,129,0.2)" : "none",
          }}>
            <div className="stat-icon" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="stat-value">{filteredStats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setStatClickFilter(statClickFilter === "OVERDUE" ? null : "OVERDUE")}
          style={{ all: "unset", cursor: "pointer", display: "block" }}
        >
          <div className="stat-card" style={{
            background: statClickFilter === "OVERDUE"
              ? "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.05))"
              : "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.01))",
            borderColor: statClickFilter === "OVERDUE" ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.2)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: statClickFilter === "OVERDUE" ? "0 0 16px rgba(239,68,68,0.2)" : "none",
          }}>
            <div className="stat-icon" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="stat-value">{filteredStats.overdue}</div>
              <div className="stat-label">Overdue</div>
            </div>
          </div>
        </button>
      </div>

      {/* Analytics Overview and Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="card" style={{ gridColumn: "1 / -1", padding: "1.25rem", background: "linear-gradient(180deg, rgba(22,22,31,0.4), rgba(22,22,31,0.8))" }}>
          <h3 className="font-semibold" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", letterSpacing: "0.05em", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "1rem" }}>
            <BarChart2 size={16} /> Status Overview
          </h3>
          <div style={{ height: "240px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Not Started', value: filteredStats.totalProjects - filteredStats.inProgress - filteredStats.completed - filteredStats.overdue, color: '#6b7280' },
                { name: 'In Progress', value: filteredStats.inProgress, color: '#3b82f6' },
                { name: 'Completed', value: filteredStats.completed, color: '#10b981' },
                { name: 'Overdue', value: filteredStats.overdue, color: '#ef4444' }
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
        
        <div className="card" style={{ padding: "1.25rem", background: "linear-gradient(180deg, rgba(22,22,31,0.4), rgba(22,22,31,0.8))" }}>
          <h3 className="font-semibold" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", letterSpacing: "0.05em", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "1rem" }}>
            Quick Actions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
             <Link href="/projects/new" className="btn btn-secondary" style={{ justifyContent: "flex-start", width: "100%", borderColor: "rgba(255,255,255,0.05)" }}>
                <Plus size={16} style={{ color: "#a78bfa" }} /> Create New Project
             </Link>
             <Link href="/board" className="btn btn-secondary" style={{ justifyContent: "flex-start", width: "100%", borderColor: "rgba(255,255,255,0.05)" }}>
                <FolderKanban size={16} style={{ color: "#60a5fa" }} /> Go to Kanban Board
             </Link>
             <Link href="/analytics" className="btn btn-secondary" style={{ justifyContent: "flex-start", width: "100%", borderColor: "rgba(255,255,255,0.05)" }}>
                <Activity size={16} style={{ color: "#34d399" }} /> View Detailed Analytics
             </Link>
          </div>
        </div>
      </div>

      {/* Active Project Flowchart */}
      {filtered.length > 0 && (
        <div className="card" style={{ marginBottom: "2rem", padding: "1.5rem", background: "linear-gradient(180deg, rgba(22,22,31,0.6), rgba(10,10,15,0.9))", borderColor: "rgba(139,92,246,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <GitBranch className="text-primary" /> Active Project Workflow
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                Tracking current progress for <strong style={{ color: "#ffffff" }}>{filtered[0].name}</strong> ({filtered[0].clientName})
              </p>
            </div>
            <Link href={`/projects/${filtered[0].id}`} className="btn btn-primary btn-sm">
              View Project <ArrowRight size={14} />
            </Link>
          </div>

          <div className="workflow-stepper no-scrollbar" style={{ padding: "1rem 0", overflowX: "auto", display: 'flex', gap: '0.5rem' }}>
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
                <div key={phase.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", width: "7rem", position: "relative" }}>
                    <div 
                      style={{ 
                        width: "3rem", height: "3rem", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid", zIndex: 10,
                        borderColor: color, 
                        backgroundColor: bgColor,
                        color: color,
                        boxShadow: isActive ? `0 0 20px ${color}80` : 'none',
                        transition: "all 0.3s"
                      }}
                    >
                      {phase.icon}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: isActive || isCompleted ? '#f1f0ff' : '#6b7280' }}>
                        {phase.label}
                      </div>
                      <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "0.25rem", color }}>
                        {isCompleted ? "Done" : isActive ? "Active" : "Pending"}
                      </div>
                    </div>
                  </div>
                  
                  {idx < arr.length - 1 && (
                    <div style={{ 
                      width: "2.5rem", height: "3px", flexShrink: 0, marginTop: "-2.5rem", borderRadius: "9999px",
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
                      className={`project-card${project.skippedDesignQA ? ' qa-skipped-glow' : ''}`}
                      style={{ "--phase-color": phaseColor } as any}
                    >
                      <div
                        style={{
                          position: "absolute", top: 0, left: 0, right: 0,
                          height: "3px",
                          background: project.skippedDesignQA
                            ? "linear-gradient(90deg, #ef4444, #f87171, #ef4444)"
                            : phaseColor
                        }}
                      />
                      <div className="project-card-header">
                        <div>
                          <div className="project-card-title">{project.name}</div>
                          <div className="project-card-client">{project.clientName}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
                          <Badge variant={getPriorityVariant(project.priority)}>
                            {project.priority}
                          </Badge>
                          {project.skippedDesignQA && (
                            <span style={{
                              fontSize: "0.65rem", fontWeight: 700,
                              background: "rgba(239,68,68,0.15)",
                              color: "#f87171",
                              border: "1px solid rgba(239,68,68,0.3)",
                              padding: "0.1rem 0.45rem",
                              borderRadius: "9999px",
                              letterSpacing: "0.03em",
                            }}>
                              ⚠ QA Skipped
                            </span>
                          )}
                        </div>
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
                        <StatusTag tag={computeStatusTag(project, [], new Date())} />
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

        {/* Activity Sidebar & Work Tracking */}
        <div style={{ width: "340px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Work Tracking / Queue Panel */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="font-semibold" style={{ fontSize: "0.95rem" }}>
                {currentUserRole === "ADMIN" ? "Team Workload" : "Your Queue"}
              </h3>
              <Badge variant="info">
                {currentUserRole === "ADMIN" 
                  ? projects.reduce((acc, p) => acc + p.pages.filter((pg: any) => pg.assigneeId).length, 0)
                  : projects.reduce((acc, p) => acc + p.pages.filter((pg: any) => pg.assigneeId === currentUserId && pg.qaStatus !== "APPROVED").length, 0)
                }
              </Badge>
            </div>
            <div className="card-body" style={{ padding: 0, maxHeight: "400px", overflowY: "auto" }}>
              {currentUserRole === "ADMIN" ? (
                /* ADMIN VIEW: Who is working on what */
                <div className="flex flex-col">
                  {projects.flatMap(p => p.pages.filter((pg: any) => pg.assigneeId).map((pg: any) => ({ ...pg, projectName: p.name, projectId: p.id })))
                    .length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted">No one is currently assigned to tasks</div>
                  ) : (
                    projects.flatMap(p => p.pages.filter((pg: any) => pg.assigneeId).map((pg: any) => ({ ...pg, projectName: p.name, projectId: p.id })))
                      .map((assignment: any, idx) => (
                      <div key={idx} className="p-3 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-elevated)] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center text-xs font-bold">
                            {assignment.assignee.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{assignment.assignee.name}</div>
                            <div className="text-xs text-muted truncate">{assignment.name} @ {assignment.projectName}</div>
                          </div>
                          <Badge variant={assignment.devStatus === "COMPLETED" ? "success" : "warning"}>
                            {assignment.devStatus.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* INDIVIDUAL VIEW: Project Queue */
                <div className="flex flex-col">
                  {projects.flatMap(p => p.pages.filter((pg: any) => pg.assigneeId === currentUserId && pg.qaStatus !== "APPROVED").map((pg: any) => ({ ...pg, projectName: p.name, projectId: p.id })))
                    .length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted">Your queue is empty! Great job.</div>
                  ) : (
                    projects.flatMap(p => p.pages.filter((pg: any) => pg.assigneeId === currentUserId && pg.qaStatus !== "APPROVED").map((pg: any) => ({ ...pg, projectName: p.name, projectId: p.id })))
                      .map((task: any, idx) => (
                      <Link key={idx} href={`/projects/${task.projectId}`} className="p-3 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-elevated)] transition-colors block">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">{task.projectName}</span>
                          <span className="text-xs text-muted">{task.type}</span>
                        </div>
                        <div className="text-xs text-secondary truncate">{task.name}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex gap-1">
                            <Badge variant="muted">{task.designStatus}</Badge>
                            <Badge variant="info">{task.devStatus}</Badge>
                          </div>
                          <ArrowRight size={12} className="text-muted" />
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card">
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

          {/* Checklist Summary Widget */}
          <ChecklistSummaryWidget checklists={checklists} />
        </div>
      </div>
    </div>
  )
}
