"use client"

import { useState, useEffect } from "react"
import { 
  X, Users, MapPin, Clock, Calendar, Trophy, UserPlus, MessageCircle, 
  Star, Zap, Trash2, CheckCircle2, XCircle, AlertCircle, Loader2, ShieldCheck, DoorOpen
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Portal } from "@/components/ui/Portal"
import { 
  type OpenGame, 
  approveParticipant, 
  removeParticipant, 
  updateGameStatus,
  leaveOpenGame 
} from "@/lib/actions/matchmaking"

interface GameDetailModalProps {
  isOpen: boolean
  game: OpenGame | null
  currentUser?: {
    id: string
    name: string | null
    email: string | null
  } | null
  onClose: () => void
  onJoin: (game: OpenGame) => void
  onGameUpdated?: () => void
}

export function GameDetailModal({ 
  isOpen, 
  game, 
  currentUser, 
  onClose, 
  onJoin,
  onGameUpdated 
}: GameDetailModalProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setActionError(null)
      setActionSuccess(null)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen || !game) return null

  // Host and joined player detection
  const isHost = !!(currentUser?.id && game.host_user_id === currentUser.id)
  const currentParticipant = currentUser?.id 
    ? game.participants?.find(p => p.player_user_id === currentUser.id)
    : null
  const isJoined = !!currentParticipant

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

  // ─── Host Actions ───
  const handleApprove = async (participantId: string) => {
    setActionLoading(participantId)
    setActionError(null)
    try {
      const res = await approveParticipant(game.id, participantId)
      if (res.error) {
        setActionError(res.error)
      } else {
        setActionSuccess("Player approved!")
        onGameUpdated?.()
        setTimeout(() => setActionSuccess(null), 2500)
      }
    } catch {
      setActionError("Failed to approve player.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async (participantId: string) => {
    if (!confirm("Are you sure you want to remove this player from the match?")) return
    setActionLoading(participantId)
    setActionError(null)
    try {
      const res = await removeParticipant(game.id, participantId)
      if (res.error) {
        setActionError(res.error)
      } else {
        setActionSuccess("Player removed from match.")
        onGameUpdated?.()
        setTimeout(() => setActionSuccess(null), 2500)
      }
    } catch {
      setActionError("Failed to remove player.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleStatusChange = async (status: 'cancelled' | 'completed') => {
    const actionLabel = status === 'cancelled' ? 'cancel' : 'mark as completed'
    if (!confirm(`Are you sure you want to ${actionLabel} this match?`)) return
    setActionLoading(`status-${status}`)
    setActionError(null)
    try {
      const res = await updateGameStatus(game.id, status)
      if (res.error) {
        setActionError(res.error)
      } else {
        setActionSuccess(`Match successfully marked as ${status}.`)
        onGameUpdated?.()
        setTimeout(() => {
          onClose()
        }, 1200)
      }
    } catch {
      setActionError(`Failed to update match status.`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this game?")) return
    setActionLoading("leave")
    setActionError(null)
    try {
      const res = await leaveOpenGame(game.id)
      if (res.error) {
        setActionError(res.error)
      } else {
        setActionSuccess("You left the match.")
        onGameUpdated?.()
        setTimeout(() => {
          onClose()
        }, 1200)
      }
    } catch {
      setActionError("Failed to leave match.")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md p-0 md:p-4" onClick={onClose}>
        <div
          className="bg-card w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[28px] md:rounded-[24px] border border-border/40 shadow-2xl custom-scrollbar flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top gradient bar */}
          <div className={`h-1.5 w-full ${isFull ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-primary to-emerald-400'} shrink-0`} />
          
          {/* Header */}
          <div className="p-6 pb-0 flex-1">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{sportEmoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                      {game.sport_type.charAt(0).toUpperCase() + game.sport_type.slice(1)} Match
                    </h2>
                    {isHost && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Host
                      </span>
                    )}
                  </div>
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

            {/* Alert messages */}
            {actionError && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {actionSuccess}
              </div>
            )}

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Calendar className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Date</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-foreground truncate block">{dateStr}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Clock className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Time</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-foreground block">{formatTime(game.start_time)} – {formatTime(game.end_time)}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Venue</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-foreground truncate block">{facilityName}</span>
                {resourceName && <span className="text-[11px] text-muted-foreground block truncate">{resourceName}</span>}
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Star className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Level</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-foreground block">{skillLabels[game.skill_level] || 'All Levels'}</span>
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

            {/* ═══════════════ HOST MANAGEMENT CONTROLS ═══════════════ */}
            {isHost && (
              <div className="mb-5 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-600">Host Match Controls</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">You are the organizer</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleStatusChange('completed')}
                    disabled={actionLoading === 'status-completed'}
                    className="h-9 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    {actionLoading === 'status-completed' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Mark Completed
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange('cancelled')}
                    disabled={actionLoading === 'status-cancelled'}
                    className="h-9 px-3 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    {actionLoading === 'status-cancelled' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    Cancel Match
                  </button>
                </div>
              </div>
            )}

            {/* Participants list */}
            {game.participants && game.participants.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Players Roster ({game.participants.length})
                  </label>
                  {isHost && (
                    <span className="text-[10px] text-amber-600 font-bold">Manage requests & roster below</span>
                  )}
                </div>

                <div className="space-y-2">
                  {game.participants.map((p, idx) => {
                    const isPlayerHost = idx === 0 || (game.host_user_id && p.player_user_id === game.host_user_id)
                    const isPending = p.status === 'pending'
                    const isRemoving = actionLoading === p.id

                    return (
                      <div key={p.id} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-muted/30 border border-border/30 gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                            isPlayerHost 
                              ? 'bg-amber-500/15 text-amber-600' 
                              : isPending
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-foreground'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground truncate">{p.player_name}</span>
                              {isPlayerHost && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded shrink-0">
                                  👑 Host
                                </span>
                              )}
                              {isPending && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded shrink-0">
                                  Pending Approval
                                </span>
                              )}
                            </div>
                            {p.player_phone && isHost && (
                              <span className="text-[11px] text-muted-foreground font-mono block">
                                📞 {p.player_phone}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Host controls for this participant */}
                        {isHost && !isPlayerHost && (
                          <div className="flex items-center gap-1 shrink-0">
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => handleApprove(p.id)}
                                disabled={isRemoving}
                                title="Approve Player"
                                className="h-8 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                              >
                                {isRemoving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                <span className="hidden sm:inline">Approve</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemove(p.id)}
                              disabled={isRemoving}
                              title="Remove from squad"
                              className="h-8 w-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 flex items-center justify-center transition-all"
                            >
                              {isRemoving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="sticky bottom-0 bg-card/95 backdrop-blur-xl border-t border-border/40 px-6 py-4 space-y-2 shrink-0">
            {isHost ? (
              <div className="text-center py-1">
                <span className="text-xs font-bold text-muted-foreground">
                  You are hosting this match • Manage your squad above
                </span>
              </div>
            ) : isJoined ? (
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 rounded-xl font-bold text-xs border-red-500/30 text-red-600 hover:bg-red-500/10"
                onClick={handleLeave}
                disabled={actionLoading === 'leave'}
              >
                {actionLoading === 'leave' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <DoorOpen className="h-4 w-4 mr-2" />
                )}
                Leave This Game
              </Button>
            ) : !isFull ? (
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
