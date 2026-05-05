"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Calendar, Banknote, MapPin, Printer, Download, ArrowRight, CheckCircle2, X, FileSpreadsheet, Lock } from "lucide-react"
import { fetchDailyReport, generateCSVReport } from "@/lib/actions/reports"
import { getNotificationForBooking, generateWhatsAppNotification, generateDailySummaryNotification } from "@/lib/notifications"
import { formatCurrency } from "@/lib/utils"
import { useSession } from "next-auth/react"
import Cookies from "js-cookie"

import { getCurrentUserRole } from "@/lib/actions/auth"

export default function ReportsPage() {
  const { data: session } = useSession()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const activeFacilityId = Cookies.get("active_facility_id")
      if (activeFacilityId) {
        const userRole = await getCurrentUserRole(activeFacilityId)
        setRole(userRole)
      }
      setIsVerifying(false)
    }
    if (session?.user) {
        checkAuth()
    }
  }, [session])

  useEffect(() => {
    if (role === 'owner' || role === 'manager') {
      async function load() {
        const activeFacilityId = Cookies.get("active_facility_id")
        if (!activeFacilityId) return

        setLoading(true)
        const data = await fetchDailyReport(date, activeFacilityId)
        setReport(data)
        setLoading(false)
      }
      load()
    }
  }, [date, role])

  const handlePrint = () => {
    window.print()
  }

  const handleCSVExport = async () => {
    const activeFacilityId = Cookies.get("active_facility_id")
    if (!activeFacilityId) return

    const csv = await generateCSVReport(date, activeFacilityId)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SportBaba_Report_${date}.csv`
    a.click()
  }

  const handleCloseDay = async () => {
    if (!report) return
    const { whatsappUrl } = await generateDailySummaryNotification(report)
    window.open(whatsappUrl, '_blank')
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
      
      {/* ─── Web Header (Hidden on Print) ─── */}
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
              className="bg-muted/40 border border-border/30 px-4 py-2.5 rounded-2xl text-xs font-black outline-none ring-primary/20 focus:ring-4 transition-all pr-10 appearance-none cursor-pointer"
            />
            <Calendar className="h-4 w-4 text-primary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[40vh] space-y-4 print:hidden">
           <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Aggregating Ledger Data...</p>
        </div>
      ) : (
        <div id="printable-report" className="space-y-10">
          
          <div className="hidden print:block font-serif mb-12 border-b-8 border-black pb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-6xl font-black uppercase tracking-tighter leading-none mb-2">SPORTBABA</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Facility Management Hub • Accounts Division</p>
              </div>
              <div className="text-right">
                 <p className="text-sm font-black uppercase tracking-widest mb-1 italic">Daily Financial Report</p>
                 <p className="text-xs font-medium opacity-60">Generated: {new Date().toLocaleString()}</p>
                 <div className="mt-4 bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest">
                    ID: {Math.random().toString(36).substring(7).toUpperCase()}-ACC
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-20 border-t border-black/10 pt-8 mt-12">
               <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none">Facility Name</p>
                    <p className="text-2xl font-black italic tracking-tighter uppercase leading-none">Command Hub HQ</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none">Accounting Period</p>
                    <p className="text-xl font-bold leading-none">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                 </div>
               </div>
               <div className="flex flex-col items-end justify-center border-l border-black/5 pl-20">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Grand Total Net Revenue</p>
                  <p className="text-6xl font-black italic tracking-tighter leading-none underline decoration-double">{formatCurrency(report.totalRevenue)}</p>
               </div>
            </div>

            {/* Print Summary Table */}
            <div className="mt-16 mb-16">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 border-l-4 border-black pl-3">Financial Lifecycle Summary</h3>
               <table className="w-full border-collapse">
                  <thead>
                     <tr className="bg-gray-100 border-b-2 border-black">
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-left">Category Description</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">Qty</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">Net Value</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr className="border-b border-black/10">
                        <td className="p-4 text-sm font-bold uppercase tracking-tight">Active Confirmed Sessions</td>
                        <td className="p-4 text-sm font-bold text-right">{report.bookingCount}</td>
                        <td className="p-4 text-sm font-black text-right italic">{formatCurrency(report.totalRevenue)}</td>
                     </tr>
                     <tr className="border-b border-black/10">
                        <td className="p-4 text-sm font-medium uppercase tracking-tight opacity-40">Canceled Sessions (Non-Recorded)</td>
                        <td className="p-4 text-sm font-medium text-right opacity-40">{report.canceledCount}</td>
                        <td className="p-4 text-sm font-medium text-right opacity-40">({formatCurrency(report.lostRevenue)})</td>
                     </tr>
                     {report.payments.map((p: any) => (
                       <tr key={p.name} className="border-b border-black/10">
                          <td className="p-4 text-xs font-black uppercase tracking-widest pl-10">• {p.name} Ledger Balance</td>
                          <td className="p-4 text-xs text-right">-</td>
                          <td className="p-4 text-xs font-black text-right italic">{formatCurrency(p.value)}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {/* Venue Breakdown Table (Print) */}
            <div className="mb-16">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 border-l-4 border-black pl-3">Venue Contribution Analysis</h3>
               <table className="w-full border-collapse">
                  <thead>
                     <tr className="bg-gray-200 border-b border-black">
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-left">Venue ID / Name</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">Share (%)</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">Collection Total</th>
                     </tr>
                  </thead>
                  <tbody>
                     {report.venues.map((venue: any) => (
                       <tr key={venue.name} className="border-b border-black/10">
                          <td className="p-4 text-sm font-bold uppercase tracking-tight">{venue.name}</td>
                          <td className="p-4 text-sm text-right opacity-60">
                             {Math.round((venue.value / (report.totalRevenue || 1)) * 100)}%
                          </td>
                          <td className="p-4 text-sm font-black text-right italic">{formatCurrency(venue.value)}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            <div className="mt-8 border-t-2 border-black pt-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Detailed Transaction Ledger</h3>
            </div>
          </div>
          
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
            
            {/* Revenue by Venue (Pie Chart) */}
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
                          for (let j = 0; j < i; j++) offset += (report.venues[j].value / totalVenueRevenue) * 100
                          const pct = (venue.value / totalVenueRevenue) * 100
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

            {/* Payment Method Distribution */}
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

          {/* ─── Transaction Ledger (Clean Table) ─── */}
          <div className="space-y-6 px-1 md:px-2 print:mt-20">
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
               {report.bookingCount === 0 && (
                 <div className="p-20 text-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-40 italic">Waiting for the matches to begin...</p>
                 </div>
               )}
            </div>
          </div>

          {/* ─── Print Branding Overlay ─── */}
          <div className="hidden print:block fixed bottom-0 left-0 right-0 p-12 border-t border-black bg-white">
             <div className="flex justify-between items-end mb-12">
                <div className="space-y-4">
                   <div className="h-16 w-48 border border-black/20 relative">
                      <p className="absolute bottom-2 left-2 text-[8px] font-black uppercase opacity-20 tracking-tighter italic">Signature / Stamp Placeholder</p>
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest">Authorized Signature</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Verification Code</p>
                   <p className="text-[8px] font-mono uppercase tracking-tighter">{Math.random().toString(36).substring(7).toUpperCase()}-{date}-HUB</p>
                </div>
             </div>
             <div className="flex justify-between items-center opacity-40">
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">WWW.SPORTBABA.COM</p>
                <p className="text-[10px] font-black uppercase tracking-widest italic">{new Date().toLocaleString()}</p>
             </div>
          </div>

        </div>
      )}

      {/* ─── Print Support Styles ─── */}
      <style jsx global>{`
        @media print {
          /* Hide Web UI Elements */
          nav, aside, .print\:hidden, [role="navigation"], .OrganizationSwitcher { display: none !important; }
          
          /* Reset Page Layout */
          body { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
          main { padding: 0 !important; overflow: visible !important; margin: 0 !important; }
          .flex.h-screen { display: block !important; height: auto !important; overflow: visible !important; }
          
          /* Style Document Content */
          .print\:block { display: block !important; }
          .shadow-2xl, .shadow-xl, .shadow-lg, .shadow-sm { box-shadow: none !important; }
          .rounded-\[48px\], .rounded-\[40px\], .rounded-3xl, .rounded-2xl { border-radius: 0 !important; }
          .bg-card { background: white !important; border: 1px solid #eee !important; }
          .border-border\/40 { border-color: #ddd !important; }
          
          table { width: 100% !important; border-collapse: collapse !important; }
          table tr { page-break-inside: avoid !important; }
          table th { background: #f9f9f9 !important; -webkit-print-color-adjust: exact; }
          
          @page { margin: 1.5cm; size: auto; }
          
          /* Typography for Print */
          h1, h2, h3, p, span, td, th { color: black !important; }
          .text-primary { color: black !important; font-weight: 900 !important; }
          .opacity-40, .opacity-60, .opacity-50 { opacity: 1 !important; color: #666 !important; }
        }
      `}</style>

    </div>
  )
}
