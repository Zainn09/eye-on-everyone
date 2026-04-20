import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAdminInsights } from "@/actions/insights"
import { InsightsClient } from "./InsightsClient"

export const dynamic = "force-dynamic"

export default async function InsightsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const insights = await getAdminInsights()

  return <InsightsClient insights={JSON.parse(JSON.stringify(insights))} />
}
