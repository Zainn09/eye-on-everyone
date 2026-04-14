"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { canTransition, type Phase } from "@/lib/workflow"
import { z } from "zod"

const ProjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  clientName: z.string().min(2, "Client name is required"),
  brief: z.string().min(10, "Brief must be at least 10 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  deadline: z.string().min(1, "Deadline is required"),
})

export async function createProject(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const role = session.user.role
  if (!["ADMIN", "PROJECT_MANAGER"].includes(role)) throw new Error("Forbidden")

  const validated = ProjectSchema.parse({
    name: formData.get("name"),
    clientName: formData.get("clientName"),
    brief: formData.get("brief"),
    priority: formData.get("priority"),
    deadline: formData.get("deadline"),
  })

  const project = await prisma.project.create({
    data: {
      ...validated,
      designQAEnabled: true,
      deadline: new Date(validated.deadline),
      creatorId: session.user.id,
      status: "NOT_STARTED",
      currentPhase: "DESIGN",
    },
  })

  await prisma.activity.create({
    data: {
      action: "created_project",
      details: `Project "${validated.name}" created`,
      userId: session.user.id,
      projectId: project.id,
    },
  })

  // Notify all admins/PMs
  const managers = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "PROJECT_MANAGER"] } },
  })
  await prisma.notification.createMany({
    data: managers
      .filter((m) => m.id !== session.user.id)
      .map((m) => ({
        title: "New Project Created",
        message: `"${validated.name}" for ${validated.clientName} was created`,
        userId: m.id,
        link: `/projects/${project.id}`,
      })),
  })

  redirect(`/projects/${project.id}`)
}

export async function updateProject(projectId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const validated = ProjectSchema.parse({
    name: formData.get("name"),
    clientName: formData.get("clientName"),
    brief: formData.get("brief"),
    priority: formData.get("priority"),
    deadline: formData.get("deadline"),
  })

  await prisma.project.update({
    where: { id: projectId },
    data: { ...validated, deadline: new Date(validated.deadline) },
  })

  await prisma.activity.create({
    data: {
      action: "updated_project",
      details: `Project details updated`,
      userId: session.user.id,
      projectId,
    },
  })

  revalidatePath(`/projects/${projectId}`)
}

export async function deleteProject(projectId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN") throw new Error("Forbidden")

  await prisma.project.delete({ where: { id: projectId } })
  revalidatePath("/dashboard")
  redirect("/dashboard")
}

export async function moveProjectPhase(
  projectId: string,
  newPhase: Phase,
  note?: string
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })
  if (!project) throw new Error("Project not found")

  const canMove = canTransition(
    project.currentPhase as Phase,
    newPhase,
    session.user.role as any,
    true
  )
  if (!canMove) throw new Error("Transition not allowed")

  const previousPhase = project.currentPhase

  // Update status based on phase
  let status = project.status
  if (newPhase === "DELIVERED") status = "COMPLETED"
  else if (newPhase !== "DESIGN") status = "IN_PROGRESS"

  await prisma.project.update({
    where: { id: projectId },
    data: { currentPhase: newPhase, status, updatedAt: new Date() },
  })

  await prisma.activity.create({
    data: {
      action: "phase_changed",
      details: `Moved from ${previousPhase} to ${newPhase}${note ? `: ${note}` : ""}`,
      userId: session.user.id,
      projectId,
    },
  })

  // Notify relevant team members
  const notifyRoles: Record<string, string[]> = {
    DESIGN: ["DESIGNER"],
    DESIGN_QA: ["QA"],
    DESIGN_APPROVAL: ["ADMIN", "PROJECT_MANAGER"],
    DEVELOPMENT: ["DEVELOPER"],
    DEV_QA: ["QA"],
    CLIENT_PREVIEW: ["ADMIN", "PROJECT_MANAGER"],
    DELIVERED: ["ADMIN", "PROJECT_MANAGER"],
  }
  const rolesToNotify = notifyRoles[newPhase] || []
  if (rolesToNotify.length > 0) {
    const users = await prisma.user.findMany({
      where: { role: { in: rolesToNotify } },
    })
    await prisma.notification.createMany({
      data: users
        .filter((u) => u.id !== session.user.id)
        .map((u) => ({
          title: "Project Phase Updated",
          message: `"${project.name}" moved to ${newPhase.replace("_", " ")}`,
          userId: u.id,
          link: `/projects/${projectId}`,
        })),
    })
  }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath("/dashboard")
  revalidatePath("/board")
}

export async function updateProjectStatus(projectId: string, status: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (!["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) throw new Error("Forbidden")

  await prisma.project.update({
    where: { id: projectId },
    data: { status },
  })

  await prisma.activity.create({
    data: {
      action: "status_changed",
      details: `Status changed to ${status}`,
      userId: session.user.id,
      projectId,
    },
  })

  revalidatePath(`/projects/${projectId}`)
  revalidatePath("/dashboard")
}

export async function getProjects(filters?: {
  status?: string
  phase?: string
  search?: string
  priority?: string
}) {
  const where: any = {}

  if (filters?.status) where.status = filters.status
  if (filters?.phase) where.currentPhase = filters.phase
  if (filters?.priority) where.priority = filters.priority
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { clientName: { contains: filters.search } },
    ]
  }

  return prisma.project.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true, email: true } },
      pages: {
        include: {
          assignee: { select: { id: true, name: true } },
        },
      },
      _count: { select: { comments: true, activities: true, revisions: true } },
    },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getProjectById(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      pages: {
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          attachments: true,
        },
        orderBy: { order: "asc" },
      },
      attachments: true,
      comments: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      activities: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      revisions: {
        include: {
          page: { select: { id: true, name: true } },
          comments: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}
