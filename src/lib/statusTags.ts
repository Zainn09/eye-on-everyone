import type { StatusTagConfig, StatusTagType } from "@/types/platform"

export type { StatusTagConfig, StatusTagType }

interface ProjectForTag {
  status: string
  deadline: Date | string
  currentPhase: string
  activities?: Array<{
    action: string
    details: string | null
    createdAt: Date | string
  }>
  name: string
}

const IN_REVIEW_PHASES = ["DESIGN_QA", "DESIGN_APPROVAL", "DEV_QA", "CLIENT_PREVIEW"]
const MS_PER_DAY = 86_400_000
const NEEDS_ASSISTANCE_DAYS = 14

export function computeStatusTag(
  project: ProjectForTag,
  needsAssistanceHighProjects: string[],
  now: Date = new Date()
): StatusTagConfig | null {
  if (!project) return null

  // 1. Blocked
  if (project.status === "BLOCKED") {
    return {
      label: "Blocked" as StatusTagType,
      color: "#EF4444",
      bgColor: "rgba(239,68,68,0.12)",
    }
  }

  // 2. Overdue
  if (project.deadline && new Date(project.deadline) < now && project.status !== "COMPLETED") {
    return {
      label: "Overdue" as StatusTagType,
      color: "#EF4444",
      bgColor: "rgba(239,68,68,0.12)",
    }
  }

  // 3. Needs Assistance
  const nameMatch = needsAssistanceHighProjects.includes(project.name)

  const activities = project.activities ?? []
  const phaseChangedActivities = activities.filter(
    (a) => a.action === "phase_changed"
  )

  let stalePhaseChange = false
  if (phaseChangedActivities.length > 0) {
    const mostRecent = phaseChangedActivities.reduce((latest, a) => {
      return new Date(a.createdAt) > new Date(latest.createdAt) ? a : latest
    })
    const daysSince =
      (now.getTime() - new Date(mostRecent.createdAt).getTime()) / MS_PER_DAY
    stalePhaseChange = daysSince > NEEDS_ASSISTANCE_DAYS
  }

  if (nameMatch || stalePhaseChange) {
    return {
      label: "Needs Assistance" as StatusTagType,
      color: "#F59E0B",
      bgColor: "rgba(245,158,11,0.12)",
    }
  }

  // 4. In Review
  if (project.currentPhase && IN_REVIEW_PHASES.includes(project.currentPhase)) {
    return {
      label: "In Review" as StatusTagType,
      color: "#06B6D4",
      bgColor: "rgba(6,182,212,0.12)",
    }
  }

  // 5. Pending
  if (project.status === "NOT_STARTED") {
    return {
      label: "Pending" as StatusTagType,
      color: "#6B7280",
      bgColor: "rgba(107,114,128,0.12)",
    }
  }

  return null
}
