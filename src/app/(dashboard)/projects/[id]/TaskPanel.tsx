"use client"

import { useState, useTransition, useOptimistic } from "react"
import { Plus, Trash2, ArrowRight, Calendar, Loader2, AlertCircle, CheckCircle2, Clock, Eye } from "lucide-react"
import { Badge } from "@/components/ui"
import { createTask, updateTaskStatus, deleteTask } from "@/actions/tasks"
import type { TaskPanelProps, TaskWithRelations } from "@/types/platform"
import {
  getAllowedNextStatuses,
  validateTitle,
  getStatusLabel,
  getStatusColor,
  getPriorityVariant,
  type TaskStatus,
} from "@/lib/taskUtils"

const STATUS_COLUMNS: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"]

const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  TODO: <Clock size={14} />,
  IN_PROGRESS: <ArrowRight size={14} />,
  IN_REVIEW: <Eye size={14} />,
  COMPLETED: <CheckCircle2 size={14} />,
}

export function TaskPanel({ projectId, initialTasks, users, currentUser }: TaskPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticTasks, updateOptimisticTasks] = useOptimistic(
    initialTasks,
    (state: TaskWithRelations[], action: { type: string; payload: any }) => {
      switch (action.type) {
        case "ADD":
          return [action.payload, ...state]
        case "UPDATE_STATUS":
          return state.map(t =>
            t.id === action.payload.id ? { ...t, status: action.payload.status } : t
          )
        case "DELETE":
          return state.filter(t => t.id !== action.payload.id)
        default:
          return state
      }
    }
  )

  // Create form state
  const [newTitle, setNewTitle] = useState("")
  const [newPriority, setNewPriority] = useState("MEDIUM")
  const [newAssigneeId, setNewAssigneeId] = useState("")
  const [newDueDate, setNewDueDate] = useState("")
  const [createError, setCreateError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Per-task action errors
  const [taskErrors, setTaskErrors] = useState<Record<string, string>>({})

  const isAdmin = currentUser.role === "ADMIN"

  function setTaskError(taskId: string, msg: string) {
    setTaskErrors(prev => ({ ...prev, [taskId]: msg }))
    setTimeout(() => setTaskErrors(prev => { const n = { ...prev }; delete n[taskId]; return n }), 4000)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const err = validateTitle(newTitle)
    if (err) { setCreateError(err); return }
    setCreateError(null)

    const optimisticTask: TaskWithRelations = {
      id: `temp-${Date.now()}`,
      title: newTitle.trim(),
      description: null,
      status: "TODO",
      priority: newPriority as TaskWithRelations["priority"],
      dueDate: newDueDate ? new Date(newDueDate) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignee: users.find(u => u.id === newAssigneeId)
        ? { id: newAssigneeId, name: users.find(u => u.id === newAssigneeId)!.name }
        : null,
      creator: { id: currentUser.id, name: currentUser.name },
    }

    startTransition(async () => {
      updateOptimisticTasks({ type: "ADD", payload: optimisticTask })
      try {
        await createTask(projectId, {
          title: newTitle.trim(),
          priority: newPriority,
          dueDate: newDueDate || undefined,
          assigneeId: newAssigneeId || undefined,
        })
        setNewTitle("")
        setNewPriority("MEDIUM")
        setNewAssigneeId("")
        setNewDueDate("")
        setShowCreateForm(false)
      } catch (e) {
        setCreateError(e instanceof Error ? e.message : "Failed to create task")
      }
    })
  }

  async function handleStatusChange(task: TaskWithRelations, newStatus: TaskStatus) {
    if (newStatus === "COMPLETED" && !isAdmin) {
      setTaskError(task.id, "Only Admin can mark tasks as completed")
      return
    }
    startTransition(async () => {
      updateOptimisticTasks({ type: "UPDATE_STATUS", payload: { id: task.id, status: newStatus } })
      try {
        await updateTaskStatus(task.id, newStatus)
      } catch (e) {
        setTaskError(task.id, e instanceof Error ? e.message : "Failed to update task")
      }
    })
  }

  async function handleDelete(task: TaskWithRelations) {
    startTransition(async () => {
      updateOptimisticTasks({ type: "DELETE", payload: { id: task.id } })
      try {
        await deleteTask(task.id)
      } catch (e) {
        setTaskError(task.id, e instanceof Error ? e.message : "Failed to delete task")
      }
    })
  }

  const tasksByStatus = STATUS_COLUMNS.reduce((acc, status) => {
    acc[status] = optimisticTasks.filter(t => t.status === status)
    return acc
  }, {} as Record<TaskStatus, TaskWithRelations[]>)

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle2 size={18} style={{ color: "#a78bfa" }} />
          Tasks
          <span style={{
            fontSize: "0.72rem", fontWeight: 600,
            background: "rgba(139,92,246,0.15)", color: "#a78bfa",
            padding: "0.1rem 0.5rem", borderRadius: "9999px",
          }}>
            {optimisticTasks.length}
          </span>
        </h3>
        <button
          onClick={() => setShowCreateForm(v => !v)}
          className="btn btn-primary btn-sm"
          style={{ gap: "0.35rem" }}
        >
          <Plus size={14} />
          Add Task
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <input
              className="input"
              style={{ flex: "1 1 200px" }}
              placeholder="Task title *"
              value={newTitle}
              onChange={e => { setNewTitle(e.target.value); setCreateError(null) }}
              disabled={isPending}
            />
            <select
              className="select"
              style={{ flex: "0 0 130px" }}
              value={newPriority}
              onChange={e => setNewPriority(e.target.value)}
              disabled={isPending}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <select
              className="select"
              style={{ flex: "1 1 160px" }}
              value={newAssigneeId}
              onChange={e => setNewAssigneeId(e.target.value)}
              disabled={isPending}
            >
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <input
              type="date"
              className="input"
              style={{ flex: "0 0 160px" }}
              value={newDueDate}
              onChange={e => setNewDueDate(e.target.value)}
              disabled={isPending}
            />
          </div>
          {createError && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#f87171", fontSize: "0.8rem" }}>
              <AlertCircle size={14} /> {createError}
            </div>
          )}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateForm(false)} disabled={isPending}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create Task
            </button>
          </div>
        </form>
      )}

      {/* Columns */}
      {optimisticTasks.length === 0 && !showCreateForm ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-muted)" }}>
          <CheckCircle2 size={40} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
          <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>No tasks yet</div>
          <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>Create the first one to get started</div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "0.75rem",
        }}
          className="task-columns"
        >
          {STATUS_COLUMNS.map(status => {
            const color = getStatusColor(status)
            const colTasks = tasksByStatus[status]
            return (
              <div key={status} style={{
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}>
                {/* Column header */}
                <div style={{
                  padding: "0.6rem 0.875rem",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  borderTop: `3px solid ${color}`,
                }}>
                  <span style={{ color, display: "flex" }}>{STATUS_ICONS[status]}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                    {getStatusLabel(status)}
                  </span>
                  <span style={{
                    marginLeft: "auto",
                    fontSize: "0.68rem", fontWeight: 700,
                    background: "var(--color-bg-elevated)",
                    color: "var(--color-text-muted)",
                    padding: "0.1rem 0.4rem",
                    borderRadius: "9999px",
                  }}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Task cards */}
                <div style={{ padding: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem", minHeight: "60px" }}>
                  {colTasks.length === 0 && (
                    <div style={{ padding: "0.75rem", textAlign: "center", fontSize: "0.72rem", color: "var(--color-text-muted)", opacity: 0.6 }}>
                      Empty
                    </div>
                  )}
                  {colTasks.map(task => {
                    const allowed = getAllowedNextStatuses(task.status as TaskStatus, currentUser.role)
                    const nextStatus = allowed[0] ?? null
                    const taskErr = taskErrors[task.id]

                    return (
                      <div key={task.id} style={{
                        background: "var(--color-bg-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-sm)",
                        padding: "0.625rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.4rem",
                        transition: "border-color 0.15s",
                      }}>
                        {/* Title row */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.4rem" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: 500, lineHeight: 1.4, flex: 1 }}>
                            {task.title}
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(task)}
                              disabled={isPending}
                              style={{
                                background: "none", border: "none", cursor: "pointer",
                                color: "var(--color-text-muted)", padding: "0.1rem",
                                flexShrink: 0, display: "flex", alignItems: "center",
                              }}
                              title="Delete task"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>

                        {/* Meta row */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                          <Badge variant={getPriorityVariant(task.priority)} style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem" }}>
                            {task.priority}
                          </Badge>
                          {task.assignee && (
                            <span style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>
                              👤 {task.assignee.name}
                            </span>
                          )}
                          {task.dueDate && (
                            <span style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                              <Calendar size={10} />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {/* Error */}
                        {taskErr && (
                          <div style={{ fontSize: "0.7rem", color: "#f87171", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <AlertCircle size={11} /> {taskErr}
                          </div>
                        )}

                        {/* Move button */}
                        {nextStatus && (
                          <button
                            onClick={() => handleStatusChange(task, nextStatus)}
                            disabled={isPending}
                            style={{
                              background: "none",
                              border: `1px solid ${getStatusColor(nextStatus)}40`,
                              borderRadius: "var(--radius-sm)",
                              color: getStatusColor(nextStatus),
                              fontSize: "0.68rem",
                              fontWeight: 600,
                              padding: "0.2rem 0.5rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              transition: "all 0.15s",
                              width: "100%",
                              justifyContent: "center",
                            }}
                          >
                            {isPending ? <Loader2 size={10} /> : <ArrowRight size={10} />}
                            Move to {getStatusLabel(nextStatus)}
                          </button>
                        )}

                        {/* Admin-only complete hint for IN_REVIEW */}
                        {task.status === "IN_REVIEW" && !isAdmin && (
                          <div style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", textAlign: "center", opacity: 0.7 }}>
                            Admin approval required
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Responsive style for small screens */}
      <style>{`
        @media (max-width: 768px) {
          .task-columns {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 1024px) {
          .task-columns {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </div>
  )
}
