"use client"

import { useState, useEffect } from "react"
import { Plus, LandPlot, Trash2, Edit2, Search, Loader2, DollarSign, Activity, Settings2, Target, ChevronDown } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/utils"
import { useSession } from "next-auth/react"
import Cookies from "js-cookie"
import { fetchResourceUnits, createResourceUnit, deleteResourceUnit, updateResourceUnit } from "@/lib/actions/resources"
import { useSport } from "@/components/providers/SportProvider"
import { ArtisanSelect } from "@/components/ui/ArtisanSelect"
import { Toast, ToastType } from "@/components/ui/Toast"

export default function ResourcesPage() {
  const { data: session } = useSession()
  const { sport, facilityId } = useSport()
  
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null)
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    base_price: "",
    unit_type: "court",
    custom_pricing: [] as { startTime: string; endTime: string; price: string; days: number[] }[]
  })

  const DAYS_OF_WEEK = [
    { label: 'Su', value: 0 },
    { label: 'Mo', value: 1 },
    { label: 'Tu', value: 2 },
    { label: 'We', value: 3 },
    { label: 'Th', value: 4 },
    { label: 'Fr', value: 5 },
    { label: 'Sa', value: 6 },
  ]

  useEffect(() => {
    if (session?.user && facilityId) {
        loadResources()
    }
  }, [session, facilityId])

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type })
  }

  const loadResources = async () => {
    if (!facilityId) return
    setLoading(true)
    const data = await fetchResourceUnits(facilityId)
    setResources(data || [])
    setLoading(false)
  }

  const handleOpenModal = () => {
    // Default to 'pitch' if footshall, 'net' if cricshall, 'court' if both/empty
    const defaultType = sport === 'footshall' ? 'pitch' : (sport === 'cricshall' ? 'net' : 'court')
    setFormData({ name: "", base_price: "", unit_type: defaultType, custom_pricing: [] })
    setEditingResourceId(null)
    setIsModalOpen(true)
  }

  const handleEdit = (resource: any) => {
    setFormData({
      name: resource.name,
      base_price: String(resource.base_price),
      unit_type: resource.unit_type || 'court',
      custom_pricing: (resource.custom_pricing || []).map((r: any) => ({
        startTime: r.startTime || '17:00',
        endTime: r.endTime || '19:00',
        price: String(r.price || ''),
        days: Array.isArray(r.days) ? r.days : [0,1,2,3,4,5,6]
      }))
    })
    setEditingResourceId(resource.id)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!facilityId) {
        showToast("Session Error: Facility ID not found. Please refresh.", "error")
        return
    }

    setIsSaving(true)
    try {
      const payload = {
        name: formData.name,
        base_price: parseFloat(formData.base_price) || 0,
        unit_type: formData.unit_type,
        custom_pricing: formData.custom_pricing.map(r => ({
          startTime: r.startTime,
          endTime: r.endTime,
          price: parseFloat(r.price) || 0,
          days: r.days || [0,1,2,3,4,5,6]
        }))
      }

      const result = editingResourceId
        ? await updateResourceUnit(editingResourceId, payload, facilityId)
        : await createResourceUnit(payload, facilityId)

      if (result.success) {
        showToast(editingResourceId ? "Resource updated successfully" : "Resource created successfully")
        await loadResources()
        setIsModalOpen(false)
        setEditingResourceId(null)
      } else {
        showToast(result.error || "Failed to save resource", "error")
      }
    } catch (error) {
       showToast("An unexpected error occurred", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!facilityId) return

    if (!confirm("Are you sure you want to delete this resource unit? This will disable future bookings for this unit.")) return
    
    // We visually remove it instantly for snappy UI
    setResources(resources.filter(r => r.id !== id))
    
    const result = await deleteResourceUnit(id, facilityId)
    if (result.success) {
      showToast("Resource removed")
    } else {
      showToast(result.error || "Failed to delete resource", "error")
      loadResources() // Revert if failed
    }
  }

  const filteredResources = resources.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8] mb-2">Resources</h1>
          <p className="text-muted-foreground font-medium text-sm tracking-tight opacity-80 uppercase">Manage your fields, courts, and pitches</p>
        </div>
        <Button 
          onClick={handleOpenModal}
          className="h-16 px-8 rounded-[24px] bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add New Court
        </Button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-8 rounded-[32px] bg-card/40 border-border/50 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <LandPlot className="h-32 w-32" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Total Units</p>
            <p className="text-4xl font-black italic tracking-tighter">{resources.length}</p>
         </Card>
         <Card className="p-8 rounded-[32px] bg-card/40 border-border/50 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <Target className="h-32 w-32" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Facility Capacity</p>
            <p className="text-4xl font-black italic tracking-tighter">{resources.length} <span className="text-xl">Active</span></p>
         </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            placeholder="Search courts or fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card/50 border border-border/50 p-5 pl-14 rounded-[24px] text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
             <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-[32px]" />
          ))
        ) : filteredResources.length === 0 ? (
          <div className="col-span-full py-32 text-center opacity-50 space-y-4 border-2 border-dashed border-border rounded-[40px]">
             <LandPlot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
             <p className="text-3xl font-black italic uppercase tracking-tighter">No Active Resources</p>
             <p className="text-xs font-bold uppercase tracking-widest">Add your first court or pitch to start accepting bookings.</p>
          </div>
        ) : (
          filteredResources.map((resource) => (
            <Card key={resource.id} className="p-8 rounded-[32px] bg-card/40 border-border/50 backdrop-blur-xl group hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 shadow-xl hover:shadow-primary/5">
              <div className="flex justify-between items-start mb-6">
                <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <LandPlot className="h-6 w-6" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(resource)}
                    className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors text-primary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(resource.id)}
                    className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{resource.unit_type || 'Court'}</p>
                <h3 className="text-2xl font-black tracking-tight">{resource.name}</h3>
              </div>
              <div className="flex justify-between items-end border-t border-border/50 pt-6">
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Base Price / Hr</p>
                   <p className="text-xl font-black italic tracking-tighter text-foreground">{formatCurrency(resource.base_price)}</p>
                </div>
                {resource.custom_pricing && resource.custom_pricing.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 opacity-80 mb-1">Peak Hours</p>
                    <p className="text-sm font-black italic text-amber-500">{resource.custom_pricing.length} Active</p>
                  </div>
                )}
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                   Active Map
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-300">
           <Card className="bg-card w-full md:max-w-lg rounded-t-[32px] md:rounded-[40px] border border-border/50 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 md:zoom-in duration-500">
              <div className="relative h-24 md:h-32 bg-primary/10 flex items-center px-6 md:px-10 border-b border-border/20">
                 <div className="absolute top-0 right-0 p-6 opacity-10">
                    <LandPlot className="h-32 w-32 -rotate-12" />
                 </div>
                 <div>
                   <h3 className="relative z-10 text-3xl font-black tracking-tighter italic uppercase text-foreground leading-none">
                       {editingResourceId ? 'Edit Resource' : 'Add Resource'}
                    </h3>
                    <p className="relative z-10 text-[10px] font-black uppercase tracking-widest text-primary mt-2">{editingResourceId ? 'Update playing area details' : 'Create new playing area'}</p>
                 </div>
              </div>

              <form onSubmit={handleSave} className="p-6 md:p-10 space-y-5 md:space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Area Name (e.g. Futsal Court A)</label>
                    <input 
                       required
                       value={formData.name}
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                       placeholder="Central Turf A"
                       className="w-full h-14 bg-muted/30 border border-border/50 rounded-2xl px-6 text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all font-sans"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hourly Base Price</label>
                       <input 
                          required
                          type="number"
                          value={formData.base_price}
                          onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                          placeholder="0.00"
                          className="w-full h-14 bg-muted/30 border border-border/50 rounded-2xl px-6 text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all font-sans"
                       />
                    </div>
                     <ArtisanSelect 
                        label="Type"
                        value={formData.unit_type}
                        onChange={(val) => setFormData({...formData, unit_type: val})}
                        options={[
                          ...((!sport || sport === 'footshall') ? [
                            { value: "pitch", label: "Futsal Pitch" },
                            { value: "court", label: "Indoor Court" },
                            { value: "field", label: "Grass Field" },
                            { value: "hall", label: "Indoor Hall" },
                          ] : []),
                          ...((!sport || sport === 'cricshall') ? [
                            { value: "net", label: "Cricket Net" },
                            { value: "lane", label: "Practice Lane" },
                          ] : [])
                        ]}
                     />
                 </div>

                 <div className="space-y-4 pt-4">
                     <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Custom Peak Pricing (Optional)</label>
                        <Button
                           type="button"
                           variant="outline"
                           onClick={() => setFormData({...formData, custom_pricing: [...formData.custom_pricing, { startTime: "17:00", endTime: "19:00", price: "", days: [0,1,2,3,4,5,6] }]})}
                           className="h-8 rounded-xl text-[10px] uppercase font-black tracking-widest px-4"
                        >
                           <Plus className="h-3 w-3 mr-2" /> Add Rule
                        </Button>
                     </div>
                     {formData.custom_pricing.map((rule, idx) => (
                        <div key={idx} className="bg-muted/20 p-3 rounded-2xl border border-border/50">
                           <div className="flex gap-2 items-center">
                              <div className="flex-1">
                              <label className="text-[8px] font-black uppercase text-muted-foreground mb-1 block">Start Time</label>
                              <input 
                                 type="time" 
                                 value={rule.startTime}
                                 onChange={(e) => {
                                    const newRules = [...formData.custom_pricing]
                                    newRules[idx].startTime = e.target.value
                                    setFormData({...formData, custom_pricing: newRules})
                                 }}
                                 className="w-full h-10 bg-background border border-border/50 rounded-xl px-3 text-xs font-bold outline-none focus:ring-2 ring-primary/20"
                              />
                           </div>
                           <div className="flex-1">
                              <label className="text-[8px] font-black uppercase text-muted-foreground mb-1 block">End Time</label>
                              <input 
                                 type="time" 
                                 value={rule.endTime}
                                 onChange={(e) => {
                                    const newRules = [...formData.custom_pricing]
                                    newRules[idx].endTime = e.target.value
                                    setFormData({...formData, custom_pricing: newRules})
                                 }}
                                 className="w-full h-10 bg-background border border-border/50 rounded-xl px-3 text-xs font-bold outline-none focus:ring-2 ring-primary/20"
                              />
                           </div>
                           <div className="flex-1">
                              <label className="text-[8px] font-black uppercase text-muted-foreground mb-1 block">Price / Hr</label>
                              <input 
                                 type="number" 
                                 placeholder="1500"
                                 value={rule.price}
                                 onChange={(e) => {
                                    const newRules = [...formData.custom_pricing]
                                    newRules[idx].price = e.target.value
                                    setFormData({...formData, custom_pricing: newRules})
                                 }}
                                 className="w-full h-10 bg-background border border-border/50 rounded-xl px-3 text-xs font-bold outline-none focus:ring-2 ring-primary/20"
                              />
                           </div>
                           <button
                              type="button"
                              onClick={() => {
                                 const newRules = formData.custom_pricing.filter((_, i) => i !== idx)
                                 setFormData({...formData, custom_pricing: newRules})
                              }}
                              className="h-10 w-10 mt-4 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shrink-0"
                           >
                              <Trash2 className="h-4 w-4" />
                           </button>
                        </div>
                        <div className="flex gap-1 mt-2 px-1">
                           {DAYS_OF_WEEK.map(day => {
                              const isSelected = rule.days.includes(day.value)
                              return (
                                 <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => {
                                       const newRules = [...formData.custom_pricing]
                                       if (isSelected) {
                                          newRules[idx].days = rule.days.filter(d => d !== day.value)
                                       } else {
                                          newRules[idx].days = [...rule.days, day.value]
                                       }
                                       setFormData({...formData, custom_pricing: newRules})
                                    }}
                                    className={`h-6 w-6 rounded-full text-[8px] font-black transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground border border-border/50 hover:bg-muted'}`}
                                 >
                                    {day.label}
                                 </button>
                              )
                           })}
                        </div>
                     </div>
                     ))}
                  </div>

                 <div className="flex gap-4 pt-6 mt-6 border-t border-border/50">
                    <Button 
                       type="button"
                       variant="ghost" 
                       onClick={() => { setIsModalOpen(false); setEditingResourceId(null); }}
                       className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs border border-border/50"
                    >
                       Cancel
                    </Button>
                    <Button 
                       type="submit"
                       disabled={isSaving}
                       className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                    >
                       {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingResourceId ? "Update Area" : "Save Area")}
                    </Button>
                 </div>
              </form>
           </Card>
        </div>
      )}
      {/* Toast Feedback */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  )
}
