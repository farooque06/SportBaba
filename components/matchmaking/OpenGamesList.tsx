"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, Plus, Users, Trophy, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { OpenGameCard } from "./OpenGameCard"
import { CreateOpenGameModal } from "./CreateOpenGameModal"
import { JoinGameModal } from "./JoinGameModal"
import { GameDetailModal } from "./GameDetailModal"
import { getOpenGames, type OpenGame } from "@/lib/actions/matchmaking"

interface OpenGamesListProps {
  initialGames?: OpenGame[]
  facilityId?: string
  isLoggedIn?: boolean
  currentUser?: {
    id: string
    name: string | null
    email: string | null
  } | null
}

export function OpenGamesList({ initialGames, facilityId, isLoggedIn = false, currentUser }: OpenGamesListProps) {
  const [games, setGames] = useState<OpenGame[]>(initialGames || [])
  const [loading, setLoading] = useState(!initialGames)
  const [refreshing, setRefreshing] = useState(false)

  // Filters
  const [sportFilter, setSportFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [joinGame, setJoinGame] = useState<OpenGame | null>(null)
  const [detailGame, setDetailGame] = useState<OpenGame | null>(null)

  const fetchGames = useCallback(async () => {
    try {
      const data = await getOpenGames({
        facility_id: facilityId,
        sport_type: sportFilter || undefined,
      })
      setGames(data)
    } catch (err) {
      console.error("Failed to fetch open games:", err)
    }
  }, [facilityId, sportFilter])

  // Initial load
  useEffect(() => {
    if (!initialGames) {
      fetchGames().finally(() => setLoading(false))
    }
  }, [])

  // Refetch on filter change
  useEffect(() => {
    fetchGames()
  }, [sportFilter, fetchGames])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchGames()
    setRefreshing(false)
  }

  const handleCreated = () => {
    fetchGames()
  }

  const handleJoined = () => {
    fetchGames()
  }

  // Filter by search query (client-side for instant feel)
  const filteredGames = games.filter(g => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      g.host_name.toLowerCase().includes(q) ||
      g.sport_type.toLowerCase().includes(q) ||
      (g.facility as any)?.name?.toLowerCase().includes(q) ||
      (g.resource as any)?.name?.toLowerCase().includes(q)
    )
  })

  const sportOptions = [
    { value: '', label: 'All Sports' },
    { value: 'football', label: '⚽ Football' },
    { value: 'cricket', label: '🏏 Cricket' },
    { value: 'basketball', label: '🏀 Basketball' },
    { value: 'badminton', label: '🏸 Badminton' },
  ]

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-6 sm:mb-8">
        {/* Top row: Search + Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by venue, host, sport..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border/60 bg-card/60 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-md bg-muted flex items-center justify-center"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-11 w-11 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
              showFilters || sportFilter 
                ? 'bg-primary/10 border-primary/30 text-primary' 
                : 'border-border/60 bg-card/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            <Filter className="h-4 w-4" />
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-11 w-11 rounded-xl border border-border/60 bg-card/60 flex items-center justify-center hover:bg-muted transition-all shrink-0"
          >
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <Button
            variant="primary"
            size="sm"
            className="h-11 px-4 sm:px-5 rounded-xl font-bold text-xs shadow-md shadow-primary/15 shrink-0"
            onClick={() => {
              if (!isLoggedIn) {
                setShowLoginPrompt(true)
              } else {
                setShowCreateModal(true)
              }
            }}
          >
            <span className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Post Game</span>
            </span>
          </Button>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {sportOptions.map(s => (
              <button
                key={s.value}
                onClick={() => setSportFilter(s.value)}
                className={`h-9 px-3.5 rounded-lg border text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  sportFilter === s.value
                    ? 'bg-primary/10 border-primary/30 text-primary ring-1 ring-primary/20'
                    : 'border-border/50 bg-card/50 text-muted-foreground hover:bg-muted/60'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <RefreshCw className="h-5 w-5 text-primary animate-spin" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Loading open games...</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-5">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-extrabold tracking-tight text-foreground mb-2">No Open Games Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Be the first to post a game and invite community players to complete your squad!
          </p>
          <Button
            variant="primary"
            onClick={() => {
              if (!isLoggedIn) {
                setShowLoginPrompt(true)
              } else {
                setShowCreateModal(true)
              }
            }}
            className="rounded-xl font-bold text-xs"
          >
            <Plus className="h-4 w-4 mr-2" />
            Host First Match
          </Button>
        </div>
      ) : (
        <>
          {/* Results count bar */}
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/8 border border-primary/15 text-xs font-bold text-primary">
              <Users className="h-3 w-3" />
              {filteredGames.length} open game{filteredGames.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-muted-foreground">
              {filteredGames.reduce((sum, g) => sum + (g.max_players - g.current_players), 0)} spots available
            </span>
          </div>

          {/* Game grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filteredGames.map(game => (
              <OpenGameCard
                key={game.id}
                game={game}
                currentUser={currentUser}
                onJoin={(g) => setJoinGame(g)}
                onViewDetails={(g) => setDetailGame(g)}
              />
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      <CreateOpenGameModal
        isOpen={showCreateModal}
        currentUser={currentUser}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreated}
        preselectedFacilityId={facilityId}
      />

      <JoinGameModal
        isOpen={!!joinGame}
        game={joinGame}
        currentUser={currentUser}
        onClose={() => setJoinGame(null)}
        onJoined={handleJoined}
      />

      <GameDetailModal
        isOpen={!!detailGame}
        game={detailGame}
        currentUser={currentUser}
        onClose={() => setDetailGame(null)}
        onJoin={(g) => { setDetailGame(null); setJoinGame(g) }}
        onGameUpdated={fetchGames}
      />

      {/* Logged-in Player Only Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div 
            className="bg-card w-full max-w-md rounded-3xl border border-primary/20 shadow-2xl p-6 sm:p-8 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 text-primary">
              <Trophy className="h-7 w-7" />
            </div>

            <h3 className="text-xl font-black tracking-tight text-foreground uppercase italic mb-2">
              Sign In to Host Games
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Only registered and logged-in players can post open matchmaking games and manage their match squads.
            </p>

            <div className="space-y-2.5">
              <a
                href="/login?callbackUrl=/open-games"
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center hover:opacity-95 active:scale-[0.98] transition-all shadow-md shadow-primary/25"
              >
                Sign In to Post Game
              </a>
              <a
                href="/register?callbackUrl=/open-games"
                className="w-full h-12 rounded-xl bg-card border border-border/80 hover:bg-muted text-foreground font-bold text-sm flex items-center justify-center active:scale-[0.98] transition-all"
              >
                Create Player Account
              </a>
            </div>

            <button
              onClick={() => setShowLoginPrompt(false)}
              className="w-full mt-4 text-xs font-semibold text-muted-foreground hover:text-foreground text-center"
            >
              Cancel & Continue Browsing
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
