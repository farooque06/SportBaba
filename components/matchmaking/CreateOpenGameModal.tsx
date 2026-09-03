"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { 
  X, MapPin, Trophy, Calendar as CalendarIcon, Clock, Users, Zap, 
  AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Sparkles, Star, Plus, Trash2, UserPlus
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Portal } from "@/components/ui/Portal"
import { createOpenGame, getMatchmakingFacilities, getMatchmakingResources } from "@/lib/actions/matchmaking"
import { getPublicAvailability } from "@/lib/actions/public"

interface CreateOpenGameModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
  preselectedFacilityId?: string
}

export function CreateOpenGameModal({ isOpen, onClose, onCreated, preselectedFacilityId }: CreateOpenGameModalProps) {
  // ─── Facilities & Resources ───
  const [facilities, setFacilities] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loadingFacilities, setLoadingFacilities] = useState(false)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [availability, setAvailability] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<1 | 2>(1) // 1: Venue & Time Slot, 2: Match & Host Details

  // ─── Form Selection State ───
  const [facilityId, setFacilityId] = useState(preselectedFacilityId || "")
  const [resourceId, setResourceId] = useState("")
  const [sportType, setSportType] = useState("football")
  
  // Date State: Next 14 days
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [duration, setDuration] = useState(60) // minutes
  const [selectedSlot, setSelectedSlot] = useState<{ hour: number; minute: number } | null>(null)

  // Step 2 Details State
  const [hostName, setHostName] = useState("")
  const [hostPhone, setHostPhone] = useState("")
  const [maxPlayers, setMaxPlayers] = useState(10)
  const [skillLevel, setSkillLevel] = useState("any")
  const [notes, setNotes] = useState("")

  // Additional starting players added by host
  const [additionalPlayers, setAdditionalPlayers] = useState<string[]>([])
  const [newPlayerInput, setNewPlayerInput] = useState("")

  // Selected Facility Object
  const selectedFacility = useMemo(() => {
    return facilities.find(f => f.id === facilityId) || null
  }, [facilities, facilityId])

  // Operating Hours
  const openHour = selectedFacility?.config?.open_time ? parseInt(selectedFacility.config.open_time.split(':')[0]) : 6
  const closeHour = selectedFacility?.config?.close_time ? parseInt(selectedFacility.config.close_time.split(':')[0]) : 22

  // ─── Next 14 Days generator ───
  const dateOptions = useMemo(() => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      dates.push(d)
    }
    return dates
  }, [])

  // ─── Generate Time Slots for selected venue hours ───
  const timeSlots = useMemo(() => {
    const slots: { hour: number; minute: number; label: string; timeStr: string }[] = []
    for (let h = openHour; h < closeHour; h++) {
      for (let m = 0; m < 60; m += 30) {
        const period = h >= 12 ? 'PM' : 'AM'
        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
        const displayMin = m === 0 ? '00' : '30'
        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        slots.push({ hour: h, minute: m, label: `${displayHour}:${displayMin} ${period}`, timeStr })
      }
    }
    return slots
  }, [openHour, closeHour])

  // Duration Options
  const durationOptions = [
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hrs' },
    { value: 120, label: '2 hours' },
  ]

  // Sports Options
  const sports = [
    { value: 'football', label: '⚽ Football', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' },
    { value: 'cricket', label: '🏏 Cricket', color: 'bg-blue-500/10 border-blue-500/30 text-blue-600' },
    { value: 'basketball', label: '🏀 Basketball', color: 'bg-orange-500/10 border-orange-500/30 text-orange-600' },
    { value: 'badminton', label: '🏸 Badminton', color: 'bg-purple-500/10 border-purple-500/30 text-purple-600' },
  ]

  const skills = [
    { value: 'any', label: '🎯 All Levels' },
    { value: 'beginner', label: '🟢 Beginner' },
    { value: 'intermediate', label: '🔵 Intermediate' },
    { value: 'advanced', label: '🟠 Advanced' },
  ]

  // ─── Load Facilities on Mount ───
  useEffect(() => {
    if (isOpen) {
      setLoadingFacilities(true)
      getMatchmakingFacilities().then(data => {
        setFacilities(data)
        if (data.length > 0 && !facilityId) {
          setFacilityId(data[0].id)
        }
      }).finally(() => setLoadingFacilities(false))
    }
  }, [isOpen])

  // ─── Load Resources when facility changes ───
  useEffect(() => {
    if (facilityId) {
      getMatchmakingResources(facilityId).then(res => {
        setResources(res)
        if (res.length > 0) {
          setResourceId(res[0].id)
        } else {
          setResourceId("")
        }
      })
    } else {
      setResources([])
      setResourceId("")
    }
    setSelectedSlot(null)
  }, [facilityId])

  // ─── Fetch Availability for Facility & Date ───
  const fetchAvailability = useCallback(async () => {
    if (!facilityId) return
    setLoadingAvailability(true)
    try {
      const data = await getPublicAvailability(facilityId, selectedDate.toISOString())
      setAvailability(data)
    } catch (err) {
      console.error("Availability error in matchmaking modal:", err)
    } finally {
      setLoadingAvailability(false)
    }
  }, [facilityId, selectedDate])

  useEffect(() => {
    if (isOpen && facilityId) {
      fetchAvailability()
      setSelectedSlot(null)
    }
  }, [isOpen, facilityId, selectedDate, fetchAvailability])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  // ─── Slot Status Checking (Same logic as booking engine) ───
  const isSlotPast = (hour: number, minute: number) => {
    const now = new Date()
    const slotDate = new Date(selectedDate)
    slotDate.setHours(hour, minute, 0, 0)
    return slotDate <= now
  }

  const isSlotBooked = (hour: number, minute: number, durationMins: number) => {
    if (!resourceId) return false
    const slotStart = new Date(selectedDate)
    slotStart.setHours(hour, minute, 0, 0)
    
    const slotEnd = new Date(slotStart)
    slotEnd.setMinutes(slotEnd.getMinutes() + durationMins)

    return availability.some(b => {
      if (b.resource_id !== resourceId) return false
      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)
      return slotStart < bEnd && slotEnd > bStart
    })
  }

  // Calculate start and end times
  const calculatedTimes = useMemo(() => {
    if (!selectedSlot) return { startTimeStr: '', endTimeStr: '', dateStr: '' }
    const startHour = selectedSlot.hour.toString().padStart(2, '0')
    const startMin = selectedSlot.minute.toString().padStart(2, '0')
    const startTimeStr = `${startHour}:${startMin}`

    const startDateTime = new Date(selectedDate)
    startDateTime.setHours(selectedSlot.hour, selectedSlot.minute, 0, 0)

    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + duration)

    const endHour = endDateTime.getHours().toString().padStart(2, '0')
    const endMin = endDateTime.getMinutes().toString().padStart(2, '0')
    const endTimeStr = `${endHour}:${endMin}`

    const dateStr = selectedDate.toISOString().split('T')[0]

    return { startTimeStr, endTimeStr, dateStr }
  }, [selectedSlot, selectedDate, duration])

  // Add a starting player to list
  const handleAddPlayer = () => {
    const trimmed = newPlayerInput.trim()
    if (!trimmed) return
    if (1 + additionalPlayers.length >= maxPlayers) {
      setError(`Cannot add more players than the max limit (${maxPlayers}).`)
      return
    }
    if (additionalPlayers.includes(trimmed)) {
      setError("Player already in the list.")
      return
    }
    setAdditionalPlayers([...additionalPlayers, trimmed])
    setNewPlayerInput("")
    setError("")
  }

  const handleRemovePlayer = (idx: number) => {
    setAdditionalPlayers(additionalPlayers.filter((_, i) => i !== idx))
  }

  // ─── Submit Action ───
  const handleSubmit = async () => {
    setError("")
    if (!facilityId || !hostName.trim() || !calculatedTimes.startTimeStr || !calculatedTimes.endTimeStr) {
      setError("Please complete all required fields.")
      return
    }

    setSubmitting(true)
    try {
      const result = await createOpenGame({
        facility_id: facilityId,
        resource_id: resourceId || undefined,
        host_name: hostName.trim(),
        host_phone: hostPhone.trim() || undefined,
        sport_type: sportType,
        scheduled_date: calculatedTimes.dateStr,
        start_time: calculatedTimes.startTimeStr,
        end_time: calculatedTimes.endTimeStr,
        max_players: maxPlayers,
        skill_level: skillLevel,
        notes: notes.trim() || undefined,
        additional_players: additionalPlayers,
      })

      if (result.error) {
        setError(result.error)
      } else {
        onCreated()
        onClose()
        // Reset state
        setStep(1)
        setHostName("")
        setHostPhone("")
        setNotes("")
        setAdditionalPlayers([])
        setNewPlayerInput("")
        setSelectedSlot(null)
      }
    } catch {
      setError("Failed to create game. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Day check helpers
  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()

  const isToday = (d: Date) => isSameDay(d, new Date())
  const isTomorrow = (d: Date) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return isSameDay(d, tomorrow)
  }

  // Selected Resource Name
  const selectedResourceName = resources.find(r => r.id === resourceId)?.name || 'Any Pitch'
  const currentTotalStartingPlayers = 1 + additionalPlayers.length

  if (!isOpen) return null

  return (
    <Portal>
      <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center bg-black/70 backdrop-blur-md p-0 md:p-4" onClick={onClose}>
        <div
          className="bg-card w-full max-w-xl max-h-[92vh] flex flex-col rounded-t-[28px] md:rounded-[24px] border border-border/50 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Gradient Header Stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-emerald-400 to-teal-400 shrink-0" />

          {/* Modal Header */}
          <div className="bg-card/95 backdrop-blur-xl border-b border-border/40 px-6 py-4 flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-lg font-black tracking-tight text-foreground uppercase italic">Post Open Game</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {step === 1 ? "Step 1: Pick venue, pitch & verified time slot" : "Step 2: Set players limit, add teammates & host info"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Modal Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
            
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-500 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ═══════════════ STEP 1: VENUE, DATE & SLOTS ═══════════════ */}
            {step === 1 && (
              <div className="space-y-6">
                
                {/* 1. Sport Selector */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 block">
                    1. Select Sport
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {sports.map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setSportType(s.value)}
                        className={`h-11 rounded-xl border text-xs font-bold transition-all ${
                          sportType === s.value 
                            ? s.color + ' ring-2 ring-primary/20 shadow-xs' 
                            : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Venue Selector */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 block flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    2. Select Venue
                  </label>
                  {loadingFacilities ? (
                    <div className="h-12 rounded-xl bg-muted/30 animate-pulse border border-border/50" />
                  ) : (
                    <select
                      value={facilityId}
                      onChange={(e) => setFacilityId(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all appearance-none cursor-pointer"
                    >
                      {facilities.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 3. Pitch / Court Selector */}
                {resources.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 block flex items-center gap-1.5">
                      <Trophy className="h-3.5 w-3.5 text-primary" />
                      3. Select Pitch / Court
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {resources.map((r: any) => {
                        const isSelected = resourceId === r.id
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => { setResourceId(r.id); setSelectedSlot(null); }}
                            className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20'
                                : 'bg-muted/30 border-border/60 text-foreground hover:bg-muted/60'
                            }`}
                          >
                            <span className="block truncate">{r.name}</span>
                            <span className="text-[10px] text-muted-foreground font-normal capitalize">{r.unit_type}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Date Picker (Next 14 Days Carousel) */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                      4. Match Date
                    </label>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                    </span>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar">
                    {dateOptions.map((d, i) => {
                      const isSelected = isSameDay(d, selectedDate)
                      const today = isToday(d)
                      const tomorrow = isTomorrow(d)

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                          className={`shrink-0 flex flex-col items-center justify-center w-16 py-2.5 px-1 rounded-xl border transition-all text-center ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]' 
                              : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <span className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            {today ? 'Today' : tomorrow ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className="text-lg font-black tracking-tight leading-none mb-0.5">
                            {d.getDate()}
                          </span>
                          <span className={`text-[9px] font-semibold uppercase ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                            {d.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 5. Duration Selector */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 block flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    5. Match Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {durationOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setDuration(opt.value); setSelectedSlot(null); }}
                        className={`h-10 rounded-xl border text-xs font-bold transition-all ${
                          duration === opt.value
                            ? 'bg-primary/10 border-primary text-primary ring-1 ring-primary/20'
                            : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Available Starting Time Slots */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      6. Available Time Slots
                      {loadingAvailability && <Loader2 className="h-3 w-3 text-primary animate-spin" />}
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      {selectedSlot ? `Selected: ${selectedSlot.hour > 12 ? selectedSlot.hour - 12 : selectedSlot.hour}:${selectedSlot.minute === 0 ? '00' : '30'} ${selectedSlot.hour >= 12 ? 'PM' : 'AM'}` : 'Click a slot'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                    {timeSlots.map((slot) => {
                      const past = isSlotPast(slot.hour, slot.minute)
                      const booked = isSlotBooked(slot.hour, slot.minute, duration)
                      const isSelected = selectedSlot?.hour === slot.hour && selectedSlot?.minute === slot.minute
                      const unavailable = past || booked

                      return (
                        <button
                          key={`${slot.hour}-${slot.minute}`}
                          type="button"
                          disabled={unavailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center relative ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 ring-2 ring-primary/30 scale-[1.02]'
                              : unavailable
                                ? 'bg-muted/20 border-border/30 text-muted-foreground/30 cursor-not-allowed line-through'
                                : 'bg-card/60 border-border/70 text-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary'
                          }`}
                        >
                          <span>{slot.label}</span>
                          {booked && !past && (
                            <span className="block text-[8px] font-bold text-red-400 no-underline">Booked</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* ═══════════════ STEP 2: HOST INFO & GAME LIMITS ═══════════════ */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Summary Card */}
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-primary">
                    <span className="uppercase tracking-wider">Game Slot Summary</span>
                    <button type="button" onClick={() => setStep(1)} className="hover:underline">Edit Slot</button>
                  </div>
                  <div className="text-sm font-extrabold text-foreground">
                    {selectedFacility?.name} • {selectedResourceName}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                    <span>📅 {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span>⏰ {calculatedTimes.startTimeStr} – {calculatedTimes.endTimeStr} ({duration} mins)</span>
                  </div>
                </div>

                {/* Max Players + Skill Level */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-1">
                      <Users className="h-3 w-3 text-primary" />
                      Total Match Capacity *
                    </label>
                    <input
                      type="number"
                      min={Math.max(2, currentTotalStartingPlayers)}
                      max={30}
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(Math.max(currentTotalStartingPlayers, parseInt(e.target.value) || 10))}
                      className="w-full h-12 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                    />
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {currentTotalStartingPlayers} joined ({maxPlayers - currentTotalStartingPlayers} open spot{maxPlayers - currentTotalStartingPlayers !== 1 ? 's' : ''})
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-1">
                      <Star className="h-3 w-3 text-primary" />
                      Skill Level
                    </label>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all appearance-none cursor-pointer"
                    >
                      {skills.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Host Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                      Your Name (Host) *
                    </label>
                    <input
                      type="text"
                      required
                      value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="w-full h-12 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                      Your Phone (optional)
                    </label>
                    <input
                      type="tel"
                      value={hostPhone}
                      onChange={(e) => setHostPhone(e.target.value)}
                      placeholder="e.g. 98XXXXXXXX"
                      className="w-full h-12 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>

                {/* Host adding existing teammates / players */}
                <div className="p-4 rounded-2xl bg-card/60 border border-border/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider block flex items-center gap-1.5">
                        <UserPlus className="h-3.5 w-3.5 text-primary" />
                        Add Teammates Already With You
                      </label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Already have friends joining you? Add their names so open spots adjust automatically.
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {currentTotalStartingPlayers}/{maxPlayers}
                    </span>
                  </div>

                  {/* Input row */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPlayerInput}
                      onChange={(e) => setNewPlayerInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddPlayer()
                        }
                      }}
                      placeholder="Friend / Teammate name (e.g. Sam)"
                      className="flex-1 h-11 px-4 rounded-xl border border-border/60 bg-muted/40 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleAddPlayer}
                      disabled={!newPlayerInput.trim() || currentTotalStartingPlayers >= maxPlayers}
                      className="h-11 px-4 rounded-xl text-xs font-bold shrink-0"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Player
                    </Button>
                  </div>

                  {/* Current Starting Roster Pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {/* Host Chip */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                      <span>👑 {hostName.trim() || "You (Host)"}</span>
                    </div>

                    {/* Additional Added Players */}
                    {additionalPlayers.map((name, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/60 text-xs font-semibold text-foreground animate-in fade-in"
                      >
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePlayer(idx)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Host Notes */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Match Notes & Requirements (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Casual 5v5 game, bring dark & light shirts..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all resize-none min-h-[50px]"
                  />
                </div>

              </div>
            )}

          </div>

          {/* Modal Footer Controls */}
          <div className="bg-card/95 backdrop-blur-xl border-t border-border/40 p-5 shrink-0 flex items-center justify-between gap-3">
            {step === 1 ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 h-12 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted/60 transition-all uppercase tracking-wider"
                >
                  Cancel
                </button>

                <Button
                  variant="primary"
                  size="md"
                  disabled={!facilityId || !selectedSlot}
                  onClick={() => setStep(2)}
                  className="px-6 h-12 rounded-xl font-bold text-xs shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-40"
                >
                  <span>Continue to Host Details</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 h-12 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted/60 transition-all flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Slots</span>
                </button>

                <Button
                  variant="primary"
                  size="md"
                  disabled={submitting || !hostName.trim()}
                  onClick={handleSubmit}
                  className="px-6 h-12 rounded-xl font-bold text-xs shadow-lg shadow-primary/25 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Posting Game...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>Publish Open Game</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

        </div>
      </div>
    </Portal>
  )
}
