"use client"

import { Users, MapPin, Clock, Calendar, Trophy, ChevronRight, Zap, Star } from "lucide-react"
import { Button } from "@/components/ui/Button"
import type { OpenGame } from "@/lib/actions/matchmaking"

interface OpenGameCardProps {
  game: OpenGame
  onJoin: (game: OpenGame) => void
  onViewDetails: (game: OpenGame) => void
}

export function OpenGameCard({ game, onJoin, onViewDetails }: OpenGameCardProps) {
  const isFull = game.status === 'full' || game.current_players >= game.max_players
  const spotsLeft = game.max_players - game.current_players
  const fillPercent = Math.round((game.current_players / game.max_players) * 100)
  const facilityName = (game.facility as any)?.name || 'Unknown Venue'
  const resourceName = (game.resource as any)?.name || null
  const sportEmoji = game.sport_type === 'football' ? '⚽' : game.sport_type === 'cricket' ? '🏏' : '🏅'

  // Format date nicely
  const gameDate = new Date(game.scheduled_date + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  let dateLabel: string
  if (gameDate.getTime() === today.getTime()) {
    dateLabel = 'Today'
  } else if (gameDate.getTime() === tomorrow.getTime()) {
    dateLabel = 'Tomorrow'
  } else {
    dateLabel = gameDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  // Format time
  const formatTime = (t: string) => {
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h12 = hour % 12 || 12
    return `${h12}:${m} ${ampm}`
  }

  const skillColors: Record<string, string> = {
    beginner: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    intermediate: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    advanced: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    any: 'bg-muted text-muted-foreground border-border/60',
  }

  return (
    <div className="group relative rounded-2xl bg-card/80 backdrop-blur-sm border border-border/60 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 border-shimmer">
      {/* Status indicator stripe */}
      <div className={`h-1 w-full ${isFull ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-primary to-emerald-400'}`} />

      <div className="p-5 sm:p-6">
        {/* Top row: Sport badge + date */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{sportEmoji}</span>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-tight">
                {game.sport_type.charAt(0).toUpperCase() + game.sport_type.slice(1)} Match
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Hosted by <span className="text-foreground font-semibold">{game.host_name}</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/8 border border-primary/15 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Calendar className="h-3 w-3" />
              {dateLabel}
            </span>
            {game.skill_level !== 'any' && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${skillColors[game.skill_level]}`}>
                <Star className="h-2.5 w-2.5" />
                {game.skill_level}
              </span>
            )}
          </div>
        </div>

        {/* Venue + Time details */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-medium truncate">{facilityName}</span>
            {resourceName && (
              <>
                <span className="text-border">•</span>
                <span className="text-xs font-medium text-foreground/70">{resourceName}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-medium">{formatTime(game.start_time)} – {formatTime(game.end_time)}</span>
          </div>
        </div>

        {/* Notes */}
        {game.notes && (
          <p className="text-xs text-muted-foreground/80 mb-4 line-clamp-2 leading-relaxed italic">
            "{game.notes}"
          </p>
        )}

        {/* Player count bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-foreground">
                {game.current_players}/{game.max_players} Players
              </span>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isFull ? 'text-amber-500' : 'text-primary'}`}>
              {isFull ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-primary to-emerald-400'}`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          {!isFull ? (
            <Button
              variant="primary"
              size="sm"
              className="flex-1 h-11 rounded-xl font-bold text-xs shadow-md shadow-primary/15 group/btn"
              onClick={() => onJoin(game)}
            >
              <span className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" />
                Join Game
              </span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-11 rounded-xl font-bold text-xs opacity-60 cursor-not-allowed"
              disabled
            >
              Game Full
            </Button>
          )}
          <button
            onClick={() => onViewDetails(game)}
            className="h-11 w-11 rounded-xl border border-border/60 bg-muted/40 flex items-center justify-center hover:bg-muted hover:border-primary/20 transition-all shrink-0"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
