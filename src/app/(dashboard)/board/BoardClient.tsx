"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Calendar, FileText, MessageSquare, GitBranch, ArrowRight
} from "lucide-react"
import { Badge } from "@/components/ui"
import { moveProjectPhase } from "@/actions/projects"
import {
  getPhaseLabel, getPhaseColor, getDaysUntilDeadline, formatDate
} from "@/lib/utils"
import { PHASES_ORDER, type Phase, type UserRole, getNextPhases } from "@/lib/workflow"

interface BoardClientProps {
  projects: any[]
  currentUser: { id: string; role: string }
}

export function BoardClient({ projects, currentUser }: BoardClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleMovePhase(projectId: string, newPhase: Phase) {
    startTransition(async () => {
      await moveProjectPhase(projectId, newPhase)
      router.refresh()
    })
  }

  const columns = PHASES_ORDER.map((phase) => ({
    phase,
    label: getPhaseLabel(phase),
    color: getPhaseColor(phase),
    projects: projects.filter((p) => p.currentPhase === phase),
  }))

  const getPriorityOrder = (priority: string) => {
    switch (priority) {
      case "URGENT": return 0
      case "HIGH": return 1
      case "MEDIUM": return 2
      case "LOW": return 3
      default: return 4
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Kanban Board</h1>
        <p>Drag-free workflow board — move projects between phases</p>
      </div>

      <div className="kanban-board">
        {columns.map(({ phase, label, color, projects: colProjects }) => {
          const sorted = [...colProjects].sort(
            (a, b) => getPriorityOrder(a.priority) - getPriorityOrder(b.priority)
          )

          return (
            <div key={phase} className="kanban-column">
              <div className="kanban-column-header">
                <span
                  style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: color, flexShrink: 0
                  }}
                />
                {label}
                <span className="kanban-column-count">{colProjects.length}</span>
              </div>

              <div className="kanban-cards">
                {sorted.length === 0 ? (
                  <div style={{
                    padding: "2rem 1rem", textAlign: "center",
                    fontSize: "0.78rem", color: "var(--color-text-muted)",
                    borderRadius: "var(--radius-md)",
                    border: "1px dashed var(--color-border)"
                  }}>
                    No projects
                  </div>
                ) : (
                  sorted.map((project) => {
                    const days = getDaysUntilDeadline(project.deadline)
                    const nextPhases = getNextPhases(
                      phase,
                      currentUser.role as UserRole,
                      true
                    )

                    return (
                      <div key={project.id} className="kanban-card">
                        <Link href={`/projects/${project.id}`}>
                          <div style={{ marginBottom: "0.5rem" }}>
                            <div className="font-medium text-sm" style={{ lineHeight: 1.4 }}>
                              {project.name}
                            </div>
                            <div className="text-xs text-muted" style={{ marginTop: "2px" }}>
                              {project.clientName}
                            </div>
                          </div>
                        </Link>

                        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: "0.5rem" }}>
                          <Badge variant={
                            project.priority === "URGENT" ? "danger" :
                            project.priority === "HIGH" ? "warning" :
                            project.priority === "MEDIUM" ? "info" : "muted"
                          }>
                            {project.priority}
                          </Badge>
                          <span className={`text-xs ${days < 0 ? "text-danger" : "text-muted"}`}
                            style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                            <Calendar size={10} />
                            {days < 0 ? `${Math.abs(days)}d late` : `${days}d`}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted" style={{ marginBottom: "0.5rem" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                            <FileText size={10} /> {project.pages.length}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                            <MessageSquare size={10} /> {project._count.comments}
                          </span>
                        </div>

                        {nextPhases.length > 0 && (
                          <div className="flex gap-1 flex-wrap" style={{ marginTop: "0.375rem" }}>
                            {nextPhases.map((np) => (
                              <button
                                key={np}
                                className="btn btn-sm"
                                style={{
                                  fontSize: "0.68rem",
                                  padding: "0.2rem 0.5rem",
                                  background: `${getPhaseColor(np)}15`,
                                  color: getPhaseColor(np),
                                  border: `1px solid ${getPhaseColor(np)}30`,
                                  borderRadius: "var(--radius-sm)"
                                }}
                                onClick={() => handleMovePhase(project.id, np)}
                                disabled={isPending}
                              >
                                <ArrowRight size={10} />
                                {getPhaseLabel(np)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
