"use client"

import { useEffect } from "react"
import { X, Users, MapPin, Clock, Calendar, Trophy, UserPlus, MessageCircle, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Portal } from "@/components/ui/Portal"
import type { OpenGame } from "@/lib/actions/matchmaking"

interface GameDetailModalProps {
  isOpen: boolean
  game: OpenGame | null
  onClose: () => void
  onJoin: (game: OpenGame) => void
}

export function GameDetailModal({ isOpen, game, onClose, onJoin }: GameDetailModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen || !game) return null

  const isFull = game.status === 'full' || game.current_players >= game.max_players
  const spotsLeft = game.max_players - game.current_players
  const fillPercent = Math.round((game.current_players / game.max_players) * 100)
  const facilityName = (game.facility as any)?.name || 'Venue'
  const resourceName = (game.resource as any)?.name || null
  const sportEmoji = game.sport_type === 'football' ? '⚽' : game.sport_type === 'cricket' ? '🏏' : game.sport_type === 'basketball' ? '🏀' : '🏅'

  const formatTime = (t: string) => {
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h12 = hour % 12 || 12
    return `${h12}:${m} ${ampm}`
  }

  const gameDate = new Date(game.scheduled_date + 'T00:00:00')
  const dateStr = gameDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const skillLabels: Record<string, string> = {
    beginner: '🟢 Beginner Friendly',
    intermediate: '🔵 Intermediate',
    advanced: '🟠 Advanced',
    any: '🎯 All Levels Welcome',
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md p-0 md:p-4" onClick={onClose}>
        <div
          className="bg-card w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-[28px] md:rounded-[24px] border border-border/40 shadow-2xl custom-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top gradient bar */}
          <div className={`h-1.5 w-full ${isFull ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-primary to-emerald-400'}`} />
          
          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{sportEmoji}</span>
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                    {game.sport_type.charAt(0).toUpperCase() + game.sport_type.slice(1)} Match
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Hosted by <span className="font-semibold text-foreground">{game.host_name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-9 w-9 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Calendar className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Date</span>
                </div>
                <span className="text-sm font-bold text-foreground">{dateStr}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Clock className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Time</span>
                </div>
                <span className="text-sm font-bold text-foreground">{formatTime(game.start_time)} – {formatTime(game.end_time)}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Venue</span>
                </div>
                <span className="text-sm font-bold text-foreground">{facilityName}</span>
                {resourceName && <span className="text-xs text-muted-foreground block">{resourceName}</span>}
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Star className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Level</span>
                </div>
                <span className="text-sm font-bold text-foreground">{skillLabels[game.skill_level] || 'All Levels'}</span>
              </div>
            </div>

            {/* Notes */}
            {game.notes && (
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30 mb-5">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                  <MessageCircle className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Host&apos;s Note</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed italic">&ldquo;{game.notes}&rdquo;</p>
              </div>
            )}

            {/* Player count */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">{game.current_players}/{game.max_players} Players</span>
                </div>
                <span className={`text-xs font-bold ${isFull ? 'text-amber-500' : 'text-primary'}`}>
                  {isFull ? 'Game Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${isFull ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-primary to-emerald-400'}`}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            </div>

            {/* Participants list */}
            {game.participants && game.participants.length > 0 && (
              <div className="mb-6">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 block">Players</label>
                <div className="space-y-1.5">
                  {game.participants.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/30 border border-border/30">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-black text-primary">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground">{p.player_name}</span>
                        {idx === 0 && (
                          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/8 px-1.5 py-0.5 rounded">Host</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="sticky bottom-0 bg-card/95 backdrop-blur-xl border-t border-border/40 px-6 py-4 space-y-2">
            {!isFull ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full h-13 rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
                onClick={() => { onClose(); onJoin(game) }}
              >
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Join This Game
                </span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                className="w-full h-13 rounded-xl font-bold text-sm opacity-60"
                disabled
              >
                Game Full
              </Button>
            )}
            <button
              onClick={onClose}
              className="w-full h-10 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted/60 transition-all uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
