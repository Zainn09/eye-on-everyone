/**
 * Pure utility functions for task management.
 * No React or Next.js imports — safe to use in tests.
 */

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED"

/**
 * Returns the allowed next statuses for a task given the current status and user role.
 * - Non-Admin users can never transition to COMPLETED.
 * - Admin can move to any valid next status.
 */
export function getAllowedNextStatuses(
  currentStatus: TaskStatus,
  role: string
): TaskStatus[] {
  const isAdmin = role === "ADMIN"

  switch (currentStatus) {
    case "TODO":
      return ["IN_PROGRESS"]
    case "IN_PROGRESS":
      return ["IN_REVIEW"]
    case "IN_REVIEW":
      return isAdmin ? ["COMPLETED"] : []
    case "COMPLETED":
      return []
    default:
      return []
  }
}

/**
 * Validates a task or checklist title.
 * Returns an error string if invalid, or null if valid.
 */
export function validateTitle(title: string): string | null {
  if (!title || title.trim().length === 0) {
    return "Title is required"
  }
  return null
}

/**
 * Returns a human-readable label for a task status.
 */
export function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case "TODO": return "To Do"
    case "IN_PROGRESS": return "In Progress"
    case "IN_REVIEW": return "In Review"
    case "COMPLETED": return "Completed"
    default: return status
  }
}

/**
 * Returns the color associated with a task status.
 */
export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case "TODO": return "#6b7280"
    case "IN_PROGRESS": return "#3b82f6"
    case "IN_REVIEW": return "#f59e0b"
    case "COMPLETED": return "#10b981"
    default: return "#6b7280"
  }
}

/**
 * Returns the badge variant for a task priority.
 */
export function getPriorityVariant(priority: string): string {
  switch (priority) {
    case "URGENT": return "danger"
    case "HIGH": return "warning"
    case "MEDIUM": return "info"
    default: return "muted"
  }
}
