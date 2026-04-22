import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getProjectById } from "@/actions/projects"
import { getUsers } from "@/actions/misc"
import { getProjectTasks } from "@/actions/tasks"
import { getProjectChecklists } from "@/actions/checklists"
import { ProjectDetailClient } from "./ProjectDetailClient"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const [project, users, tasks, checklists] = await Promise.all([
    getProjectById(id),
    getUsers(),
    getProjectTasks(id),
    getProjectChecklists(id),
  ])

  if (!project) notFound()

  return (
    <ProjectDetailClient
      project={JSON.parse(JSON.stringify(project))}
      users={JSON.parse(JSON.stringify(users))}
      tasks={JSON.parse(JSON.stringify(tasks))}
      checklists={JSON.parse(JSON.stringify(checklists))}
      currentUser={{
        id: session.user.id!,
        name: session.user.name!,
        role: session.user.role!,
      }}
    />
  )
}
