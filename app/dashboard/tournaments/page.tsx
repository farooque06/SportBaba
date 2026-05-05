"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Cookies from "js-cookie"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Trophy, Plus, Calendar, Users, MapPin, Clock, Loader2, Play, CheckCircle2 } from "lucide-react"
import { fetchTournaments, updateTournamentStatus } from "@/lib/actions/tournament"
import { CreateTournamentModal } from "@/components/tournament/CreateTournamentModal"

export default function TournamentsPage() {
  const { data: session } = useSession()
  const facilityId = Cookies.get("active_facility_id")
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadTournaments = async () => {
    if (!facilityId) {
        setLoading(false)
        return
    }
    const data = await fetchTournaments(facilityId)
    setTournaments(data)
    setLoading(false)
  }

  useEffect(() => {
    if (session?.user) {
        loadTournaments()
    }
  }, [session, facilityId])

  const handleStatusUpdate = async (id: string, newStatus: any) => {
    const result = await updateTournamentStatus(id, newStatus)
    if (result.success) {
       loadTournaments()
    } else {
       alert("Error updating status: " + result.error)
    }
  }

  const filtered = filter === "all"
    ? tournaments
    : tournaments.filter((t) => t.status === filter)

  if (loading) return (
     <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
     </div>
  )

  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-500",
    upcoming: "bg-blue-500/10 text-blue-500",
    completed: "bg-muted text-muted-foreground",
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8] mb-2">Tournaments</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] opacity-70">League & Championship Management</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsModalOpen(true)}
          className="h-14 px-8 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl flex items-center justify-center gap-3 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform" />
          <Plus className="h-4 w-4" />
          New Tournament
        </Button>
      </div>

      <div className="flex gap-2">
        {["all", "upcoming", "active", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filter === tab
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filtered.map((tournament) => (
          <Card key={tournament.id} className="p-6 bg-card border-border hover:border-primary/50 transition-all group relative overflow-hidden flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="flex flex-col items-end gap-2">
                 <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${statusColors[tournament.status]}`}>
                   {tournament.status}
                 </span>
              </div>
            </div>

            <h3 className="text-2xl font-black tracking-tighter uppercase mb-1 line-clamp-1">{tournament.name}</h3>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-6">{tournament.sport} · {tournament.format}</p>

            <div className="space-y-4 text-sm mb-8 flex-1">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase">Teams Joined</span>
                </div>
                <span className="font-black text-primary">{tournament.tournament_teams?.[0]?.count || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground px-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">{new Date(tournament.start_date).toLocaleDateString()} — {new Date(tournament.end_date).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Quick Lifecycle Action */}
            <div className="pt-4 border-t border-border">
               {tournament.status === 'upcoming' && (
                  <Button 
                    variant="primary" 
                    onClick={() => handleStatusUpdate(tournament.id, 'active')}
                    className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    Start Tournament
                  </Button>
               )}
               {tournament.status === 'active' && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleStatusUpdate(tournament.id, 'completed')}
                    className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 bg-green-500/5 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Complete Season
                  </Button>
               )}
               {tournament.status === 'completed' && (
                  <div className="text-center py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                     Official Record Logged
                  </div>
               )}
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-[40px]">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground/30 mb-6" />
          <h3 className="text-2xl font-black tracking-tighter uppercase italic">No {filter !== 'all' ? filter : ''} Events</h3>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Start your championship legacy today</p>
        </div>
      )}

      <CreateTournamentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        facilityId={facilityId as string}
        onSuccess={loadTournaments}
      />
    </div>
  )
}
