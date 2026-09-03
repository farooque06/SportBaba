"use client"

import { useState, useMemo, useEffect } from "react"
import { 
  Plus, Minus, Trash2, CheckCircle2, User, Phone, 
  Clock, MapPin, DollarSign, CreditCard, Banknote, QrCode, 
  Sparkles, Loader2, RefreshCw, Printer, AlertCircle, ShoppingBag, ShieldCheck, Check
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { processWalkInPosCheckout, PosWalkInItem } from "@/lib/actions/pos"
import { Toast, ToastType } from "@/components/ui/Toast"

interface Resource {
  id: string;
  name: string;
  unit_type: string;
  base_price: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
}

interface CustomerOption {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface PosInterfaceProps {
  facilityId: string;
  resources: Resource[];
  products: Product[];
  customers: CustomerOption[];
}

export function PosInterface({
  facilityId,
  resources,
  products,
  customers
}: PosInterfaceProps) {
  // ─── POS State ───
  const [selectedResource, setSelectedResource] = useState<Resource | null>(resources[0] || null)
  const [durationMinutes, setDurationMinutes] = useState<number>(60) // 30, 60, 90, 120
  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [notes, setNotes] = useState("")
  
  // Cart Items (Add-ons / drinks / equipment)
  const [cart, setCart] = useState<{ [productId: string]: PosWalkInItem }>({})
  const [productCategoryFilter, setProductCategoryFilter] = useState("all")

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr' | 'esewa' | 'khalti' | 'card' | 'split'>('cash')
  const [paidAmountMode, setPaidAmountMode] = useState<'full' | 'partial' | 'unpaid'>('full')
  const [customPaidAmount, setCustomPaidAmount] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [completedOrder, setCompletedOrder] = useState<any | null>(null)

  // ─── Calculations ───
  const courtPrice = useMemo(() => {
    if (!selectedResource) return 0
    return Math.round(Number(selectedResource.base_price) * (durationMinutes / 60))
  }, [selectedResource, durationMinutes])

  const cartItemsList = useMemo(() => Object.values(cart), [cart])

  const addOnsTotal = useMemo(() => {
    return cartItemsList.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }, [cartItemsList])

  const grandTotal = courtPrice + addOnsTotal

  const calculatedPaidAmount = useMemo(() => {
    if (paidAmountMode === 'full') return grandTotal
    if (paidAmountMode === 'unpaid') return 0
    return parseFloat(customPaidAmount) || 0
  }, [paidAmountMode, grandTotal, customPaidAmount])

  const remainingDue = Math.max(0, grandTotal - calculatedPaidAmount)

  // ─── Add/Remove Item in Cart ───
  const addItemToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev[p.id]
      if (existing) {
        return {
          ...prev,
          [p.id]: { ...existing, quantity: existing.quantity + 1 }
        }
      }
      return {
        ...prev,
        [p.id]: {
          id: p.id,
          name: p.name,
          price: Number(p.price) || 0,
          quantity: 1,
          category: p.category
        }
      }
    })
  }

  const decrementCartItem = (productId: string) => {
    setCart(prev => {
      const existing = prev[productId]
      if (!existing) return prev
      if (existing.quantity <= 1) {
        const next = { ...prev }
        delete next[productId]
        return next
      }
      return {
        ...prev,
        [productId]: { ...existing, quantity: existing.quantity - 1 }
      }
    })
  }

  const removeCartItem = (productId: string) => {
    setCart(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  // ─── Quick Fill Returning Customer ───
  const handleSelectCustomer = (c: CustomerOption) => {
    setGuestName(c.name)
    setGuestPhone(c.phone)
  }

  // ─── Process Order ───
  const handleCheckout = async () => {
    if (!selectedResource) {
      setToast({ message: "Please select a court / pitch.", type: "error" })
      return
    }

    setLoading(true)
    try {
      const now = new Date()
      const res = await processWalkInPosCheckout(
        {
          resource_id: selectedResource.id,
          guest_name: guestName.trim() || "Walk-in Guest",
          guest_phone: guestPhone.trim() || undefined,
          start_time: now.toISOString(),
          duration_minutes: durationMinutes,
          items: cartItemsList,
          payment_method: paymentMethod,
          paid_amount: calculatedPaidAmount,
          notes: notes.trim() || undefined
        },
        facilityId
      )

      if (res.success) {
        setCompletedOrder({
          booking: res.booking,
          breakdown: res.breakdown,
          items: cartItemsList,
          court: selectedResource,
          guestName: guestName.trim() || "Walk-in Guest",
          guestPhone: guestPhone.trim() || "—",
          durationMinutes,
          startTime: now
        })
        setToast({ message: "Walk-in match booked & ledger recorded!", type: "success" })
      } else {
        setToast({ message: res.error || "Failed to process walk-in.", type: "error" })
      }
    } catch (err: any) {
      setToast({ message: err.message || "An unexpected error occurred.", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const resetPos = () => {
    setCompletedOrder(null)
    setCart({})
    setGuestName("")
    setGuestPhone("")
    setNotes("")
    setPaidAmountMode('full')
    setCustomPaidAmount("")
  }

  // ─── SUCCESS SCREEN & RECEIPT ───
  if (completedOrder) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 animate-in zoom-in-95 fade-in duration-300">
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center pb-5 border-b border-dashed border-border/80">
            <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
              <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Match Checked In
            </span>
            <h2 className="text-2xl font-black text-foreground mt-3 tracking-tight">
              {completedOrder.court?.name}
            </h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              Ref: SB-{completedOrder.booking?.id?.slice(0, 6)?.toUpperCase() || "POS"}
            </p>
          </div>

          <div className="space-y-3 text-sm py-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Player</span>
              <span className="font-bold text-foreground">{completedOrder.guestName} ({completedOrder.guestPhone})</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Session Duration</span>
              <span className="font-bold text-primary">{completedOrder.durationMinutes} Minutes (Now – {new Date(completedOrder.startTime.getTime() + completedOrder.durationMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Court Rate</span>
              <span className="font-bold text-foreground">{formatCurrency(completedOrder.breakdown?.courtPrice || 0)}</span>
            </div>
            {completedOrder.items && completedOrder.items.length > 0 && (
              <div className="pt-2 border-t border-border/40 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Add-on Items</span>
                {completedOrder.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-3 border-t border-dashed border-border/80 flex justify-between items-baseline">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase">Grand Total</span>
                <p className="text-[11px] text-emerald-500 font-bold uppercase tracking-wider">
                  {completedOrder.breakdown?.paymentStatus === 'paid' ? 'Paid In Full' : `Due: ${formatCurrency(completedOrder.breakdown?.dueAmount || 0)}`}
                </p>
              </div>
              <span className="text-2xl font-black text-foreground">{formatCurrency(completedOrder.breakdown?.grandTotal || 0)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="h-12 rounded-xl bg-card border border-border/80 font-bold text-xs flex items-center justify-center gap-2 hover:bg-muted transition-all"
            >
              <Printer className="h-4 w-4" /> Print Slip
            </button>
            <button
              type="button"
              onClick={resetPos}
              className="h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-md shadow-primary/20 transition-all"
            >
              <RefreshCw className="h-4 w-4" /> Next Walk-in
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      
      {/* ─── LEFT COLUMN: Pitch, Duration & Add-ons (8 cols) ─── */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* 1. Court / Pitch Selector */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Select Active Court
            </h3>
            <span className="text-xs font-bold text-primary">
              {selectedResource ? `${formatCurrency(selectedResource.base_price)}/hr` : ''}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {resources.map(res => {
              const isSelected = selectedResource?.id === res.id
              return (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => setSelectedResource(res)}
                  className={cn(
                    "p-4 rounded-2xl text-left border transition-all cursor-pointer",
                    isSelected 
                      ? "bg-primary/10 border-primary shadow-md shadow-primary/10 ring-2 ring-primary/30" 
                      : "bg-muted/30 border-border/60 hover:bg-muted/60"
                  )}
                >
                  <span className="font-extrabold text-sm block truncate text-foreground">{res.name}</span>
                  <span className="text-[11px] text-muted-foreground capitalize block mt-0.5">{res.unit_type}</span>
                  <span className="text-xs font-black text-primary block mt-2">{formatCurrency(res.base_price)}/hr</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Match Duration */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Match Duration
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { mins: 30, label: "30 Min", hint: "Half Match" },
              { mins: 60, label: "60 Min", hint: "Standard 1 Hr" },
              { mins: 90, label: "90 Min", hint: "1.5 Hours" },
              { mins: 120, label: "120 Min", hint: "Full 2 Hours" }
            ].map(d => {
              const isSelected = durationMinutes === d.mins
              return (
                <button
                  key={d.mins}
                  type="button"
                  onClick={() => setDurationMinutes(d.mins)}
                  className={cn(
                    "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between",
                    isSelected 
                      ? "bg-primary/10 border-primary ring-2 ring-primary/30" 
                      : "bg-muted/30 border-border/60 hover:bg-muted/60"
                  )}
                >
                  <div>
                    <span className="text-sm font-black block text-foreground">{d.label}</span>
                    <span className="text-[10px] text-muted-foreground">{d.hint}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. Add-on Equipment, Water & Snacks */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" /> Add-on Equipment & Refreshments
            </h3>
            
            {/* Quick Filter */}
            <div className="flex gap-1.5 overflow-x-auto">
              {["all", "drink", "equipment", "food"].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setProductCategoryFilter(cat)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all",
                    productCategoryFilter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border/70 rounded-2xl text-xs text-muted-foreground">
              No inventory products found. You can add items in Dashboard &gt; Inventory.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {products
                .filter(p => productCategoryFilter === 'all' || p.category === productCategoryFilter)
                .map(product => {
                  const inCartCount = cart[product.id]?.quantity || 0
                  return (
                    <div 
                      key={product.id}
                      className={cn(
                        "p-3.5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden",
                        inCartCount > 0 ? "bg-primary/5 border-primary/40 shadow-xs" : "bg-muted/30 border-border/60"
                      )}
                    >
                      <div>
                        <span className="font-extrabold text-xs block truncate text-foreground">{product.name}</span>
                        <span className="text-xs font-black text-primary block mt-1">{formatCurrency(product.price)}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-border/40">
                        {inCartCount > 0 ? (
                          <div className="flex items-center justify-between w-full">
                            <button
                              type="button"
                              onClick={() => decrementCartItem(product.id)}
                              className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 text-foreground"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="font-black text-xs text-foreground px-1">{inCartCount}</span>
                            <button
                              type="button"
                              onClick={() => addItemToCart(product)}
                              className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addItemToCart(product)}
                            className="w-full py-1.5 rounded-lg bg-card border border-border/70 text-[10px] font-extrabold text-foreground hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

      </div>

      {/* ─── RIGHT COLUMN: Customer Details, Live Slip & Fast Checkout (4 cols) ─── */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Fast Customer Entry */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Player / Team Info
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Player Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Bipin Shrestha"
                className="w-full h-11 bg-muted/40 border border-border/70 rounded-xl px-3.5 text-xs font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="e.g. 98XXXXXXXX"
                className="w-full h-11 bg-muted/40 border border-border/70 rounded-xl px-3.5 text-xs font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Returning Customers Quick Picker */}
            {customers.length > 0 && !guestName && (
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Frequent Players</span>
                <div className="flex flex-wrap gap-1.5">
                  {customers.slice(0, 4).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCustomer(c)}
                      className="px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-[10px] font-bold text-foreground border border-border/50"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cart & Billing Slip */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xl space-y-5 sticky top-6">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Order Summary</span>
            <span className="text-xs font-bold text-primary">{durationMinutes} Min Session</span>
          </div>

          {/* Line items */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{selectedResource?.name || 'Court'} ({durationMinutes}m)</span>
              <span className="font-extrabold text-foreground">{formatCurrency(courtPrice)}</span>
            </div>

            {cartItemsList.map(item => (
              <div key={item.id} className="flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <button onClick={() => removeCartItem(item.id)} className="text-red-400 hover:text-red-500">×</button>
                  {item.name} × {item.quantity}
                </span>
                <span className="font-bold text-foreground">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}

            <div className="pt-3 border-t border-border/50 flex justify-between items-baseline">
              <span className="text-xs font-extrabold uppercase text-foreground">Grand Total</span>
              <span className="text-2xl font-black text-foreground tracking-tight">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Collection Method</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'qr', label: 'QR Pay', icon: QrCode },
                { id: 'card', label: 'Card / POS', icon: CreditCard },
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={cn(
                    "p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
                    paymentMethod === m.id 
                      ? "bg-primary/10 border-primary text-primary font-bold shadow-xs" 
                      : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <m.icon className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Status / Partial Pay */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaidAmountMode('full')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                  paidAmountMode === 'full' ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-muted/30 border-border/50 text-muted-foreground"
                )}
              >
                Paid Full
              </button>
              <button
                type="button"
                onClick={() => setPaidAmountMode('partial')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                  paidAmountMode === 'partial' ? "bg-amber-500/10 border-amber-500 text-amber-500" : "bg-muted/30 border-border/50 text-muted-foreground"
                )}
              >
                Partial Pay
              </button>
              <button
                type="button"
                onClick={() => setPaidAmountMode('unpaid')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                  paidAmountMode === 'unpaid' ? "bg-red-500/10 border-red-500 text-red-500" : "bg-muted/30 border-border/50 text-muted-foreground"
                )}
              >
                Pay Later
              </button>
            </div>

            {paidAmountMode === 'partial' && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1.5 animate-in fade-in">
                <div className="flex justify-between text-[11px] font-bold text-amber-600">
                  <span>Collected Now (NRS):</span>
                  <span>Due Later: {formatCurrency(remainingDue)}</span>
                </div>
                <input
                  type="number"
                  value={customPaidAmount}
                  onChange={(e) => setCustomPaidAmount(e.target.value)}
                  placeholder="Enter amount collected"
                  className="w-full h-10 bg-background border border-amber-500/30 rounded-lg px-3 text-xs font-bold text-foreground outline-none"
                />
              </div>
            )}
          </div>

          {/* Checkout Button */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading || !selectedResource}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-xl shadow-primary/25 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" />
                Complete Walk-in • {formatCurrency(calculatedPaidAmount)}
              </>
            )}
          </button>
        </div>

      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
