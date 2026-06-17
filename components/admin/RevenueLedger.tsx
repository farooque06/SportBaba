"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn, formatCurrency } from "@/lib/utils";
import { 
  TrendingUp, AlertCircle, DollarSign, Receipt,
  ChevronDown, ChevronUp, Plus, X
} from "lucide-react";
import { Toast, ToastType } from "@/components/ui/Toast";

type Payment = {
  id: string;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: string;
  notes: string | null;
  created_at: string;
  facilities: { name: string; id: string } | null;
  subscription_plans: { name: string; price: number; interval: string } | null;
};

type Props = {
  payments: Payment[];
  totalCollected: number;
  totalOutstanding: number;
  facilityOptions: { id: string; name: string }[];
};

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  partial: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  pending: "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse",
};

export function RevenueLedger({ payments: initialPayments, totalCollected, totalOutstanding, facilityOptions }: Props) {
  const [payments, setPayments] = useState(initialPayments);
  const [filter, setFilter] = useState("all");
  const [topUpModal, setTopUpModal] = useState<{ isOpen: boolean; paymentId: string | null; facilityId: string | null; remaining: number; notes: string; topUpAmount: string }>({ isOpen: false, paymentId: null, facilityId: null, remaining: 0, notes: "", topUpAmount: "" });
  const [addModal, setAddModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [loading, setLoading] = useState(false);

  // Add manual payment state
  const [newPayment, setNewPayment] = useState({ facilityId: "", totalAmount: "", amountPaid: "", notes: "" });

  const filtered = filter === "all" ? payments : payments.filter(p => p.status === filter);

  const collected = payments.reduce((s, p) => s + (p.amount_paid ?? 0), 0);
  const outstanding = payments.reduce((s, p) => s + (p.amount_due ?? 0), 0);

  const handleTopUp = async () => {
    if (!topUpModal.paymentId || !topUpModal.topUpAmount) return;
    setLoading(true);
    const topAmt = parseFloat(topUpModal.topUpAmount);
    const { logManualPayment } = await import("@/lib/actions/admin");
    const result = await logManualPayment(
      topUpModal.facilityId!,
      0, // totalAmount = 0 because it's purely a payment credit, not a new liability
      topAmt,
      undefined,
      topUpModal.notes || "Top-up payment"
    );
    if (result.success) {
      setToast({ message: "Top-up payment logged!", type: "success" });
      setTopUpModal({ isOpen: false, paymentId: null, facilityId: null, remaining: 0, notes: "", topUpAmount: "" });
      // Refresh page data - simple approach
      window.location.reload();
    } else {
      setToast({ message: "Failed to log payment.", type: "error" });
    }
    setLoading(false);
  };

  const handleAddManual = async () => {
    if (!newPayment.facilityId || !newPayment.totalAmount || !newPayment.amountPaid) {
      setToast({ message: "Fill all required fields.", type: "error" });
      return;
    }
    setLoading(true);
    const { logManualPayment } = await import("@/lib/actions/admin");
    const result = await logManualPayment(
      newPayment.facilityId,
      parseFloat(newPayment.totalAmount),
      parseFloat(newPayment.amountPaid),
      undefined,
      newPayment.notes || undefined
    );
    if (result.success) {
      setToast({ message: "Payment entry added!", type: "success" });
      setAddModal(false);
      setNewPayment({ facilityId: "", totalAmount: "", amountPaid: "", notes: "" });
      window.location.reload();
    } else {
      setToast({ message: "Failed to add entry.", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8]">Ledger</h1>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            Financial Record of All Payments
          </p>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="flex items-center gap-2 h-12 px-6 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" /> Log Manual Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-[28px] border-border bg-card relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <TrendingUp className="h-28 w-28 text-emerald-500" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">Total Collected</p>
          <p className="text-4xl font-black tracking-tighter italic text-emerald-500">{formatCurrency(collected)}</p>
          <p className="text-[9px] text-muted-foreground font-bold uppercase mt-2 opacity-50">{payments.filter(p => p.status === 'paid').length} fully cleared</p>
        </Card>
        <Card className="p-6 rounded-[28px] border-border bg-card relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <AlertCircle className="h-28 w-28 text-amber-500" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">Outstanding Due</p>
          <p className={cn("text-4xl font-black tracking-tighter italic", outstanding > 0 ? "text-amber-500" : "text-emerald-500")}>{formatCurrency(outstanding)}</p>
          <p className="text-[9px] text-muted-foreground font-bold uppercase mt-2 opacity-50">{payments.filter(p => p.status !== 'paid').length} pending entries</p>
        </Card>
        <Card className="p-6 rounded-[28px] border-border bg-card relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <DollarSign className="h-28 w-28 text-primary" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">Total Transactions</p>
          <p className="text-4xl font-black tracking-tighter italic text-primary">{payments.length}</p>
          <p className="text-[9px] text-muted-foreground font-bold uppercase mt-2 opacity-50">All time records</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {["all", "paid", "partial", "pending"].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
              filter === s ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "bg-card border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{filtered.length} entries</span>
      </div>

      {/* Ledger Table */}
      <Card className="rounded-[28px] overflow-hidden border-border shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-6 py-4 text-left text-[8px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                <th className="px-6 py-4 text-left text-[8px] font-black uppercase tracking-widest text-muted-foreground">Hub</th>
                <th className="px-6 py-4 text-left text-[8px] font-black uppercase tracking-widest text-muted-foreground">Plan</th>
                <th className="px-6 py-4 text-right text-[8px] font-black uppercase tracking-widest text-muted-foreground">Total</th>
                <th className="px-6 py-4 text-right text-[8px] font-black uppercase tracking-widest text-muted-foreground">Paid</th>
                <th className="px-6 py-4 text-right text-[8px] font-black uppercase tracking-widest text-muted-foreground">Due</th>
                <th className="px-6 py-4 text-center text-[8px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left text-[8px] font-black uppercase tracking-widest text-muted-foreground">Notes</th>
                <th className="px-6 py-4 text-center text-[8px] font-black uppercase tracking-widest text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className={cn("border-b border-border/30 transition-colors hover:bg-muted/20", i % 2 === 0 ? "" : "bg-muted/10")}>
                  <td className="px-6 py-4 text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                    {new Date(p.created_at).toLocaleDateString()}<br />
                    <span className="opacity-50 text-[8px]">{new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black italic uppercase tracking-tight truncate max-w-[140px]">{p.facilities?.name ?? "—"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-bold text-muted-foreground">{p.subscription_plans?.name ?? "Manual"}</p>
                    {p.subscription_plans?.interval && <p className="text-[8px] opacity-50 uppercase">/ {p.subscription_plans.interval}</p>}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-black">{formatCurrency(p.total_amount)}</td>
                  <td className="px-6 py-4 text-right text-sm font-black text-emerald-500">{formatCurrency(p.amount_paid)}</td>
                  <td className={cn("px-6 py-4 text-right text-sm font-black", p.amount_due > 0 ? "text-amber-500" : "text-muted-foreground/40")}>
                    {p.amount_due > 0 ? formatCurrency(p.amount_due) : "—"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn("px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border", STATUS_STYLES[p.status] ?? STATUS_STYLES.pending)}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-[160px]">
                    <p className="text-[9px] font-medium text-muted-foreground italic truncate">{p.notes ?? "—"}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {p.status !== 'paid' && p.amount_due > 0 && (
                      <button
                        onClick={() => setTopUpModal({ isOpen: true, paymentId: p.id, facilityId: p.facilities?.id ?? null, remaining: p.amount_due, notes: "", topUpAmount: String(p.amount_due) })}
                        className="h-8 px-3 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                      >
                        + Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-20 text-center">
                    <p className="text-xs font-black uppercase tracking-widest italic text-muted-foreground opacity-40">No payment records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top-Up Modal */}
      {topUpModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-3xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <h3 className="text-lg font-black italic uppercase">Log Top-Up Payment</h3>
              <button onClick={() => setTopUpModal({ ...topUpModal, isOpen: false })} className="h-8 w-8 rounded-full bg-muted/50 hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">Outstanding: {formatCurrency(topUpModal.remaining)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Amount Being Paid (NRS)</p>
                <input
                  type="number"
                  value={topUpModal.topUpAmount}
                  onChange={(e) => setTopUpModal({ ...topUpModal, topUpAmount: e.target.value })}
                  className="w-full h-12 bg-muted/50 border border-border/50 px-4 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Notes (Optional)</p>
                <input
                  type="text"
                  placeholder="e.g. Cash received"
                  value={topUpModal.notes}
                  onChange={(e) => setTopUpModal({ ...topUpModal, notes: e.target.value })}
                  className="w-full h-12 bg-muted/50 border border-border/50 px-4 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all placeholder:italic placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-border/50 bg-muted/20">
              <button onClick={handleTopUp} disabled={loading || !topUpModal.topUpAmount} className="flex-1 h-11 bg-primary text-white font-bold uppercase tracking-widest text-[9px] rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50">
                {loading ? "Saving..." : "Confirm Payment"}
              </button>
              <button onClick={() => setTopUpModal({ ...topUpModal, isOpen: false })} className="flex-1 h-11 bg-muted border border-border/50 text-muted-foreground font-bold uppercase tracking-widest text-[9px] rounded-xl hover:bg-muted/80 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Payment Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-3xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black italic uppercase">Log Manual Payment</h3>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">Not tied to a renewal</p>
              </div>
              <button onClick={() => setAddModal(false)} className="h-8 w-8 rounded-full bg-muted/50 hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Select Hub *</p>
                <select value={newPayment.facilityId} onChange={(e) => setNewPayment({ ...newPayment, facilityId: e.target.value })} className="w-full h-12 bg-muted/50 border border-border/50 px-4 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 uppercase tracking-wider transition-all">
                  <option value="" disabled>Choose a facility</option>
                  {facilityOptions.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Total Amount (NRS) *</p>
                  <input type="number" value={newPayment.totalAmount} onChange={(e) => setNewPayment({ ...newPayment, totalAmount: e.target.value })} placeholder="5000" className="w-full h-12 bg-muted/50 border border-border/50 px-4 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all" />
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Amount Paid Now (NRS) *</p>
                  <input type="number" value={newPayment.amountPaid} onChange={(e) => setNewPayment({ ...newPayment, amountPaid: e.target.value })} placeholder="2500" className="w-full h-12 bg-muted/50 border border-border/50 px-4 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all" />
                </div>
              </div>
              {newPayment.totalAmount && newPayment.amountPaid && parseFloat(newPayment.amountPaid) < parseFloat(newPayment.totalAmount) && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">⚠ Partial — Due: {formatCurrency(parseFloat(newPayment.totalAmount) - parseFloat(newPayment.amountPaid))}</p>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Notes</p>
                <input type="text" value={newPayment.notes} onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })} placeholder='e.g. "Cash payment for January"' className="w-full h-12 bg-muted/50 border border-border/50 px-4 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all placeholder:italic placeholder:text-muted-foreground/40" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-border/50 bg-muted/20">
              <button onClick={handleAddManual} disabled={loading} className="flex-1 h-11 bg-primary text-white font-bold uppercase tracking-widest text-[9px] rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50">
                {loading ? "Saving..." : "Log Payment"}
              </button>
              <button onClick={() => setAddModal(false)} className="flex-1 h-11 bg-muted border border-border/50 text-muted-foreground font-bold uppercase tracking-widest text-[9px] rounded-xl hover:bg-muted/80 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
