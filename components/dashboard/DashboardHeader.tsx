"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Plus } from "lucide-react"
import { useSport } from "@/components/providers/SportProvider"
import { AddResourceModal } from "@/components/booking/AddResourceModal"

export function DashboardHeader({ name }: { name: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { sport } = useSport()

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
           <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-widest border border-primary/20">
             {sport} Mode
           </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tighter">Welcome, {name} 👋</h1>
        <p className="text-muted-foreground font-medium text-sm">Your {sport === 'footshall' ? 'football pitch' : 'cricket nets'} are performing at peak efficiency.</p>
      </div>
      <div className="flex items-center gap-3">
         <Button 
            variant="black" 
            className="rounded-2xl px-6 gap-2 w-full sm:w-auto"
            onClick={() => setIsModalOpen(true)}
         >
            <Plus className="h-4 w-4" />
            Add Resource
         </Button>
         <AddResourceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  )
}
