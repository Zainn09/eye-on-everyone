import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUsers } from "@/actions/misc"
import { AdminClient } from "./AdminClient"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const users = await getUsers()

  return (
    <AdminClient
      users={JSON.parse(JSON.stringify(users))}
    />
  )
}
