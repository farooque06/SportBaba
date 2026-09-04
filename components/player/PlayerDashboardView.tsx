"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  X,
  UserPlus,
  Compass,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { leaveGameAsPlayer, quickJoinGame } from "@/lib/actions/player"

export function PlayerDashboardView({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData)
  const [loadingGameId, setLoadingGameId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const user = data?.user
  const stats = data?.stats || { totalMatchesJoined: 0, totalBookings: 0, activeGamesCount: 0 }
  const upcomingMatches = data?.upcomingMatches || []
  const recentBookings = data?.recentBookings || []
  const recommendedGames = data?.recommendedGames || []

  async function handleLeave(gameId: string) {
    if (!confirm("Are you sure you want to withdraw from this game?")) return
    setLoadingGameId(gameId)
    setMessage(null)

    const res = await leaveGameAsPlayer(gameId)
    if (res.error) {
      setMessage({ text: res.error, type: "error" })
    } else {
      setMessage({ text: "Successfully left the match.", type: "success" })
      // Update local state
      setData((prev: any) => ({
        ...prev,
        upcomingMatches: prev.upcomingMatches.filter((m: any) => m.id !== gameId),
        stats: {
          ...prev.stats,
          activeGamesCount: Math.max(0, prev.stats.activeGamesCount - 1),
          totalMatchesJoined: Math.max(0, prev.stats.totalMatchesJoined - 1)
        }
      }))
    }
    setLoadingGameId(null)
  }

  async function handleJoin(gameId: string) {
    setLoadingGameId(gameId)
    setMessage(null)

    const res = await quickJoinGame(gameId)
    if (res.error) {
      setMessage({ text: res.error, type: "error" })
    } else {
      setMessage({ text: "Joined game successfully! See you on the pitch.", type: "success" })
      const joined = recommendedGames.find((g: any) => g.id === gameId)
      if (joined) {
        setData((prev: any) => ({
          ...prev,
          upcomingMatches: [...prev.upcomingMatches, joined],
          recommendedGames: prev.recommendedGames.filter((g: any) => g.id !== gameId),
          stats: {
            ...prev.stats,
            activeGamesCount: prev.stats.activeGamesCount + 1,
            totalMatchesJoined: prev.stats.totalMatchesJoined + 1
          }
        }))
      }
    }
    setLoadingGameId(null)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast Alert */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <div className="flex items-center gap-3 text-sm font-bold">
            {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {message.text}
          </div>
          <button onClick={() => setMessage(null)} className="text-white/60 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent p-6 sm:p-10 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" /> Player Dashboard
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">
              Welcome Back, <span className="text-primary">{user?.name || "Player"}</span>
            </h1>
            <p className="text-sm text-muted-foreground font-medium max-w-xl">
              Track your upcoming matches, discover open casual pickup games, and review your court booking history.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/open-games">
              <Button variant="primary" size="lg" className="rounded-2xl font-black uppercase tracking-wider text-xs shadow-xl shadow-primary/20 gap-2">
                <Users className="h-4 w-4" /> Find Open Games
              </Button>
            </Link>
            <Link href="/facilities">
              <Button variant="outline" size="lg" className="rounded-2xl font-black uppercase tracking-wider text-xs border-white/10 hover:bg-white/5 gap-2">
                <Compass className="h-4 w-4" /> Book a Turf
              </Button>
            </Link>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      </div>

      {/* Player Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card glass className="p-5 border-white/10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.activeGamesCount}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Matches</div>
          </div>
        </Card>

        <Card glass className="p-5 border-white/10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.totalMatchesJoined}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Matches Joined</div>
          </div>
        </Card>

        <Card glass className="p-5 border-white/10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.totalBookings}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Turf Bookings</div>
          </div>
        </Card>
      </div>

      {/* Main Grid: My Matches & Recommended */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: My Active Matches */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase italic tracking-wider text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> My Scheduled Matches
            </h2>
            <Link href="/open-games" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Browse all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {upcomingMatches.length === 0 ? (
            <Card glass className="p-10 border-white/10 text-center space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-muted-foreground">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Upcoming Matches</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  You haven't joined any pickup games yet. Check out the open matchmaking feed to hop into a game!
                </p>
              </div>
              <Link href="/open-games" className="inline-block">
                <Button variant="primary" size="sm" className="rounded-xl font-bold uppercase text-xs">
                  Join a Game Now
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingMatches.map((match: any) => {
                const isHost = match.host_user_id === user?.id
                return (
                  <Card key={match.id} glass className="p-5 border-white/10 hover:border-primary/30 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                            {match.sport_type}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-muted-foreground border border-white/10">
                            {match.skill_level}
                          </span>
                          {isHost && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              Host
                            </span>
                          )}
                        </div>

                        <div className="text-base font-black text-white">
                          {match.facility?.name || "Sports Venue"}
                          {match.resource?.name && (
                            <span className="text-muted-foreground text-sm font-normal"> · {match.resource.name}</span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5 text-white/80">
                            <Calendar className="h-3.5 w-3.5 text-primary" /> {match.scheduled_date}
                          </span>
                          <span className="flex items-center gap-1.5 text-white/80">
                            <Clock className="h-3.5 w-3.5 text-primary" /> {match.start_time} - {match.end_time}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-primary" /> {match.current_players}/{match.max_players} Players
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Link href="/open-games">
                          <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold border-white/10 hover:bg-white/5">
                            Details
                          </Button>
                        </Link>
                        {!isHost && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={loadingGameId === match.id}
                            onClick={() => handleLeave(match.id)}
                            className="rounded-xl text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
                          >
                            {loadingGameId === match.id ? "Leaving..." : "Leave"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Bookings Section */}
          <div className="pt-4 space-y-4">
            <h2 className="text-xl font-black uppercase italic tracking-wider text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-400" /> Recent Court Reservations
            </h2>

            {recentBookings.length === 0 ? (
              <Card glass className="p-8 border-white/10 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">No Online Reservations Yet</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Booked slots from our verified partner venues will automatically appear here with real-time status and pass details.
                  </p>
                </div>
                <Link href="/facilities" className="inline-block">
                  <Button variant="primary" size="sm" className="rounded-xl font-bold uppercase text-xs">
                    Browse Turfs & Venues
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((b: any) => (
                  <Card key={b.id} glass className="p-4 border-white/10 hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-white">
                          {b.facility?.name || "Turf Booking"}
                        </span>
                        {b.resource?.name && (
                          <span className="text-muted-foreground text-xs font-semibold">· {b.resource.name}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3 font-medium">
                        <span className="flex items-center gap-1 text-white/80">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {new Date(b.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1 text-white/80">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="font-extrabold text-white">
                          Rs. {b.total_price || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          b.status === 'confirmed' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : b.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-white/5 text-muted-foreground border border-white/10'
                        }`}>
                          {b.status}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          {b.payment_status === 'paid' ? 'Paid' : 'Pay at Counter'}
                        </span>
                      </div>

                      {b.facility?.slug && (
                        <Link href={`/${b.facility.slug}`}>
                          <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold border-white/10 hover:bg-white/5">
                            Book Again
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Recommended Games to Join */}
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase italic tracking-wider text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" /> Open Games To Join
          </h2>

          {recommendedGames.length === 0 ? (
            <Card glass className="p-6 border-white/10 text-center">
              <p className="text-xs text-muted-foreground">No other open games available right now.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendedGames.map((game: any) => (
                <Card key={game.id} glass className="p-5 border-white/10 space-y-4 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {game.sport_type}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-2">
                        {game.facility?.name || "Sports Complex"}
                      </h4>
                    </div>
                    <span className="text-[11px] font-black text-muted-foreground">
                      {game.current_players}/{game.max_players} Slots
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> {game.scheduled_date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" /> {game.start_time} - {game.end_time}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    disabled={loadingGameId === game.id}
                    onClick={() => handleJoin(game.id)}
                    className="w-full rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    {loadingGameId === game.id ? "Joining..." : "1-Click Join"}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
