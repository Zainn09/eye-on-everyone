"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, GitBranch, Calendar, AlertTriangle,
  ListChecks, Target, Activity
} from "lucide-react"
import { Badge } from "@/components/ui"
import { StatusTag } from "@/components/StatusTag"
import { TaskPanel } from "./TaskPanel"
import { ChecklistPanel } from "./ChecklistPanel"
import { WorkflowDiagram } from "./WorkflowDiagram"
import { computeStatusTag } from "@/lib/statusTags"
import {
  getPhaseLabel, getPhaseColor, formatDate,
  getDaysUntilDeadline, calculateProjectProgress
} from "@/lib/utils"
import type { TaskWithRelations, ChecklistWithItems } from "@/types/platform"

interface ProjectDetailClientProps {
  project: any
  users: Array<{ id: string; name: string; role: string; email: string }>
  tasks: TaskWithRelations[]
  checklists: ChecklistWithItems[]
  currentUser: { id: string; name: string; role: string }
}

export function ProjectDetailClient({
  project,
  users,
  tasks,
  checklists,
  currentUser,
}: ProjectDetailClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"tasks" | "checklists">("tasks")

  const days = getDaysUntilDeadline(project.deadline)
  const progress = calculateProjectProgress(project)
  const phaseColor = getPhaseColor(project.currentPhase)
  const statusTag = computeStatusTag(project, [], new Date())

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

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <Link href="/dashboard" className="btn btn-secondary btn-sm" style={{ marginBottom: "1rem", display: "inline-flex" }}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Project header */}
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>
                {project.name}
              </h1>
              {statusTag && <StatusTag tag={statusTag} />}
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
              Client: <strong>{project.clientName}</strong>
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              {project.brief}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Badge variant={getPriorityVariant(project.priority)}>
                {project.priority}
              </Badge>
              <Badge variant={getStatusVariant(project.status)} dot>
                {project.status.replace(/_/g, " ")}
              </Badge>
              <span style={{
                fontSize: "0.75rem", color: phaseColor,
                display: "inline-flex", alignItems: "center", gap: "4px",
                background: `${phaseColor}15`,
                padding: "0.2rem 0.6rem",
                borderRadius: "9999px",
                border: `1px solid ${phaseColor}40`,
              }}>
                <GitBranch size={12} />
                {getPhaseLabel(project.currentPhase)}
              </span>
            </div>
            <div style={{
              fontSize: "0.8rem",
              color: days < 0 ? "#f87171" : "var(--color-text-muted)",
              display: "flex", alignItems: "center", gap: "0.35rem",
            }}>
              <Calendar size={13} />
              {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d until ${formatDate(project.deadline)}`}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Overall Progress</span>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>{progress}%</span>
          </div>
          <div className="progress progress-md">
            <div
              className="progress-bar"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${phaseColor}, ${phaseColor}aa)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Workflow Diagram */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{
          fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem",
          display: "flex", alignItems: "center", gap: "0.5rem",
        }}>
          <Activity size={18} style={{ color: "#a78bfa" }} />
          Project Workflow
        </h2>
        <WorkflowDiagram project={project} />
      </div>

      {/* Tasks & Checklists Tabs */}
      <div style={{ marginBottom: "2rem" }}>
        <div className="tabs" style={{ marginBottom: "1rem" }}>
          <button
            className={`tab-btn ${activeTab === "tasks" ? "active" : ""}`}
            onClick={() => setActiveTab("tasks")}
          >
            <Target size={16} />
            Tasks
            <span style={{
              fontSize: "0.68rem", fontWeight: 700,
              background: activeTab === "tasks" ? "rgba(139,92,246,0.15)" : "rgba(107,114,128,0.1)",
              color: activeTab === "tasks" ? "#a78bfa" : "var(--color-text-muted)",
              padding: "0.1rem 0.4rem",
              borderRadius: "9999px",
            }}>
              {tasks.length}
            </span>
          </button>
          <button
            className={`tab-btn ${activeTab === "checklists" ? "active" : ""}`}
            onClick={() => setActiveTab("checklists")}
          >
            <ListChecks size={16} />
            Checklists
            <span style={{
              fontSize: "0.68rem", fontWeight: 700,
              background: activeTab === "checklists" ? "rgba(139,92,246,0.15)" : "rgba(107,114,128,0.1)",
              color: activeTab === "checklists" ? "#a78bfa" : "var(--color-text-muted)",
              padding: "0.1rem 0.4rem",
              borderRadius: "9999px",
            }}>
              {checklists.length}
            </span>
          </button>
        </div>

        {activeTab === "tasks" && (
          <TaskPanel
            projectId={project.id}
            initialTasks={tasks}
            users={users}
            currentUser={currentUser}
          />
        )}

        {activeTab === "checklists" && (
          <ChecklistPanel
            projectId={project.id}
            initialChecklists={checklists}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  )
}
