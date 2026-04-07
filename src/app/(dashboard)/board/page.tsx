import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { BoardClient } from "./BoardClient"

export default async function BoardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const projects = await prisma.project.findMany({
    include: {
      creator: { select: { id: true, name: true } },
      pages: { select: { id: true } },
      _count: { select: { comments: true, revisions: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <BoardClient
      projects={JSON.parse(JSON.stringify(projects))}
      currentUser={{
        id: session.user.id!,
        role: session.user.role!,
      }}
    />
  )
}
