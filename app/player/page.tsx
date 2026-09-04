import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getPlayerDashboardData } from "@/lib/actions/player"
import { PlayerDashboardView } from "@/components/player/PlayerDashboardView"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Player Dashboard | SportBaba",
  description: "Track your matches, upcoming games, and turf bookings.",
}

export const dynamic = "force-dynamic"

export default async function PlayerDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const data = await getPlayerDashboardData()

  return <PlayerDashboardView initialData={data} />
}
