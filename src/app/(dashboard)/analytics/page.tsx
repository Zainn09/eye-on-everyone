import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAnalytics } from "@/actions/misc"
import { AnalyticsClient } from "./AnalyticsClient"

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const analytics = await getAnalytics()

  return (
    <AnalyticsClient
      data={JSON.parse(JSON.stringify(analytics))}
    />
  )
}
