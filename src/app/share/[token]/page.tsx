import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { SharedProjectClient } from "./SharedProjectClient"

export default async function SharedProjectPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  
  const project = await prisma.project.findUnique({
    where: { shareToken: token },
    include: {
      creator: { select: { name: true } },
      pages: {
        orderBy: { order: "asc" }
      },
    }
  })

  if (!project) notFound()

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <SharedProjectClient project={JSON.parse(JSON.stringify(project))} />
      </div>
    </div>
  )
}
