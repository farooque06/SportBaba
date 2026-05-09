"use client"

import { useState, useEffect } from "react"
import { 
  Printer, FileSpreadsheet, Lock, Calendar, 
  MapPin, Banknote
} from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { fetchDailyReport, generateCSVReport } from "@/lib/actions/reports"
import { formatCurrency } from "@/lib/utils"
import { useSession } from "next-auth/react"
import Cookies from "js-cookie"

import { getCurrentUserRole, getAnyUserRoleAndFacility } from "@/lib/actions/auth"

export default function ReportsPage() {
  const { data: session } = useSession()
  const user = session?.user as any
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [report, setReport] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)
  const [facilityId, setFacilityId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      let activeId = Cookies.get("active_facility_id")
      
      if (activeId) {
        const userRole = await getCurrentUserRole(activeId)
        setRole(userRole)
        setFacilityId(activeId)
      } else {
        const { role: userRole, facilityId: foundId } = await getAnyUserRoleAndFacility()
        setRole(userRole)
        setFacilityId(foundId)
        if (foundId) {
          Cookies.set("active_facility_id", foundId, { expires: 7 })
        }
      }
      setIsVerifying(false)
    }
    if (session?.user) {
        checkAuth()
    }
  }, [session])

  useEffect(() => {
    if ((role === 'owner' || role === 'manager') && facilityId) {
      async function load() {
        setLoading(true)
        try {
          const data = await fetchDailyReport(date, facilityId!)
          setReport(data)
        } finally {
          setLoading(false)
        }
      }
      load()
    } else if (role !== null && !facilityId) {
      setLoading(false)
    }
  }, [date, role, facilityId])

  const handlePrint = () => {
    window.print()
  }

  const handleCSVExport = async () => {
    if (!facilityId) return;
    const csv = await generateCSVReport(date, facilityId)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SportBaba_Report_${date}.csv`
    a.click()
  }

  const handleCloseDay = () => {
    alert("Day closure logic would go here. This would lock all bookings for the selected date.")
  }

  const totalVenueRevenue = report?.venues.reduce((acc: number, v: any) => acc + v.value, 0) || 1

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Securing Ledger Access...</p>
      </div>
    )
  }

  if (role !== 'owner' && role !== 'manager') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-6 mesh-gradient rounded-[48px] border border-border/20">
        <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <Lock className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Access Restricted</h2>
          <p className="text-muted-foreground text-xs max-w-xs mx-auto font-bold uppercase tracking-widest opacity-60">Financial ledgers are only accessible by facility owners and managers.</p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard'} className="mt-4 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all">
          Return to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500 pb-20 mesh-gradient p-1 rounded-[48px]">
      
      {/* ─── Web Header (HIDDEN ON PRINT) ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 md:px-2 print:hidden pb-2">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase text-foreground leading-none mb-4">Ledger Reports</h1>
          <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] opacity-50">Closing the day & financial oversight</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-muted/40 border border-border/30 px-4 py-2.5 rounded-2xl text-xs font-black outline-none ring-primary/20 focus:ring-4 transition-all pr-10 cursor-pointer"
            />
            <Calendar className="h-4 w-4 text-primary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} variant="outline" className="h-11 rounded-2xl px-5 border-border/40 font-black uppercase tracking-widest text-[10px] hover:bg-muted/40 transition-all flex items-center gap-2">
              <Printer className="h-4 w-4 opacity-40" />
              PDF
            </Button>
            <Button onClick={handleCSVExport} variant="outline" className="h-11 rounded-2xl px-5 border-border/40 font-black uppercase tracking-widest text-[10px] hover:bg-muted/40 transition-all flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 opacity-40" />
              CSV
            </Button>
            <Button onClick={handleCloseDay} className="h-11 rounded-2xl px-6 bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Close Day
            </Button>
          </div>
        </div>
      </div>

      {loading || !report ? (
        <div className="flex flex-col items-center justify-center h-[40vh] space-y-4 print:hidden">
           <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
             {loading ? "Aggregating Ledger Data..." : "Finalizing Report View..."}
           </p>
        </div>
      ) : (
        <div id="printable-report">
          
          {/* ─── DEDICATED PRINT VIEW (ONLY VISIBLE ON PDF) ─── */}
          <div className="hidden print:block font-sans text-black">
            <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-8">
              <div className="space-y-1">
                <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">SPORTBABA</h1>
                <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40">Financial Ledger • Facility Accounts Division</p>
                <div className="pt-6 space-y-0.5">
                   <p className="text-[10px] font-black uppercase tracking-widest">{user?.facilityName || "Primary Hub HQ"}</p>
                   <p className="text-[9px] font-medium opacity-60">Verified Statement: {new Date().toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                 <div className="bg-black text-white px-5 py-3 mb-2">
                    <p className="text-[8px] font-black uppercase tracking-widest leading-none opacity-60">Report Date</p>
                    <p className="text-lg font-bold mt-1 leading-none">{new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                 </div>
                 <p className="text-[7px] font-mono opacity-40 uppercase tracking-widest">ID: {Math.random().toString(36).substring(7).toUpperCase()}-SB</p>
              </div>
            </div>

            {/* Financial Summary Table */}
            <div className="mb-10">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 border-l-4 border-black pl-3">Executive Summary</h3>
               <table className="w-full border-collapse">
                  <tbody>
                     <tr className="border-y border-black/10">
                        <td className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Gross Daily Collection</td>
                        <td className="py-4 text-right text-xl font-black italic">{formatCurrency(report.totalRevenue)}</td>
                     </tr>
                     <tr className="border-b border-black/10">
                        <td className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Total Active Sessions</td>
                        <td className="py-4 text-right text-lg font-bold">{report.bookingCount} Matches</td>
                     </tr>
                     <tr className="border-b border-black/10">
                        <td className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Loss From Cancellations</td>
                        <td className="py-4 text-right text-lg font-bold text-red-500">({formatCurrency(report.lostRevenue)})</td>
                     </tr>
                  </tbody>
               </table>
            </div>

            {/* Transaction Ledger Table */}
            <div className="mb-12">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 border-l-4 border-black pl-3">Transaction Detail Ledger</h3>
               <table className="w-full">
                  <thead>
                     <tr className="bg-gray-100">
                        <th className="p-3 text-left">Ref</th>
                        <th className="p-3 text-left">Pitch/Unit</th>
                        <th className="p-3 text-left">Guest Name</th>
                        <th className="p-3 text-left">Time</th>
                        <th className="p-3 text-left">Method</th>
                        <th className="p-3 text-right">Amount</th>
                     </tr>
                  </thead>
                  <tbody>
                     {report.bookings.map((booking: any) => (
                        <tr key={booking.id} className="border-b border-gray-100">
                           <td className="p-3 font-mono text-[9px] opacity-40">{booking.id.slice(0, 8).toUpperCase()}</td>
                           <td className="p-3 font-bold uppercase">{booking.resource?.name}</td>
                           <td className="p-3 font-black italic uppercase">{booking.guest_name}</td>
                           <td className="p-3 opacity-60">{new Date(booking.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</td>
                           <td className="p-3 text-[9px] font-black uppercase">{booking.payment_method || 'CASH'}</td>
                           <td className="p-3 text-right font-bold">{formatCurrency(booking.paid_amount)}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {/* Signature Block */}
            <div className="mt-20 flex justify-between items-end border-t border-black pt-12">
               <div className="space-y-4">
                  <div className="h-12 w-40 border border-black/10 border-dashed" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Authorized Signature</p>
               </div>
               <div className="text-right space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest">Official Audit Stamp</p>
                  <p className="text-[7px] font-medium opacity-40">SPORTBABA SECURE LEDGER SYSTEM</p>
               </div>
            </div>
          </div>

          {/* ─── WEB VIEW (HIDDEN ON PRINT) ─── */}
          <div className="print:hidden space-y-10">
            {/* ─── Summary Cards ─── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-1 md:px-2">
              <Card className="p-8 bg-card border-border/40 rounded-[40px] shadow-xl group hover:border-primary/40 transition-all relative overflow-hidden">
                 <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Daily Revenue</p>
                    <h3 className="text-4xl font-black tracking-tighter italic">{formatCurrency(report.totalRevenue)}</h3>
                 </div>
                 <Banknote className="h-24 w-24 text-primary absolute -right-4 -bottom-4 opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
              </Card>

              <Card className="p-8 bg-card border-border/40 rounded-[40px] shadow-xl group hover:border-emerald-500/20 transition-all">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Total Bookings</p>
                 <h3 className="text-4xl font-black tracking-tighter italic text-emerald-600">{report.bookingCount} Matches</h3>
              </Card>

              <Card className="p-8 bg-card border-border/40 rounded-[40px] shadow-xl group hover:border-red-500/20 transition-all">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1 text-red-500/50">Canceled Matches</p>
                 <div className="flex items-baseline gap-2">
                   <h3 className="text-4xl font-black tracking-tighter italic text-red-500">{report.canceledCount}</h3>
                   <p className="text-[10px] font-bold text-red-500/40">-{formatCurrency(report.lostRevenue)}</p>
                 </div>
              </Card>

              <Card className="p-8 bg-card border-border/40 rounded-[40px] shadow-xl group hover:border-primary/40 transition-all">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Efficiency Ratio</p>
                 <h3 className="text-4xl font-black tracking-tighter italic">{report.bookingCount > 0 ? formatCurrency(report.totalRevenue / report.bookingCount) : "NRS 0"}</h3>
              </Card>
            </div>

            {/* ─── Analytics Row ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-1 md:px-2">
              <Card className="p-10 bg-card border-border rounded-[48px] shadow-2xl overflow-hidden relative group">
                 <h2 className="text-xl font-black tracking-tighter uppercase italic mb-10 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Revenue by Venue
                 </h2>
                 <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="relative h-48 w-48 shrink-0">
                       <svg viewBox="0 0 100 100" className="rotate-[-90deg]">
                          {report.venues.map((venue: any, i: number) => {
                            let offset = 0
                            for (let j = 0; j < i; j++) offset += (report.venues[j].value / (totalVenueRevenue || 1)) * 100
                            const pct = (venue.value / (totalVenueRevenue || 1)) * 100
                            return (
                              <circle 
                                key={venue.name}
                                cx="50" cy="50" r="40"
                                fill="transparent"
                                stroke={['#FF3B30', '#34C759', '#007AFF', '#FF9500', '#AF52DE'][i % 5]}
                                strokeWidth="10"
                                strokeDasharray={`${pct} ${100 - pct}`}
                                strokeDashoffset={-offset}
                                className="transition-all duration-1000 ease-out hover:stroke-white cursor-pointer"
                              />
                            )
                          })}
                       </svg>
                       <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <p className="text-2xl font-black tracking-tighter italic">100%</p>
                          <p className="text-[8px] font-black uppercase text-muted-foreground">Market Share</p>
                       </div>
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                       {report.venues.map((venue: any, i: number) => (
                         <div key={venue.name} className="flex items-center justify-between group/item">
                            <div className="flex items-center gap-3">
                               <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ['#FF3B30', '#34C759', '#007AFF', '#FF9500', '#AF52DE'][i % 5] }} />
                               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover/item:text-foreground transition-colors">{venue.name}</span>
                            </div>
                            <span className="text-xs font-black italic">{formatCurrency(venue.value)}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </Card>

              <Card className="p-10 bg-card border-border rounded-[48px] shadow-2xl overflow-hidden">
                 <h2 className="text-xl font-black tracking-tighter uppercase italic mb-10 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Payment Mix
                 </h2>
                 <div className="space-y-8">
                    {report.payments.map((p: any) => (
                      <div key={p.name} className="space-y-3">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{p.name}</span>
                            <span className="text-sm font-black italic">{formatCurrency(p.value)}</span>
                         </div>
                         <div className="h-2 bg-muted/50 rounded-full overflow-hidden border border-border/40">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" 
                              style={{ width: `${(p.value / (report.totalRevenue || 1)) * 100}%` }}
                            />
                         </div>
                      </div>
                    ))}
                 </div>
              </Card>
            </div>

            {/* ─── Transaction Ledger (Web Table) ─── */}
            <div className="space-y-6 px-1 md:px-2">
              <h2 className="text-2xl font-black tracking-tighter uppercase italic px-4">Transaction Ledger</h2>
              <div className="bg-card border border-border rounded-[40px] overflow-hidden shadow-xl">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-muted/30 border-b border-border/40">
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">Pitch / Unit</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">Guest</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">Session</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40">Payment</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Amount</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                       {report.bookings.map((booking: any) => {
                         const isCanceled = booking.status === 'cancelled'
                         return (
                          <tr key={booking.id} className={`hover:bg-muted/10 transition-colors group ${isCanceled ? 'opacity-50 grayscale' : ''}`}>
                              <td className="p-6">
                                <div className="flex items-center gap-3">
                                    <MapPin className={`h-3 w-3 ${isCanceled ? 'text-muted-foreground' : 'text-primary'} opacity-40 group-hover:opacity-100`} />
                                    <span className={`text-xs font-bold ${isCanceled ? 'line-through' : ''}`}>{booking.resource?.name}</span>
                                </div>
                              </td>
                              <td className="p-6">
                                 <span className={`text-xs font-black italic ${isCanceled ? 'line-through' : ''}`}>{booking.guest_name}</span>
                              </td>
                              <td className="p-6 text-xs text-muted-foreground font-medium">
                                 {new Date(booking.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                              </td>
                              <td className="p-6">
                                 <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                   isCanceled 
                                     ? 'bg-red-500/10 border border-red-500/20 text-red-500' 
                                     : 'bg-primary/5 border border-primary/10 text-primary'
                                 }`}>
                                    {isCanceled ? 'CANCELED' : (booking.payment_method || 'CASH')}
                                 </span>
                              </td>
                              <td className={`p-6 text-right font-black italic text-sm ${isCanceled ? 'text-red-500/40' : ''}`}>
                                 {formatCurrency(isCanceled ? Number(booking.total_price) : Number(booking.paid_amount))}
                              </td>
                          </tr>
                         )
                       })}
                    </tbody>
                 </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ─── Print Support Styles ─── */}
      <style jsx global>{`
        @media print {
          /* Aggressive Global Hiding */
          nav, aside, footer, .print\\:hidden, [role="navigation"], .OrganizationSwitcher, button, .MobileNav, .QuickActionFab, .fixed, .absolute.top-0 { 
            display: none !important; 
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
          }
          
          /* Reset Page Layout */
          html, body { 
            background: white !important; 
            color: black !important; 
            padding: 0 !important; 
            margin: 0 !important; 
            font-family: 'Inter', sans-serif !important; 
            height: auto !important;
            overflow: visible !important;
          }
          
          main { 
            padding: 0 !important; 
            margin: 0 !important; 
            overflow: visible !important;
            background: white !important;
            display: block !important;
            width: 100% !important;
          }
          
          .flex.h-screen { display: block !important; height: auto !important; overflow: visible !important; }
          
          #printable-report { 
            display: block !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          
          table { width: 100% !important; border-collapse: collapse !important; margin-top: 10px !important; }
          table th { font-weight: 900 !important; font-size: 10px !important; text-transform: uppercase !important; border-bottom: 2px solid black !important; padding: 8px !important; }
          table td { font-size: 11px !important; border-bottom: 1px solid #eee !important; padding: 8px !important; }
          
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </div>
  )
}
