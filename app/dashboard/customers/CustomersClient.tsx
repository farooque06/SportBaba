"use client"

import { Search, Users, Phone, Mail, Calendar, TrendingUp, Star, Clock, X, MapPin, CreditCard, UserPlus, Save, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/utils"
import { fetchCustomerProfile, upsertCustomer } from "@/lib/actions/customers"
import { LoyaltyBadge } from "@/components/ui/LoyaltyBadge"
import { Toast, ToastType } from "@/components/ui/Toast"
import { useState } from "react"

interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  notes?: string
  total_visits: number
  total_spent: number
  last_visit?: string
  created_at: string
}

export function CustomersClient({ initialCustomers, facilityId }: { initialCustomers: Customer[], facilityId: string }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  // Create Customer State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null)

  const showToast = (message: string, type: ToastType = "success") => setToast({ message, type })

  const handleCreateCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCreating(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      notes: formData.get("notes") as string
    }

    const result = await upsertCustomer(facilityId, data)
    if (result.success) {
      showToast("Customer profile created successfully.")
      setIsCreateOpen(false)
      // Small delay to allow revalidation to kick in before a potential manual refresh
      setTimeout(() => window.location.reload(), 500)
    } else {
      showToast(result.error || "Failed to create profile.", "error")
    }
    setIsCreating(false)
  }

  const filtered = initialCustomers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Top customers by visits
  const topByVisits = [...initialCustomers].sort((a, b) => b.total_visits - a.total_visits).slice(0, 5)
  const topBySpend = [...initialCustomers].sort((a, b) => Number(b.total_spent) - Number(a.total_spent)).slice(0, 5)

  const handleViewProfile = async (customer: Customer) => {
    setLoadingProfile(true)
    setSelectedCustomer(customer) // show basic info immediately
    const full = await fetchCustomerProfile(customer.id)
    if (full) setSelectedCustomer(full)
    setLoadingProfile(false)
  }

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Never"
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    return `${Math.floor(days / 30)}mo ago`
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tighter">Customers</h1>
          <p className="text-muted-foreground font-medium text-sm">Track your regulars, their visits, and spending patterns.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all gap-3"
          >
            <UserPlus className="h-4 w-4" />
            Add Customer
          </Button>
          <div className="px-4 py-2 rounded-2xl bg-primary/10 text-primary border border-primary/20 hidden sm:block">
            <span className="text-[10px] font-black uppercase tracking-widest">{initialCustomers.length} Total</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10"><Users className="h-4 w-4 text-primary" /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</p>
          </div>
          <p className="text-2xl font-black">{initialCustomers.length}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-green-500/10"><TrendingUp className="h-4 w-4 text-green-500" /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Revenue</p>
          </div>
          <p className="text-2xl font-black">{formatCurrency(initialCustomers.reduce((s, c) => s + Number(c.total_spent), 0))}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-500/10"><Calendar className="h-4 w-4 text-blue-500" /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visits</p>
          </div>
          <p className="text-2xl font-black">{initialCustomers.reduce((s, c) => s + (c.total_visits || 0), 0)}</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-amber-500/10"><Star className="h-4 w-4 text-amber-500" /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Repeat Rate</p>
          </div>
          <p className="text-2xl font-black">
            {initialCustomers.length > 0
              ? `${Math.round((initialCustomers.filter(c => c.total_visits > 1).length / initialCustomers.length) * 100)}%`
              : '0%'}
          </p>
        </Card>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 bg-card border-border rounded-[24px]">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-amber-500" /> Top by Visits
          </h3>
          <div className="space-y-2">
            {topByVisits.map((c, i) => (
              <div key={c.id} onClick={() => handleViewProfile(c)} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors">
                <span className={`text-xs font-black w-5 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-muted-foreground'}`}>#{i + 1}</span>
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">{c.name?.[0]?.toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold truncate">{c.name}</p>
                    <LoyaltyBadge visits={c.total_visits} />
                  </div>
                </div>
                <span className="text-xs font-black text-primary">{c.total_visits} visits</span>
              </div>
            ))}
            {topByVisits.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No customers yet</p>}
          </div>
        </Card>

        <Card className="p-5 bg-card border-border rounded-[24px]">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" /> Top by Revenue
          </h3>
          <div className="space-y-2">
            {topBySpend.map((c, i) => (
              <div key={c.id} onClick={() => handleViewProfile(c)} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors">
                <span className={`text-xs font-black w-5 ${i === 0 ? 'text-green-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-green-700' : 'text-muted-foreground'}`}>#{i + 1}</span>
                <div className="h-8 w-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center font-black text-xs">{c.name?.[0]?.toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold truncate">{c.name}</p>
                    <LoyaltyBadge visits={c.total_visits} />
                  </div>
                </div>
                <span className="text-xs font-black text-green-600">{formatCurrency(c.total_spent)}</span>
              </div>
            ))}
            {topBySpend.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No customers yet</p>}
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          placeholder="Search customers by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-card/50 border border-border/50 p-4 pl-14 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all backdrop-blur-sm"
        />
      </div>

      {/* Customer List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-16 text-center border-dashed bg-transparent flex flex-col items-center justify-center gap-4 opacity-50">
            <Users className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-xl font-black italic uppercase tracking-tighter">No customers found</p>
              <p className="text-xs font-bold uppercase tracking-widest">Customers are auto-created when bookings include a phone number</p>
            </div>
          </Card>
        ) : (
          filtered.map((customer) => (
            <div
              key={customer.id}
              onClick={() => handleViewProfile(customer)}
              className="group relative bg-card/40 hover:bg-card/60 border border-border/50 hover:border-primary/30 p-4 sm:p-5 rounded-[24px] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm hover:shadow-xl hover:shadow-primary/5 active:scale-[0.99] duration-300"
            >
              {/* Avatar */}
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-inner shrink-0">
                <span className="text-lg font-black text-primary">{customer.name?.[0]?.toUpperCase()}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-black tracking-tight leading-none">{customer.name}</h4>
                  <LoyaltyBadge visits={customer.total_visits} />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold">
                  {customer.phone && (
                    <a href={`tel:${customer.phone}`} className="flex items-center gap-1 hover:text-primary hover:underline transition-colors" onClick={(e) => e.stopPropagation()}>
                      <Phone className="h-3 w-3" /> {customer.phone}
                    </a>
                  )}
                  {customer.email && <span className="flex items-center gap-1 hidden sm:flex"><Mail className="h-3 w-3" /> {customer.email}</span>}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">{customer.total_visits} visits</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20">
                  <span className="text-[9px] font-black uppercase tracking-widest text-green-500">{formatCurrency(customer.total_spent)}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-muted/50 border border-border hidden sm:block">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{formatTimeAgo(customer.last_visit)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-lg max-h-[min(850px,92vh)] rounded-[32px] border border-border/50 shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-5 duration-500 flex flex-col">
            {/* Header */}
            <div className="relative h-32 shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-end px-8 pb-5 border-b border-border/20">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-xl bg-card/80 backdrop-blur-sm flex items-center justify-center border border-border hover:bg-card transition-colors z-10"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-card flex items-center justify-center text-primary shadow-xl border border-primary/20">
                  <span className="text-2xl font-black">{selectedCustomer.name?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-black tracking-tighter leading-none">{selectedCustomer.name}</h3>
                    <LoyaltyBadge visits={selectedCustomer.total_visits} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold">
                    {selectedCustomer.phone && (
                      <a href={`tel:${selectedCustomer.phone}`} className="flex items-center gap-1 hover:text-primary hover:underline transition-colors">
                        <Phone className="h-3 w-3" /> {selectedCustomer.phone}
                      </a>
                    )}
                    {selectedCustomer.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedCustomer.email}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 p-5 border-b border-border/20">
              <div className="text-center p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <p className="text-xl font-black text-blue-500">{selectedCustomer.total_visits || 0}</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Visits</p>
              </div>
              <div className="text-center p-3 rounded-2xl bg-green-500/5 border border-green-500/10">
                <p className="text-xl font-black text-green-500">{formatCurrency(selectedCustomer.total_spent || 0)}</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Total Spent</p>
              </div>
              <div className="text-center p-3 rounded-2xl bg-muted/30 border border-border">
                <p className="text-xl font-black">{formatTimeAgo(selectedCustomer.last_visit)}</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Last Visit</p>
              </div>
            </div>

            {/* Booking History */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Booking History</h4>
              {loadingProfile ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : selectedCustomer.bookings?.length > 0 ? (
                selectedCustomer.bookings.map((b: any) => (
                  <div key={b.id} className="p-3 rounded-xl bg-muted/20 border border-border/50 flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${b.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                        b.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                          'bg-blue-500/10 text-blue-500'
                      }`}>
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{b.resource?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {new Date(b.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black">{formatCurrency(b.total_price)}</p>
                      <p className={`text-[8px] font-black uppercase tracking-widest ${b.payment_status === 'paid' ? 'text-green-500' :
                          b.payment_status === 'partial' ? 'text-amber-500' :
                            'text-red-500'
                        }`}>{b.payment_status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 opacity-50">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs font-bold text-muted-foreground">No booking history yet</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/20 bg-muted/20">
              <p className="text-[9px] font-bold text-muted-foreground text-center">
                Customer since {new Date(selectedCustomer.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Quick Add Customer Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300 shadow-2xl" onClick={() => setIsCreateOpen(false)}>
          <div className="bg-card w-full max-w-md rounded-[40px] border border-border/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500" onClick={(e) => e.stopPropagation()}>
            <div className="p-10 text-center border-b border-border/10 bg-gradient-to-br from-primary/10 to-transparent">
              <div className="h-24 w-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-xl mx-auto">
                <UserPlus className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-4xl font-black tracking-tight italic uppercase mb-2 leading-none">Quick Register <br /> Player</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-4">Manual registration for regulars & elite players.</p>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Full Name</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. John Wick"
                  className="w-full bg-muted/40 border border-border/50 rounded-2xl h-14 px-5 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Phone Number</label>
                  <input
                    name="phone"
                    required
                    placeholder="98********"
                    className="w-full bg-muted/40 border border-border/50 rounded-2xl h-14 px-5 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Email (Opt)</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="player@pro.com"
                    className="w-full bg-muted/40 border border-border/50 rounded-2xl h-14 px-5 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Notes</label>
                <textarea
                  name="notes"
                  placeholder="Player preferences, skill level, etc..."
                  className="w-full bg-muted/40 border border-border/50 rounded-2xl h-24 px-5 py-4 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full h-18 text-xl rounded-3xl font-black uppercase tracking-[0.1em] italic bg-primary shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all gap-4"
                >
                  {isCreating ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                    <div className="flex items-center gap-3">
                      <Save className="h-5 w-5" />
                      Register Player
                    </div>
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="w-full h-12 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
