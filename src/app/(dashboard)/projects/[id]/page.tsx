import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getProjectById } from "@/actions/projects"
import { getUsers } from "@/actions/misc"
import { ProjectDetailClient } from "./ProjectDetailClient"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const [project, users] = await Promise.all([
    getProjectById(id),
    getUsers(),
  ])

  if (!project) notFound()

  return (
    <ProjectDetailClient
      project={JSON.parse(JSON.stringify(project))}
      users={JSON.parse(JSON.stringify(users))}
      currentUser={{
        id: session.user.id!,
        name: session.user.name!,
        role: session.user.role!,
      }}
    />
  )
}
