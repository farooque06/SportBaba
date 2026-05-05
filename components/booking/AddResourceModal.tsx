"use client"

import Cookies from "js-cookie"
import { createResourceUnit } from "@/lib/actions/resources"
import { Button } from "@/components/ui/Button"
import { useState } from "react"

export function AddResourceModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const facilityId = Cookies.get("active_facility_id")
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!facilityId) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await createResourceUnit({
      name: formData.get("name") as string,
      unit_type: formData.get("unit_type") as string,
      base_price: parseFloat(formData.get("base_price") as string) || 0
    }, facilityId)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-[32px] p-8 border border-border shadow-2xl animate-in fade-in zoom-in duration-300">
        <h2 className="text-3xl font-black tracking-tighter mb-2 text-foreground">Add New Resource</h2>
        <p className="text-muted-foreground text-sm font-medium mb-8">Define a new pitch or net for your facility.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Resource Name</label>
            <input 
              name="name" 
              placeholder="e.g. Main Pitch A" 
              className="w-full bg-muted border-none p-4 rounded-2xl text-lg font-bold outline-none ring-primary focus:ring-2 transition-all"
              required
            />
          </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Hourly Rate (NRS)</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">NRS</span>
                <input
                  name="base_price"
                  type="number"
                  placeholder="e.g. 1500"
                  required
                  className="w-full bg-muted border border-border p-4 pl-16 rounded-2xl text-sm font-bold outline-none ring-primary focus:ring-2 transition-all"
                />
              </div>
            </div>


          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Type</label>

            <div className="grid grid-cols-2 gap-3">
               <label className="has-[:checked]:bg-primary has-[:checked]:text-primary-foreground bg-muted p-4 rounded-2xl text-center cursor-pointer font-bold transition-all">
                  <input type="radio" name="unit_type" value="pitch" className="sr-only" defaultChecked />
                  Football Pitch
               </label>
               <label className="has-[:checked]:bg-primary has-[:checked]:text-primary-foreground bg-muted p-4 rounded-2xl text-center cursor-pointer font-bold transition-all">
                  <input type="radio" name="unit_type" value="net" className="sr-only" />
                  Cricket Net
               </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" className="flex-1 rounded-2xl" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1 rounded-2xl" disabled={loading}>
              {loading ? "Adding..." : "Add Resource"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
