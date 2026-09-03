"use client"

import { useState, useEffect } from "react"
import { X, Users, MapPin, Clock, Calendar, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Portal } from "@/components/ui/Portal"
import { joinOpenGame } from "@/lib/actions/matchmaking"
import type { OpenGame } from "@/lib/actions/matchmaking"

interface JoinGameModalProps {
  isOpen: boolean
  game: OpenGame | null
  onClose: () => void
  onJoined: () => void
}

export function JoinGameModal({ isOpen, game, onClose, onJoined }: JoinGameModalProps) {
  const [playerName, setPlayerName] = useState("")
  const [playerPhone, setPlayerPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setSuccess(false)
      setError("")
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  const handleJoin = async () => {
    if (!game) return
    setError("")
    setLoading(true)
    try {
      const result = await joinOpenGame(game.id, {
        player_name: playerName,
        player_phone: playerPhone || undefined,
      })
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          onJoined()
          onClose()
          setPlayerName("")
          setPlayerPhone("")
          setSuccess(false)
        }, 1500)
      }
    } catch {
      setError("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !game) return null

  const facilityName = (game.facility as any)?.name || 'Venue'
  const spotsLeft = game.max_players - game.current_players
  const formatTime = (t: string) => {
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h12 = hour % 12 || 12
    return `${h12}:${m} ${ampm}`
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md p-0 md:p-4" onClick={onClose}>
        <div
          className="bg-card w-full max-w-sm rounded-t-[28px] md:rounded-[24px] border border-border/40 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success state */}
          {success ? (
            <div className="p-10 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-lg">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight mb-2">You&apos;re In! 🎉</h3>
              <p className="text-sm text-muted-foreground">You&apos;ve joined the game at {facilityName}.</p>
            </div>
          ) : (
            <>
              {/* Header with game details */}
              <div className="p-6 pb-4 border-b border-border/30 bg-gradient-to-b from-primary/5 to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-extrabold tracking-tight text-foreground">Join Game</h2>
                  <button
                    onClick={onClose}
                    className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Game summary */}
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">{facilityName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">{new Date(game.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">{formatTime(game.start_time)} – {formatTime(game.end_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span className="font-semibold text-foreground">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Your Name *</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    autoFocus
                    className="w-full h-12 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Phone</label>
                  <input
                    type="tel"
                    value={playerPhone}
                    onChange={(e) => setPlayerPhone(e.target.value)}
                    placeholder="Your phone number"
                    className="w-full h-12 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                  />
                </div>

                {/* Participants so far */}
                {game.participants && game.participants.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Players Joined</label>
                    <div className="flex flex-wrap gap-1.5">
                      {game.participants.map((p) => (
                        <span key={p.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/8 border border-primary/15 text-[11px] font-semibold text-foreground">
                          <UserPlus className="h-3 w-3 text-primary" />
                          {p.player_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 pt-0 space-y-2.5">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full h-13 rounded-xl font-bold text-sm shadow-lg shadow-primary/20"
                  onClick={handleJoin}
                  disabled={loading || !playerName.trim()}
                >
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    {loading ? "Joining..." : "Join This Game"}
                  </span>
                </Button>
                <button
                  onClick={onClose}
                  className="w-full h-10 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted/60 transition-all uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Portal>
  )
}
