"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function addPage(projectId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const type = (formData.get("type") as string) || "CUSTOM"
  const figmaLink = formData.get("figmaLink") as string | null
  const designNotes = formData.get("designNotes") as string | null

  // Get max order
  const maxOrder = await prisma.page.aggregate({
    where: { projectId },
    _max: { order: true },
  })
  const order = (maxOrder._max.order ?? -1) + 1

  const page = await prisma.page.create({
    data: {
      name,
      type,
      figmaLink: figmaLink || null,
      designNotes: designNotes || null,
      order,
      projectId,
    },
  })

  await prisma.activity.create({
    data: {
      action: "page_added",
      details: `Added page "${name}"`,
      userId: session.user.id,
      projectId,
    },
  })

  revalidatePath(`/projects/${projectId}`)
  return page
}

export async function updatePage(pageId: string, data: {
  name?: string
  designStatus?: string
  devStatus?: string
  qaStatus?: string
  designNotes?: string
  devNotes?: string
  figmaLink?: string
  assigneeId?: string | null
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { projectId: true, name: true },
  })
  if (!page) throw new Error("Page not found")

  await prisma.page.update({
    where: { id: pageId },
    data,
  })

  // Log specific status changes
  if (data.designStatus) {
    await prisma.activity.create({
      data: {
        action: "design_updated",
        details: `"${page.name}" design status: ${data.designStatus}`,
        userId: session.user.id,
        projectId: page.projectId,
      },
    })
  } else if (data.devStatus) {
    await prisma.activity.create({
      data: {
        action: "dev_updated",
        details: `"${page.name}" dev status: ${data.devStatus}`,
        userId: session.user.id,
        projectId: page.projectId,
      },
    })
  } else if (data.qaStatus) {
    await prisma.activity.create({
      data: {
        action: "qa_updated",
        details: `"${page.name}" QA status: ${data.qaStatus}`,
        userId: session.user.id,
        projectId: page.projectId,
      },
    })
  }

  // Update project status to IN_PROGRESS when work starts
  await prisma.project.update({
    where: { id: page.projectId },
    data: { status: "IN_PROGRESS", updatedAt: new Date() },
  })

  revalidatePath(`/projects/${page.projectId}`)
}

export async function deletePage(pageId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (!["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) throw new Error("Forbidden")

  const page = await prisma.page.findUnique({ where: { id: pageId } })
  if (!page) throw new Error("Page not found")

  await prisma.page.delete({ where: { id: pageId } })

  await prisma.activity.create({
    data: {
      action: "page_deleted",
      details: `Deleted page "${page.name}"`,
      userId: session.user.id,
      projectId: page.projectId,
    },
  })

  revalidatePath(`/projects/${page.projectId}`)
}

export async function assignPage(pageId: string, assigneeId: string | null) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (!["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) throw new Error("Forbidden")

  const page = await prisma.page.findUnique({ where: { id: pageId } })
  if (!page) throw new Error("Page not found")

  await prisma.page.update({
    where: { id: pageId },
    data: { assigneeId },
  })

  if (assigneeId) {
    const assignee = await prisma.user.findUnique({ where: { id: assigneeId } })
    await prisma.activity.create({
      data: {
        action: "page_assigned",
        details: `"${page.name}" assigned to ${assignee?.name}`,
        userId: session.user.id,
        projectId: page.projectId,
      },
    })
    await prisma.notification.create({
      data: {
        title: "Task Assigned",
        message: `You have been assigned to "${page.name}"`,
        userId: assigneeId,
        link: `/projects/${page.projectId}`,
      },
    })
  }

  revalidatePath(`/projects/${page.projectId}`)
}
