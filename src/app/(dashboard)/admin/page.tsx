import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllUsers, getPendingUsers } from "@/actions/misc"
import { AdminClient } from "./AdminClient"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const [allUsers, pendingUsers] = await Promise.all([
    getAllUsers(),
    getPendingUsers(),
  ])

  // Active users = all users excluding pending
  const activeUsers = allUsers.filter((u: any) => u.status !== "PENDING_APPROVAL")

  return (
    <AdminClient
      users={JSON.parse(JSON.stringify(activeUsers))}
      pendingUsers={JSON.parse(JSON.stringify(pendingUsers))}
    />
  )
}
