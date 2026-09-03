import { auth } from "@/auth"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { OpenGamesList } from "@/components/matchmaking/OpenGamesList"
import { getOpenGames } from "@/lib/actions/matchmaking"
import { Users, Sparkles } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Open Games & Matchmaking | SportBaba",
  description: "Find players and join open pickup games or casual matches at your local sports venues.",
}

export const dynamic = "force-dynamic"

export default async function OpenGamesPage() {
  const session = await auth()
  const isLoggedIn = !!session?.user
  const initialGames = await getOpenGames()

  return (
    <main className="min-h-screen bg-background flex flex-col selection:bg-primary/20 selection:text-primary">
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="flex-1 pt-24 sm:pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="relative rounded-3xl overflow-hidden mb-8 sm:mb-10 p-6 sm:p-10 border border-border/50 bg-gradient-to-br from-primary/10 via-card to-card/60 backdrop-blur-xl shadow-lg shadow-primary/5">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Community Matchmaking
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground uppercase italic leading-[1.1] mb-3">
                Open <span className="text-primary text-glow">Games</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
                Short on players or looking for a casual match? Join open games at top venues or post your own match to let local players join you.
              </p>
            </div>

            {/* Decorative background shape */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          </div>

          {/* Open Games List Component */}
          <OpenGamesList initialGames={initialGames} />
        </div>
      </div>

      <Footer />
    </main>
  )
}
