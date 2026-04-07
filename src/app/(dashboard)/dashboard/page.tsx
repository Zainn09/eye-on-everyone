import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { DashboardClient } from "./DashboardClient"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [projects, activities, stats] = await Promise.all([
    prisma.project.findMany({
      include: {
        creator: { select: { id: true, name: true, email: true } },
        pages: {
          include: {
            assignee: { select: { id: true, name: true } },
          },
        },
        _count: { select: { comments: true, revisions: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.activity.findMany({
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.project.groupBy({
      by: ["status"],
      _count: true,
    }),
  ])

  const totalProjects = projects.length
  const inProgress = projects.filter(p => p.status === "IN_PROGRESS").length
  const completed = projects.filter(p => p.status === "COMPLETED").length
  const overdue = projects.filter(
    p => new Date(p.deadline) < new Date() && p.status !== "COMPLETED"
  ).length

  return (
    <DashboardClient
      projects={JSON.parse(JSON.stringify(projects))}
      activities={JSON.parse(JSON.stringify(activities))}
      stats={{ totalProjects, inProgress, completed, overdue }}
      userName={session.user.name || "User"}
    />
  )
}
