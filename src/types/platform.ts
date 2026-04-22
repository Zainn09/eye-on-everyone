/**
 * Shared type definitions for platform enhancement features
 */

// Task Management Types
export interface TaskWithRelations {
  id: string
  title: string
  description: string | null
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
  assignee: { id: string; name: string } | null
  creator: { id: string; name: string }
}

export interface TaskPanelProps {
  projectId: string
  initialTasks: TaskWithRelations[]
  users: Array<{ id: string; name: string; role: string }>
  currentUser: { id: string; name: string; role: string }
}

// Checklist Types
export interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface ChecklistWithItems {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  creator: { id: string; name: string }
  items: ChecklistItem[]
}

export interface ChecklistPanelProps {
  projectId: string
  initialChecklists: ChecklistWithItems[]
  currentUser: { id: string; name: string; role: string }
}

export interface ChecklistSummaryWidgetProps {
  checklists: Array<{
    id: string
    title: string
    projectId: string | null
    projectName: string | null
    items: { completed: boolean }[]
  }>
}

// Workflow Diagram Types
export type Phase =
  | "DESIGN"
  | "DESIGN_QA"
  | "DESIGN_APPROVAL"
  | "DEVELOPMENT"
  | "DEV_QA"
  | "CLIENT_PREVIEW"
  | "DELIVERED"

export interface PhaseNodeData {
  phase: Phase
  state: "completed" | "active" | "pending" | "skipped"
  revisionCount: number
  avgDays: number | null
  cycleCount: number
}

export interface WorkflowDiagramProps {
  project: {
    id: string
    currentPhase: string
    status: string
    skippedDesignQA: boolean
    activities: Array<{
      id: string
      action: string
      details: string | null
      createdAt: Date
    }>
    revisions: Array<{
      id: string
      type: string
      createdAt: Date
    }>
  }
}

// Status Tag Types
export type StatusTagType =
  | "Blocked"
  | "Overdue"
  | "Needs Assistance"
  | "In Review"
  | "Pending"
  | null

export interface StatusTagConfig {
  label: StatusTagType
  color: string
  bgColor: string
}

export interface StatusTagProps {
  tag: StatusTagConfig | null
}
