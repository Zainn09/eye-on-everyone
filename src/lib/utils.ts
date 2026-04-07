import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ")
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatRelativeTime(date: Date | string) {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function getDaysUntilDeadline(deadline: Date | string) {
  const now = new Date()
  const d = new Date(deadline)
  const diff = d.getTime() - now.getTime()
  return Math.ceil(diff / 86400000)
}

export function getProgressColor(progress: number) {
  if (progress >= 80) return "var(--color-success)"
  if (progress >= 50) return "var(--color-warning)"
  return "var(--color-primary)"
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case "URGENT": return "var(--color-danger)"
    case "HIGH": return "var(--color-warning)"
    case "MEDIUM": return "var(--color-primary)"
    case "LOW": return "var(--color-success)"
    default: return "var(--color-muted)"
  }
}

export function getPhaseColor(phase: string) {
  switch (phase) {
    case "DESIGN": return "#8B5CF6"
    case "DESIGN_QA": return "#F59E0B"
    case "DESIGN_APPROVAL": return "#10B981"
    case "DEVELOPMENT": return "#3B82F6"
    case "DEV_QA": return "#F59E0B"
    case "CLIENT_PREVIEW": return "#06B6D4"
    case "DELIVERED": return "#14B8A6"
    default: return "#6B7280"
  }
}

export function getPhaseLabel(phase: string) {
  switch (phase) {
    case "DESIGN": return "Design"
    case "DESIGN_QA": return "Design QA"
    case "DESIGN_APPROVAL": return "Client Approval"
    case "DEVELOPMENT": return "Development"
    case "DEV_QA": return "Dev QA"
    case "CLIENT_PREVIEW": return "Client Preview"
    case "DELIVERED": return "Delivered"
    default: return phase
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case "COMPLETED": return "var(--color-success)"
    case "IN_PROGRESS": return "var(--color-primary)"
    case "NOT_STARTED": return "var(--color-muted)"
    case "BLOCKED": return "var(--color-danger)"
    case "ON_HOLD": return "var(--color-warning)"
    default: return "var(--color-muted)"
  }
}

export function calculateProjectProgress(project: any) {
  const phases = [
    "DESIGN", "DESIGN_QA", "DESIGN_APPROVAL",
    "DEVELOPMENT", "DEV_QA", "CLIENT_PREVIEW", "DELIVERED"
  ]
  const idx = phases.indexOf(project.currentPhase)
  if (idx === -1) return 0
  return Math.round((idx / (phases.length - 1)) * 100)
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function generateAvatarColor(name: string) {
  const colors = [
    "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B",
    "#EF4444", "#06B6D4", "#EC4899", "#6366F1"
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
