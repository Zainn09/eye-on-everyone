"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Create a checklist (global or per-project)
export async function createChecklist(data: {
  title: string
  projectId?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const checklist = await prisma.checklist.create({
    data: {
      title: data.title,
      projectId: data.projectId || null,
      creatorId: session.user.id,
    },
    include: {
      items: true,
      creator: { select: { id: true, name: true } },
    },
  })

  if (data.projectId) {
    await prisma.activity.create({
      data: {
        action: "checklist_created",
        details: `Checklist "${data.title}" created`,
        userId: session.user.id,
        projectId: data.projectId,
      },
    })
    revalidatePath(`/projects/${data.projectId}`)
  }

  revalidatePath("/dashboard")
  return checklist
}

// Add item to checklist
export async function addChecklistItem(checklistId: string, title: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const checklist = await prisma.checklist.findUnique({
    where: { id: checklistId },
    select: { projectId: true, items: { select: { order: true } } },
  })
  if (!checklist) throw new Error("Checklist not found")

  const maxOrder = checklist.items.reduce((max, item) => Math.max(max, item.order), -1)

  const item = await prisma.checklistItem.create({
    data: {
      title,
      checklistId,
      order: maxOrder + 1,
    },
  })

  if (checklist.projectId) revalidatePath(`/projects/${checklist.projectId}`)
  revalidatePath("/dashboard")
  return item
}

// Toggle checklist item completion
export async function toggleChecklistItem(itemId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const item = await prisma.checklistItem.findUnique({
    where: { id: itemId },
    include: { checklist: { select: { projectId: true } } },
  })
  if (!item) throw new Error("Item not found")

  const updated = await prisma.checklistItem.update({
    where: { id: itemId },
    data: { completed: !item.completed, updatedAt: new Date() },
  })

  if (item.checklist.projectId) revalidatePath(`/projects/${item.checklist.projectId}`)
  revalidatePath("/dashboard")
  return updated
}

// Delete checklist item
export async function deleteChecklistItem(itemId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const item = await prisma.checklistItem.findUnique({
    where: { id: itemId },
    include: { checklist: { select: { projectId: true } } },
  })
  if (!item) throw new Error("Item not found")

  await prisma.checklistItem.delete({ where: { id: itemId } })

  if (item.checklist.projectId) revalidatePath(`/projects/${item.checklist.projectId}`)
  revalidatePath("/dashboard")
}

// Delete checklist
export async function deleteChecklist(checklistId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const checklist = await prisma.checklist.findUnique({
    where: { id: checklistId },
    select: { projectId: true, creatorId: true },
  })
  if (!checklist) throw new Error("Checklist not found")

  // Only creator or admin can delete
  if (checklist.creatorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Forbidden")
  }

  await prisma.checklist.delete({ where: { id: checklistId } })

  if (checklist.projectId) revalidatePath(`/projects/${checklist.projectId}`)
  revalidatePath("/dashboard")
}

// Get global checklists (not tied to a project)
export async function getGlobalChecklists() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.checklist.findMany({
    where: { projectId: null },
    include: {
      items: { orderBy: { order: "asc" } },
      creator: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

// Get checklists for a project
export async function getProjectChecklists(projectId: string) {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.checklist.findMany({
    where: { projectId },
    include: {
      items: { orderBy: { order: "asc" } },
      creator: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

// Get all checklists (global + project-linked) for the dashboard summary widget
export async function getAllChecklistsForUser() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.checklist.findMany({
    include: {
      items: { select: { completed: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}
