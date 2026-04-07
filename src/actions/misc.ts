"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function addComment(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const content = formData.get("content") as string
  const projectId = formData.get("projectId") as string | null
  const pageId = formData.get("pageId") as string | null
  const revisionId = formData.get("revisionId") as string | null

  if (!content?.trim()) throw new Error("Comment cannot be empty")

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      userId: session.user.id,
      projectId: projectId || null,
      pageId: pageId || null,
      revisionId: revisionId || null,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })

  if (projectId) {
    await prisma.activity.create({
      data: {
        action: "comment_added",
        details: `Added a comment`,
        userId: session.user.id,
        projectId,
      },
    })

    // Notify project team about comment
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true, creatorId: true },
    })
    if (project && project.creatorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          title: "New Comment",
          message: `${session.user.name} commented on "${project.name}"`,
          userId: project.creatorId,
          link: `/projects/${projectId}`,
        },
      })
    }
  }

  if (projectId) revalidatePath(`/projects/${projectId}`)
  return comment
}

export async function getNotifications() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
}

export async function markNotificationRead(notificationId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.notification.update({
    where: { id: notificationId, userId: session.user.id },
    data: { read: true },
  })
}

export async function markAllNotificationsRead() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  })
}

export async function createRevision(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const projectId = formData.get("projectId") as string
  const pageId = formData.get("pageId") as string | null
  const description = formData.get("description") as string
  const type = formData.get("type") as string

  // Get next version number
  const lastRevision = await prisma.revision.findFirst({
    where: { projectId },
    orderBy: { version: "desc" },
    select: { version: true },
  })
  const version = (lastRevision?.version ?? 0) + 1

  const revision = await prisma.revision.create({
    data: {
      projectId,
      pageId: pageId || null,
      description,
      type,
      version,
      status: "open",
    },
  })

  await prisma.activity.create({
    data: {
      action: "revision_created",
      details: `Revision v${version} created: ${description.slice(0, 80)}`,
      userId: session.user.id,
      projectId,
    },
  })

  revalidatePath(`/projects/${projectId}`)
  return revision
}

export async function resolveRevision(revisionId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    select: { projectId: true, version: true },
  })
  if (!revision) throw new Error("Revision not found")

  await prisma.revision.update({
    where: { id: revisionId },
    data: { status: "resolved" },
  })

  await prisma.activity.create({
    data: {
      action: "revision_resolved",
      details: `Revision v${revision.version} marked as resolved`,
      userId: session.user.id,
      projectId: revision.projectId,
    },
  })

  revalidatePath(`/projects/${revision.projectId}`)
}

export async function getUsers() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  })
}

export async function updateUserRole(userId: string, role: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN") throw new Error("Forbidden")

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  })
  revalidatePath("/admin")
}

export async function getAnalytics() {
  const [projects, activities] = await Promise.all([
    prisma.project.findMany({
      include: { pages: true },
    }),
    prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ])

  const byStatus = {
    NOT_STARTED: projects.filter((p) => p.status === "NOT_STARTED").length,
    IN_PROGRESS: projects.filter((p) => p.status === "IN_PROGRESS").length,
    COMPLETED: projects.filter((p) => p.status === "COMPLETED").length,
    BLOCKED: projects.filter((p) => p.status === "BLOCKED").length,
    ON_HOLD: projects.filter((p) => p.status === "ON_HOLD").length,
  }

  const byPhase = {
    DESIGN: projects.filter((p) => p.currentPhase === "DESIGN").length,
    DESIGN_QA: projects.filter((p) => p.currentPhase === "DESIGN_QA").length,
    DESIGN_APPROVAL: projects.filter((p) => p.currentPhase === "DESIGN_APPROVAL").length,
    DEVELOPMENT: projects.filter((p) => p.currentPhase === "DEVELOPMENT").length,
    DEV_QA: projects.filter((p) => p.currentPhase === "DEV_QA").length,
    CLIENT_PREVIEW: projects.filter((p) => p.currentPhase === "CLIENT_PREVIEW").length,
    DELIVERED: projects.filter((p) => p.currentPhase === "DELIVERED").length,
  }

  const byPriority = {
    LOW: projects.filter((p) => p.priority === "LOW").length,
    MEDIUM: projects.filter((p) => p.priority === "MEDIUM").length,
    HIGH: projects.filter((p) => p.priority === "HIGH").length,
    URGENT: projects.filter((p) => p.priority === "URGENT").length,
  }

  const overdue = projects.filter(
    (p) => new Date(p.deadline) < new Date() && p.status !== "COMPLETED"
  ).length

  const completionRate =
    projects.length > 0
      ? Math.round((byStatus.COMPLETED / projects.length) * 100)
      : 0

  return { byStatus, byPhase, byPriority, overdue, completionRate, total: projects.length, activities }
}
