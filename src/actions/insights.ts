"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function getAdminInsights() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN") throw new Error("Forbidden")

  const [projects, users, tasks, activities] = await Promise.all([
    prisma.project.findMany({
      include: {
        pages: {
          include: {
            assignee: { select: { id: true, name: true, role: true } },
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    }),
    prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, role: true, email: true },
    }),
    prisma.task.findMany({
      include: {
        assignee: { select: { id: true, name: true, role: true } },
        project: { select: { id: true, name: true, currentPhase: true } },
      },
    }),
    prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { id: true, name: true, role: true } },
        project: { select: { id: true, name: true, currentPhase: true } },
      },
    }),
  ])

  // Team distribution by phase
  const teamDistribution = {
    DESIGN: projects.filter(p => ["DESIGN", "DESIGN_QA", "DESIGN_APPROVAL"].includes(p.currentPhase)).length,
    DEVELOPMENT: projects.filter(p => ["DEVELOPMENT", "DEV_QA"].includes(p.currentPhase)).length,
    QA: projects.filter(p => ["DESIGN_QA", "DEV_QA"].includes(p.currentPhase)).length,
    CLIENT_REVIEW: projects.filter(p => ["CLIENT_PREVIEW", "DELIVERED"].includes(p.currentPhase)).length,
  }

  // Individual performance per user
  const userPerformance = users.map(user => {
    const assignedTasks = tasks.filter(t => t.assigneeId === user.id)
    const completedTasks = assignedTasks.filter(t => t.status === "COMPLETED")
    const inReviewTasks = assignedTasks.filter(t => t.status === "IN_REVIEW")
    const pendingTasks = assignedTasks.filter(t => t.status === "TODO")
    const inProgressTasks = assignedTasks.filter(t => t.status === "IN_PROGRESS")

    // Pages assigned to this user
    const assignedPages = projects.flatMap(p =>
      p.pages.filter(pg => pg.assigneeId === user.id)
    )
    const completedPages = assignedPages.filter(pg =>
      pg.designStatus === "COMPLETED" && pg.devStatus === "COMPLETED" && pg.qaStatus === "APPROVED"
    )

    // Overdue tasks
    const overdueTasks = assignedTasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "COMPLETED"
    )

    return {
      user,
      tasksAssigned: assignedTasks.length,
      tasksCompleted: completedTasks.length,
      tasksInReview: inReviewTasks.length,
      tasksPending: pendingTasks.length,
      tasksInProgress: inProgressTasks.length,
      tasksOverdue: overdueTasks.length,
      pagesAssigned: assignedPages.length,
      pagesCompleted: completedPages.length,
      completionRate: assignedTasks.length > 0
        ? Math.round((completedTasks.length / assignedTasks.length) * 100)
        : 0,
    }
  })

  // Bottleneck detection
  const bottlenecks: string[] = []

  // QA bottleneck: many projects stuck in QA phases
  const qaStuck = projects.filter(p => ["DESIGN_QA", "DEV_QA"].includes(p.currentPhase))
  if (qaStuck.length >= 2) {
    bottlenecks.push(`${qaStuck.length} projects are stuck in QA phases`)
  }

  // Dev bottleneck
  const devStuck = projects.filter(p => p.currentPhase === "DEVELOPMENT")
  if (devStuck.length >= 3) {
    bottlenecks.push(`${devStuck.length} projects are in Development — possible dev bottleneck`)
  }

  // Overdue projects
  const overdueProjects = projects.filter(
    p => new Date(p.deadline) < new Date() && p.status !== "COMPLETED"
  )
  if (overdueProjects.length > 0) {
    bottlenecks.push(`${overdueProjects.length} project(s) are past their deadline`)
  }

  // Skipped QA
  const skippedQA = projects.filter(p => p.skippedDesignQA)
  if (skippedQA.length > 0) {
    bottlenecks.push(`${skippedQA.length} project(s) skipped Design QA review`)
  }

  // Unassigned pages
  const unassignedPages = projects.flatMap(p => p.pages.filter(pg => !pg.assigneeId))
  if (unassignedPages.length > 0) {
    bottlenecks.push(`${unassignedPages.length} page(s) have no assignee`)
  }

  // Needs assistance detection
  const needsAssistance: Array<{ project: string; reason: string; severity: "high" | "medium" | "low" }> = []

  for (const project of projects) {
    const daysLeft = Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 86400000)

    if (daysLeft < 0 && project.status !== "COMPLETED") {
      needsAssistance.push({
        project: project.name,
        reason: `Overdue by ${Math.abs(daysLeft)} days`,
        severity: "high",
      })
    } else if (daysLeft < 7 && project.status !== "COMPLETED") {
      needsAssistance.push({
        project: project.name,
        reason: `Only ${daysLeft} days until deadline`,
        severity: "medium",
      })
    }

    if (project.status === "BLOCKED") {
      needsAssistance.push({
        project: project.name,
        reason: "Project is blocked",
        severity: "high",
      })
    }

    if (project.skippedDesignQA) {
      needsAssistance.push({
        project: project.name,
        reason: "Design QA was skipped",
        severity: "medium",
      })
    }
  }

  // Phase time metrics (based on activity timestamps)
  const phaseMetrics = computePhaseMetrics(activities)

  // Task completion rate overall
  const totalTasks = tasks.length
  const completedTasksCount = tasks.filter(t => t.status === "COMPLETED").length
  const overallCompletionRate = totalTasks > 0
    ? Math.round((completedTasksCount / totalTasks) * 100)
    : 0

  return {
    teamDistribution,
    userPerformance,
    bottlenecks,
    needsAssistance,
    phaseMetrics,
    overallStats: {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === "IN_PROGRESS").length,
      completedProjects: projects.filter(p => p.status === "COMPLETED").length,
      overdueProjects: overdueProjects.length,
      totalTasks,
      completedTasksCount,
      overallCompletionRate,
      totalUsers: users.length,
    },
  }
}

function computePhaseMetrics(activities: any[]) {
  // Group phase_changed activities by project
  const phaseChanges = activities.filter(a => a.action === "phase_changed")

  const phaseTimings: Record<string, number[]> = {
    DESIGN: [],
    DESIGN_QA: [],
    DESIGN_APPROVAL: [],
    DEVELOPMENT: [],
    DEV_QA: [],
    CLIENT_PREVIEW: [],
  }

  // Group by project
  const byProject: Record<string, any[]> = {}
  for (const activity of phaseChanges) {
    if (!byProject[activity.projectId]) byProject[activity.projectId] = []
    byProject[activity.projectId].push(activity)
  }

  for (const projectActivities of Object.values(byProject)) {
    const sorted = [...projectActivities].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const curr = sorted[i]
      const days = (new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime()) / 86400000

      // Extract phase from details like "Moved from DESIGN to DESIGN_QA"
      const match = prev.details?.match(/Moved from (\w+) to (\w+)/)
      if (match) {
        const fromPhase = match[1]
        if (phaseTimings[fromPhase]) {
          phaseTimings[fromPhase].push(days)
        }
      }
    }
  }

  return Object.entries(phaseTimings).map(([phase, timings]) => ({
    phase,
    avgDays: timings.length > 0
      ? Math.round((timings.reduce((a, b) => a + b, 0) / timings.length) * 10) / 10
      : 0,
    count: timings.length,
  }))
}
