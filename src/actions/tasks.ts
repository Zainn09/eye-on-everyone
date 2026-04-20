"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Create a task inside a project
export async function createTask(projectId: string, data: {
  title: string
  description?: string
  priority?: string
  dueDate?: string
  assigneeId?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      priority: data.priority || "MEDIUM",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: "TODO",
      projectId,
      creatorId: session.user.id,
      assigneeId: data.assigneeId || null,
    },
    include: {
      assignee: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
  })

  await prisma.activity.create({
    data: {
      action: "task_created",
      details: `Task "${data.title}" created`,
      userId: session.user.id,
      projectId,
    },
  })

  // Notify assignee
  if (data.assigneeId && data.assigneeId !== session.user.id) {
    await prisma.notification.create({
      data: {
        title: "Task Assigned",
        message: `You have been assigned task "${data.title}"`,
        userId: data.assigneeId,
        link: `/projects/${projectId}`,
      },
    })
  }

  revalidatePath(`/projects/${projectId}`)
  return task
}

// Move task to a new status
// Users can move to IN_PROGRESS or IN_REVIEW
// Only Admin can move to COMPLETED or close
export async function updateTaskStatus(taskId: string, newStatus: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true, title: true, status: true, assigneeId: true, creatorId: true },
  })
  if (!task) throw new Error("Task not found")

  const role = session.user.role

  // Only Admin can mark as COMPLETED
  if (newStatus === "COMPLETED" && role !== "ADMIN") {
    throw new Error("Only Admin can mark tasks as completed")
  }

  // Users can only move their own tasks (or admins/PMs can move any)
  const canMove = role === "ADMIN" || role === "PROJECT_MANAGER" ||
    task.assigneeId === session.user.id || task.creatorId === session.user.id

  if (!canMove) throw new Error("You don't have permission to update this task")

  await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus, updatedAt: new Date() },
  })

  await prisma.activity.create({
    data: {
      action: "task_updated",
      details: `Task "${task.title}" moved to ${newStatus.replace(/_/g, " ")}`,
      userId: session.user.id,
      projectId: task.projectId,
    },
  })

  revalidatePath(`/projects/${task.projectId}`)
}

// Delete a task (Admin only)
export async function deleteTask(taskId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN") throw new Error("Only Admin can delete tasks")

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true, title: true },
  })
  if (!task) throw new Error("Task not found")

  await prisma.task.delete({ where: { id: taskId } })

  await prisma.activity.create({
    data: {
      action: "task_deleted",
      details: `Task "${task.title}" deleted`,
      userId: session.user.id,
      projectId: task.projectId,
    },
  })

  revalidatePath(`/projects/${task.projectId}`)
}

// Get tasks for a project
export async function getProjectTasks(projectId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

// Get all tasks for admin insights
export async function getAllTasksForInsights() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN") throw new Error("Forbidden")

  return prisma.task.findMany({
    include: {
      assignee: { select: { id: true, name: true, role: true } },
      creator: { select: { id: true, name: true } },
      project: { select: { id: true, name: true, currentPhase: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}
