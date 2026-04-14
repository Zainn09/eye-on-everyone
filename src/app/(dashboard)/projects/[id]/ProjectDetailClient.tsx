"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, FileText,
  MessageSquare, Plus, Trash2, ExternalLink, GitBranch,
  Calendar, User, AlertTriangle, RefreshCw, Send, Check,
  X, ChevronRight, Palette, ThumbsUp, Code, Bug, Monitor, Rocket
} from "lucide-react"
import { Badge, Button, Input, Label, Textarea, Modal } from "@/components/ui"
import { moveProjectPhase, deleteProject } from "@/actions/projects"
import { addPage, updatePage, deletePage, assignPage } from "@/actions/pages"
import { addComment, createRevision, resolveRevision } from "@/actions/misc"
import {
  getPhaseLabel, getPhaseColor, formatRelativeTime,
  formatDate, getDaysUntilDeadline, calculateProjectProgress,
  getInitials, generateAvatarColor
} from "@/lib/utils"
import { PHASES_ORDER, getNextPhases, type Phase, type UserRole } from "@/lib/workflow"

interface ProjectDetailClientProps {
  project: any
  users: any[]
  currentUser: { id: string; name: string; role: string }
}

export function ProjectDetailClient({ project, users, currentUser }: ProjectDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddPage, setShowAddPage] = useState(false)
  const [showAddComment, setShowAddComment] = useState(false)
  const [showAddRevision, setShowAddRevision] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isCopied, setIsCopied] = useState(false)

  const progress = calculateProjectProgress(project)
  const daysLeft = getDaysUntilDeadline(project.deadline)
  const nextPhases = getNextPhases(
    project.currentPhase as Phase,
    currentUser.role as UserRole,
    project.designQAEnabled
  )

  function handleMovePhase(newPhase: Phase) {
    startTransition(async () => {
      await moveProjectPhase(project.id, newPhase)
      router.refresh()
    })
  }

  async function handleAddPage(formData: FormData) {
    startTransition(async () => {
      await addPage(project.id, formData)
      setShowAddPage(false)
      router.refresh()
    })
  }

  async function handleDeletePage(pageId: string) {
    startTransition(async () => {
      await deletePage(pageId)
      router.refresh()
    })
  }

  async function handleAssignPage(pageId: string, userId: string | null) {
    startTransition(async () => {
      await assignPage(pageId, userId)
      router.refresh()
    })
  }

  async function handleUpdatePageStatus(pageId: string, field: string, value: string) {
    startTransition(async () => {
      await updatePage(pageId, { [field]: value })
      router.refresh()
    })
  }

  async function handleAddComment() {
    if (!commentText.trim()) return
    const formData = new FormData()
    formData.set("content", commentText)
    formData.set("projectId", project.id)
    startTransition(async () => {
      await addComment(formData)
      setCommentText("")
      router.refresh()
    })
  }

  async function handleAddRevision(formData: FormData) {
    formData.set("projectId", project.id)
    startTransition(async () => {
      await createRevision(formData)
      setShowAddRevision(false)
      router.refresh()
    })
  }

  async function handleResolveRevision(revisionId: string) {
    startTransition(async () => {
      await resolveRevision(revisionId)
      router.refresh()
    })
  }

  async function handleDelete() {
    startTransition(async () => {
      await deleteProject(project.id)
    })
  }

  function handleCopyShareLink() {
    const url = `${window.location.origin}/share/${project.shareToken}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "pages", label: "Pages", icon: FileText, count: project.pages.length },
    { id: "comments", label: "Comments", icon: MessageSquare, count: project.comments.length },
    { id: "activity", label: "Activity", icon: Clock, count: project.activities.length },
    { id: "revisions", label: "Revisions", icon: RefreshCw, count: project.revisions.length },
  ]

  const getStatusSelectOptions = (field: string) => {
    if (field === "qaStatus") return ["PENDING", "APPROVED", "REJECTED"]
    return ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]
  }

  return (
    <div className="animate-fade-in">
      {/* Neon Red Banner: Skipped QA */}
      {project.skippedDesignQA && (
        <div
          className="qa-skipped-banner"
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1.25rem",
            borderRadius: "var(--radius-md)",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.4)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            animation: "neon-pulse-red 2s ease-in-out infinite",
            boxShadow: "0 0 16px rgba(239,68,68,0.25), inset 0 0 16px rgba(239,68,68,0.04)",
          }}
        >
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "rgba(239,68,68,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <AlertTriangle size={16} style={{ color: "#f87171" }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#f87171" }}>
              ⚠ Design QA Skipped
            </div>
            <div style={{ fontSize: "0.78rem", color: "rgba(248,113,113,0.8)", marginTop: "0.125rem" }}>
              This project moved directly from Design to Client Approval without passing through Design QA.
            </div>
          </div>
        </div>
      )}

      {/* Back + Title */}
      <Link href="/dashboard" className="btn btn-ghost btn-sm mb-4" style={{ gap: "0.35rem" }}>
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 700 }}>
            {project.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-secondary text-sm">{project.clientName}</span>
            <Badge variant={project.priority === "URGENT" ? "danger" : project.priority === "HIGH" ? "warning" : project.priority === "MEDIUM" ? "info" : "muted"}>
              {project.priority}
            </Badge>
            <Badge variant={project.status === "COMPLETED" ? "success" : project.status === "IN_PROGRESS" ? "info" : project.status === "BLOCKED" ? "danger" : "muted"} dot>
              {project.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleCopyShareLink}
            style={{ 
              background: isCopied ? "rgba(16, 185, 129, 0.15)" : "var(--color-bg-elevated)", 
              color: isCopied ? "#34d399" : "var(--color-text)",
              borderColor: isCopied ? "rgba(16, 185, 129, 0.3)" : "var(--color-border)",
              transition: "all 0.2s"
            }}
          >
            {isCopied ? <Check size={14} /> : <ExternalLink size={14} />}
            {isCopied ? "Copied!" : "Share Link"}
          </Button>

          {nextPhases.map((phase) => (
            <Button
              key={phase}
              variant="primary"
              size="sm"
              disabled={isPending}
              onClick={() => handleMovePhase(phase)}
            >
              <ArrowRight size={14} />
              Move to {getPhaseLabel(phase)}
            </Button>
          ))}
          {currentUser.role === "ADMIN" && (
            <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Workflow Stepper Flowchart */}
      <div className="card mb-6" style={{ background: "linear-gradient(180deg, rgba(22,22,31,0.6), rgba(10,10,15,0.9))", borderColor: "rgba(139,92,246,0.3)" }}>
        <div className="card-body" style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <GitBranch className="text-primary" size={20} />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Project Flowchart</h2>
          </div>
          <div className="workflow-stepper no-scrollbar" style={{ padding: "0.5rem 0 1rem 0", overflowX: "auto", display: 'flex', gap: '0.5rem' }}>
            {PHASES_ORDER.map((phase, idx, arr) => {
              const currentIdx = arr.findIndex(p => p === project.currentPhase);
              // A phase is "QA skipped" if it's DESIGN_QA and the project has skippedDesignQA flag
              const isQASkipped = phase === "DESIGN_QA" && project.skippedDesignQA;
              const isPastPhase = currentIdx > idx || project.status === "COMPLETED";
              // QA skipped phase is neither completed nor active — it's specially marked
              const isCompleted = isPastPhase && !isQASkipped;
              const isActive = currentIdx === idx && project.status !== "COMPLETED" && !isQASkipped;
              
              let color = "#6b7280"; 
              let bgColor = "rgba(107, 114, 128, 0.1)";
              if (isQASkipped) { color = "#ef4444"; bgColor = "rgba(239,68,68,0.1)"; }
              else if (isCompleted) { color = "#10b981"; bgColor = "rgba(16, 185, 129, 0.15)"; }
              else if (isActive) { color = "#8b5cf6"; bgColor = "rgba(139, 92, 246, 0.25)"; }

              const getIconForPhase = (p: string) => {
                switch(p) {
                  case 'DESIGN': return <Palette size={18} />
                  case 'DESIGN_QA': return <CheckCircle2 size={18} />
                  case 'DESIGN_APPROVAL': return <ThumbsUp size={18} />
                  case 'DEVELOPMENT': return <Code size={18} />
                  case 'DEV_QA': return <Bug size={18} />
                  case 'CLIENT_PREVIEW': return <Monitor size={18} />
                  case 'DELIVERED': return <Rocket size={18} />
                  default: return <Check size={18} />
                }
              }

              return (
                <div key={phase} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", width: "7.5rem", position: "relative" }}>
                    <div 
                      style={{ 
                        width: "3.5rem", height: "3.5rem", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center",
                        border: isQASkipped ? "2px dashed" : "2px solid",
                        zIndex: 10,
                        borderColor: color, 
                        backgroundColor: bgColor,
                        color: color,
                        boxShadow: isActive ? `0 0 24px ${color}80` : isQASkipped ? "0 0 16px rgba(239,68,68,0.5)" : "none",
                        transition: "all 0.3s ease-in-out",
                        transform: isActive ? "scale(1.05)" : "scale(1)",
                        animation: isQASkipped ? "neon-pulse-red 2s ease-in-out infinite" : "none",
                      }}
                    >
                      {isQASkipped ? <X size={18} /> : getIconForPhase(phase)}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: isQASkipped ? "#f87171" : isActive || isCompleted ? '#f1f0ff' : '#6b7280' }}>
                        {getPhaseLabel(phase)}
                      </div>
                      <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "0.35rem", color, transition: "color 0.3s" }}>
                        {isQASkipped ? "Skipped" : isCompleted ? "Done" : isActive ? "Active" : "Pending"}
                      </div>
                    </div>
                  </div>
                  
                  {idx < arr.length - 1 && (
                    <div style={{ 
                      width: "3rem", height: "3px", flexShrink: 0, marginTop: "-2.85rem", borderRadius: "9999px",
                      background: isQASkipped
                        ? "linear-gradient(90deg, rgba(239,68,68,0.6), rgba(239,68,68,0.1))"
                        : isPastPhase
                        ? "linear-gradient(90deg, #10b981, rgba(16, 185, 129, 0.3))"
                        : "#32324a",
                      transition: "background 0.5s",
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: `${getPhaseColor(project.currentPhase)}20`, color: getPhaseColor(project.currentPhase) }}>
            <GitBranch size={20} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: "1.25rem" }}>{getPhaseLabel(project.currentPhase)}</div>
            <div className="stat-label">Current Phase</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
            <FileText size={20} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: "1.25rem" }}>{project.pages.length}</div>
            <div className="stat-label">Pages / Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: daysLeft < 0 ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)", color: daysLeft < 0 ? "#f87171" : "#60a5fa" }}>
            <Calendar size={20} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: "1.25rem" }}>
              {daysLeft < 0 ? `${Math.abs(daysLeft)}d` : `${daysLeft}d`}
            </div>
            <div className="stat-label">{daysLeft < 0 ? "Overdue" : "Days Left"}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: "1.25rem" }}>{progress}%</div>
            <div className="stat-label">Progress</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-4" style={{ overflowX: "auto" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.count !== undefined && (
              <span style={{
                fontSize: "0.65rem", background: "var(--color-bg-elevated)",
                padding: "0.1em 0.45em", borderRadius: "var(--radius-full)",
                color: "var(--color-text-muted)"
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Project Brief</h3>
              <span className="text-xs text-muted">
                Created {formatDate(project.createdAt)} by {project.creator.name}
              </span>
            </div>
            <div className="card-body">
              <p className="text-secondary" style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {project.brief}
              </p>
              <div className="divider" style={{ margin: "1.25rem 0" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <span className="text-xs text-muted" style={{ display: "block", marginBottom: "0.25rem" }}>Deadline</span>
                  <span className="text-sm font-medium">{formatDate(project.deadline)}</span>
                </div>
                <div>
                  <span className="text-xs text-muted" style={{ display: "block", marginBottom: "0.25rem" }}>Share Token</span>
                  <code className="text-xs" style={{ color: "var(--color-primary-light)" }}>{project.shareToken}</code>
                </div>
                <div>
                  <span className="text-xs text-muted" style={{ display: "block", marginBottom: "0.25rem" }}>Last Updated</span>
                  <span className="text-sm font-medium">{formatRelativeTime(project.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGES TAB */}
        {activeTab === "pages" && (
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Pages & Tasks</h3>
              {["ADMIN", "PROJECT_MANAGER"].includes(currentUser.role) && (
                <Button variant="primary" size="sm" onClick={() => setShowAddPage(true)}>
                  <Plus size={14} /> Add Page
                </Button>
              )}
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {project.pages.length === 0 ? (
                <div className="empty-state" style={{ padding: "3rem" }}>
                  <FileText size={40} style={{ opacity: 0.3 }} />
                  <div className="empty-state-title">No pages yet</div>
                  <div className="empty-state-desc">Add pages to track individual deliverables</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {/* Table Header */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 50px",
                    gap: "0.5rem", padding: "0.75rem 1.25rem",
                    fontSize: "0.72rem", fontWeight: 600,
                    color: "var(--color-text-muted)", textTransform: "uppercase",
                    letterSpacing: "0.05em", borderBottom: "1px solid var(--color-border)"
                  }}>
                    <span>Page</span>
                    <span>Design</span>
                    <span>Dev</span>
                    <span>QA</span>
                    <span>Assigned</span>
                    <span></span>
                  </div>
                  {project.pages.map((page: any) => (
                    <div
                      key={page.id}
                      style={{
                        display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 50px",
                        gap: "0.5rem", padding: "0.875rem 1.25rem",
                        alignItems: "center",
                        borderBottom: "1px solid var(--color-border)",
                        transition: "background 120ms ease"
                      }}
                      className="page-row"
                    >
                      <div>
                        <div className="font-medium text-sm">{page.name}</div>
                        <span className="text-xs text-muted">{page.type}</span>
                      </div>
                      <select
                        className="select"
                        style={{ fontSize: "0.75rem", padding: "0.3rem 0.5rem", minWidth: 0 }}
                        value={page.designStatus}
                        onChange={(e) => handleUpdatePageStatus(page.id, "designStatus", e.target.value)}
                        disabled={isPending}
                      >
                        {getStatusSelectOptions("designStatus").map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                      <select
                        className="select"
                        style={{ fontSize: "0.75rem", padding: "0.3rem 0.5rem", minWidth: 0 }}
                        value={page.devStatus}
                        onChange={(e) => handleUpdatePageStatus(page.id, "devStatus", e.target.value)}
                        disabled={isPending}
                      >
                        {getStatusSelectOptions("devStatus").map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                      <select
                        className="select"
                        style={{ fontSize: "0.75rem", padding: "0.3rem 0.5rem", minWidth: 0 }}
                        value={page.qaStatus}
                        onChange={(e) => handleUpdatePageStatus(page.id, "qaStatus", e.target.value)}
                        disabled={isPending}
                      >
                        {getStatusSelectOptions("qaStatus").map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                      <select
                        className="select"
                        style={{ fontSize: "0.75rem", padding: "0.3rem 0.5rem", minWidth: 0 }}
                        value={page.assigneeId || ""}
                        onChange={(e) => handleAssignPage(page.id, e.target.value || null)}
                        disabled={isPending || !["ADMIN", "PROJECT_MANAGER"].includes(currentUser.role)}
                      >
                        <option value="">Unassigned</option>
                        {users.map((u: any) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                      {["ADMIN", "PROJECT_MANAGER"].includes(currentUser.role) && (
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => handleDeletePage(page.id)}
                          disabled={isPending}
                          title="Delete page"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* COMMENTS TAB */}
        {activeTab === "comments" && (
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Comments</h3>
            </div>
            <div className="card-body">
              {/* Add comment */}
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div
                  className="avatar avatar-sm"
                  style={{ backgroundColor: generateAvatarColor(currentUser.name), flexShrink: 0 }}
                >
                  {getInitials(currentUser.name)}
                </div>
                <div className="flex-1">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{ minHeight: "70px" }}
                  />
                  <div style={{ marginTop: "0.5rem", textAlign: "right" }}>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!commentText.trim() || isPending}
                      onClick={handleAddComment}
                    >
                      <Send size={14} /> Post
                    </Button>
                  </div>
                </div>
              </div>

              <div className="divider" style={{ marginBottom: "1rem" }} />

              {project.comments.length === 0 ? (
                <div className="text-sm text-muted" style={{ textAlign: "center", padding: "2rem" }}>
                  No comments yet. Be the first to add one!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {project.comments.map((comment: any) => (
                    <div key={comment.id} className="comment-item">
                      <div
                        className="avatar avatar-sm"
                        style={{ backgroundColor: generateAvatarColor(comment.user.name) }}
                      >
                        {getInitials(comment.user.name)}
                      </div>
                      <div className="comment-body">
                        <div className="comment-header">
                          <span className="comment-author">{comment.user.name}</span>
                          <span className="comment-time">{formatRelativeTime(comment.createdAt)}</span>
                        </div>
                        <div className="comment-content">{comment.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === "activity" && (
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Activity Timeline</h3>
            </div>
            <div className="card-body">
              {project.activities.length === 0 ? (
                <div className="text-sm text-muted" style={{ textAlign: "center", padding: "2rem" }}>
                  No activity recorded yet
                </div>
              ) : (
                <div className="timeline">
                  {project.activities.map((activity: any) => (
                    <div key={activity.id} className="timeline-item">
                      <div
                        className="timeline-dot"
                        style={{
                          backgroundColor: activity.action.includes("phase")
                            ? "rgba(139,92,246,0.2)"
                            : activity.action.includes("created")
                            ? "rgba(16,185,129,0.2)"
                            : "var(--color-bg-elevated)"
                        }}
                      >
                        {activity.action.includes("phase") ? (
                          <GitBranch size={14} style={{ color: "#a78bfa" }} />
                        ) : activity.action.includes("created") ? (
                          <Plus size={14} style={{ color: "#34d399" }} />
                        ) : activity.action.includes("comment") ? (
                          <MessageSquare size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-action">
                          {activity.user?.name}{" "}
                          <span className="text-secondary">
                            {activity.action.replace(/_/g, " ")}
                          </span>
                        </div>
                        {activity.details && (
                          <div className="timeline-detail">{activity.details}</div>
                        )}
                        <div className="timeline-time">{formatRelativeTime(activity.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* REVISIONS TAB */}
        {activeTab === "revisions" && (
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Revisions</h3>
              <Button variant="primary" size="sm" onClick={() => setShowAddRevision(true)}>
                <Plus size={14} /> New Revision
              </Button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {project.revisions.length === 0 ? (
                <div className="empty-state" style={{ padding: "3rem" }}>
                  <RefreshCw size={40} style={{ opacity: 0.3 }} />
                  <div className="empty-state-title">No revisions</div>
                  <div className="empty-state-desc">Track design and development changes</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {project.revisions.map((rev: any) => (
                    <div
                      key={rev.id}
                      style={{
                        padding: "1rem 1.25rem",
                        borderBottom: "1px solid var(--color-border)",
                        display: "flex", alignItems: "flex-start", gap: "1rem"
                      }}
                    >
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: rev.status === "resolved" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
                        color: rev.status === "resolved" ? "#34d399" : "#fbbf24"
                      }}>
                        v{rev.version}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">Revision v{rev.version}</span>
                          <Badge variant={rev.status === "resolved" ? "success" : "warning"} dot>
                            {rev.status}
                          </Badge>
                          <Badge variant="muted">{rev.type}</Badge>
                          {rev.page && (
                            <span className="text-xs text-muted">· {rev.page.name}</span>
                          )}
                        </div>
                        <p className="text-sm text-secondary" style={{ lineHeight: 1.6 }}>
                          {rev.description}
                        </p>
                        <span className="text-xs text-muted">{formatRelativeTime(rev.createdAt)}</span>
                      </div>
                      {rev.status === "open" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleResolveRevision(rev.id)}
                          disabled={isPending}
                        >
                          <Check size={14} /> Resolve
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Page Modal */}
      <Modal isOpen={showAddPage} onClose={() => setShowAddPage(false)} title="Add Page">
        <form action={handleAddPage}>
          <div className="modal-body">
            <div className="form-group">
              <Label>Page Name</Label>
              <Input name="name" required placeholder="e.g. Homepage, Product Page" />
            </div>
            <div className="form-group">
              <Label>Page Type</Label>
              <select name="type" className="select">
                <option value="HOMEPAGE">Homepage</option>
                <option value="PRODUCT">Product Page</option>
                <option value="COLLECTION">Collection Page</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
            <div className="form-group">
              <Label>Figma Link (optional)</Label>
              <Input name="figmaLink" placeholder="https://figma.com/..." />
            </div>
            <div className="form-group">
              <Label>Design Notes (optional)</Label>
              <Textarea name="designNotes" placeholder="Any notes for the designer..." />
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="ghost" onClick={() => setShowAddPage(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isPending}>Add Page</Button>
          </div>
        </form>
      </Modal>

      {/* Add Revision Modal */}
      <Modal isOpen={showAddRevision} onClose={() => setShowAddRevision(false)} title="New Revision">
        <form action={handleAddRevision}>
          <div className="modal-body">
            <div className="form-group">
              <Label>Type</Label>
              <select name="type" className="select">
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="post-delivery">Post-Delivery</option>
              </select>
            </div>
            <div className="form-group">
              <Label>Page (optional)</Label>
              <select name="pageId" className="select">
                <option value="">All Pages</option>
                {project.pages.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <Label>Description</Label>
              <Textarea name="description" required placeholder="Describe the changes needed..." />
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="ghost" onClick={() => setShowAddRevision(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isPending}>Create Revision</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Project" size="sm">
        <div className="modal-body">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: "rgba(239,68,68,0.15)", display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>
              <AlertTriangle size={20} style={{ color: "#f87171" }} />
            </div>
            <div>
              <div className="font-semibold">Are you sure?</div>
              <div className="text-sm text-secondary">This will permanently delete &quot;{project.name}&quot; and all its data.</div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={isPending}>
            <Trash2 size={14} /> Delete Project
          </Button>
        </div>
      </Modal>
    </div>
  )
}
