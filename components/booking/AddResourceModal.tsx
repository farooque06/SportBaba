"use client"

import { createResourceUnit } from "@/lib/actions/resources"
import { Button } from "@/components/ui/Button"
import { useState } from "react"
import { useSport } from "@/components/providers/SportProvider"
import { useRouter } from "next/navigation"
import { X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

export function AddResourceModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { facilityId } = useSport()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!facilityId) {
      setError("No facility found. Please reload the page.")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      const result = await createResourceUnit({
        name: formData.get("name") as string,
        unit_type: formData.get("unit_type") as string,
        base_price: parseFloat(formData.get("base_price") as string) || 0
      }, facilityId)

      if (result?.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      router.refresh()
      onClose()
    } catch (err: any) {
      setError(err?.message || "Failed to add resource. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md p-0 md:p-4" onClick={onClose}>
      <div 
        className="bg-card w-full md:max-w-md rounded-t-[28px] md:rounded-[32px] border border-border/40 shadow-2xl animate-in slide-in-from-bottom-5 md:zoom-in-95 duration-500 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="md:hidden flex justify-center pt-3"><div className="h-1 w-10 rounded-full bg-foreground/10" /></div>

        {/* Header */}
        <div className="px-6 md:px-8 pt-5 md:pt-8 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl md:text-2xl font-black tracking-tighter">Add New Resource</h2>
            <button onClick={onClose} className="h-8 w-8 rounded-xl bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-muted-foreground text-xs font-medium">Define a new pitch or net for your facility.</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-6 md:mx-8 mb-3 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 md:px-8 pb-6 md:pb-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Resource Name</label>
            <input 
              name="name" 
              placeholder="e.g. Main Pitch A" 
              className="w-full bg-muted/40 border border-border/30 p-3.5 rounded-xl text-sm font-bold outline-none ring-primary/20 focus:ring-4 focus:border-primary/40 transition-all placeholder:text-muted-foreground/40"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Hourly Rate (NRS)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary/60 uppercase tracking-widest">NRS</span>
              <input
                name="base_price"
                type="number"
                placeholder="e.g. 1500"
                required
                className="w-full bg-muted/40 border border-border/30 p-3.5 pl-14 rounded-xl text-sm font-bold outline-none ring-primary/20 focus:ring-4 focus:border-primary/40 transition-all placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Type</label>
            <div className="grid grid-cols-2 gap-2.5">
               <label className="has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-primary/30 has-[:checked]:shadow-lg has-[:checked]:shadow-primary/10 bg-muted/30 border border-border/30 p-3.5 rounded-xl text-center cursor-pointer text-xs font-black uppercase tracking-widest transition-all active:scale-[0.97]">
                  <input type="radio" name="unit_type" value="pitch" className="sr-only" defaultChecked />
                  ⚽ Football Pitch
               </label>
               <label className="has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-primary/30 has-[:checked]:shadow-lg has-[:checked]:shadow-primary/10 bg-muted/30 border border-border/30 p-3.5 rounded-xl text-center cursor-pointer text-xs font-black uppercase tracking-widest transition-all active:scale-[0.97]">
                  <input type="radio" name="unit_type" value="net" className="sr-only" />
                  🏏 Cricket Net
               </label>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px]" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-[2] h-12 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:shadow-xl active:scale-[0.97] transition-all disabled:opacity-50" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Resource"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
