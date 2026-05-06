"use client"

import { useState } from "react"
import { X, Trophy, Calendar, Target, Activity } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { createTournament } from "@/lib/actions/tournament"

interface CreateTournamentModalProps {
  isOpen: boolean
  onClose: () => void
  facilityId: string
  onSuccess: () => void
}

export function CreateTournamentModal({ isOpen, onClose, facilityId, onSuccess }: CreateTournamentModalProps) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createTournament({
      facility_id: facilityId,
      name: formData.get("name") as string,
      sport: formData.get("sport") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
      format: formData.get("format") as string,
    })

    setLoading(false)
    if (result.success) {
      onSuccess()
      onClose()
    } else {
      alert(result.error || "Failed to create tournament")
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4 text-white">
      <div className="bg-[#121212] w-full max-w-xl max-h-[95vh] overflow-y-auto rounded-[32px] md:rounded-[40px] p-6 md:p-10 pb-32 md:pb-10 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300 relative custom-scrollbar">
        {/* Decorative background */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-[100px] opacity-50 pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-8 md:right-8 p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white z-20"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3 md:gap-4 mb-8">
           <div className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-primary/20 text-primary border border-primary/20 shrink-0">
              <Trophy className="h-6 w-6 md:h-8 md:w-8 text-primary fill-current opacity-80" />
           </div>
           <div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic leading-none">New Championship</h2>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-1">Found Your Legacy</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Tournament Name</label>
              <input 
                name="name"
                placeholder="e.g. Winter Warriors Cup 2026"
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-lg font-bold outline-none ring-primary/50 focus:ring-2 transition-all placeholder:text-white/10"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Sport Type</label>
                 <select 
                   name="sport"
                   className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold outline-none ring-primary/50 focus:ring-2 transition-all appearance-none"
                   required
                 >
                   <option value="Football">Footshall</option>
                   <option value="Cricket">Cricshall</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Event Format</label>
                 <select 
                   name="format"
                   className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold outline-none ring-primary/50 focus:ring-2 transition-all appearance-none"
                   required
                 >
                   <option value="Knockout">Knockout</option>
                   <option value="Round Robin">Round Robin</option>
                   <option value="Group + Knockout">Group + Knockout</option>
                 </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Start Date</label>
                 <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input 
                      type="date"
                      name="start_date"
                      className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-sm font-bold outline-none ring-primary/50 focus:ring-2 transition-all [color-scheme:dark]"
                      required
                    />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">End Date</label>
                 <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input 
                      type="date"
                      name="end_date"
                      className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-sm font-bold outline-none ring-primary/50 focus:ring-2 transition-all [color-scheme:dark]"
                      required
                    />
                 </div>
               </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="ghost" className="flex-1 h-16 rounded-[24px] font-black uppercase tracking-widest text-xs border border-white/5 hover:bg-white/5" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-2 h-16 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20" disabled={loading}>
              {loading ? "Creating Championship..." : "Initialize Tournament"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
