"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Globe, Activity, Clock, CreditCard, Search, X, Save, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateClientStatus } from "@/lib/actions/admin";
import { SubscriptionPlan } from "@/lib/actions/plans";
import { Toast, ToastType } from "@/components/ui/Toast";
import { ConfirmationModal } from "@/components/ui/Modal";

type FacilityProps = {
  id: string;
  name: string;
  sport_type: string;
  subscription_status: string;
  trial_end: string;
  created_at: string;
  plan_id?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
  subscription_plans?: { name: string; price: number };
};

export function ClientRegistry({ facilities: initialFacilities, plans }: { facilities: FacilityProps[], plans: SubscriptionPlan[] }) {
  const [facilities, setFacilities] = useState(initialFacilities);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Artisan Feedback State
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, facilityId: string | null }>({ isOpen: false, facilityId: null });

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
  };

  const filteredFacilities = facilities.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || f.subscription_status === statusFilter || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSave = async (e: React.FormEvent<HTMLFormElement>, facilityId: string) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const status = formData.get("status") as string;
    const orgStatus = formData.get("orgStatus") as string;
    const planId = formData.get("plan_id") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;
    
    // Convert empty string back to undefined/null for the server action
    const planValue = planId === "" ? undefined : planId;

    const result = await updateClientStatus(facilityId, status, undefined, planValue, { name, phone, email, address, orgStatus });
    
    if (result.success) {
      // Optimistic upate the list so we don't need to reload
      setFacilities(facilities.map(f => {
        if (f.id === facilityId) {
          const selectedPlan = plans.find(p => p.id === planId);
          return {
            ...f,
            name,
            phone,
            email,
            address,
            subscription_status: status,
            status: orgStatus,
            plan_id: planValue,
            subscription_plans: selectedPlan ? { name: selectedPlan.name, price: selectedPlan.price } : undefined
          };
        }
        return f;
      }));
      setEditingId(null);
      showToast("Hub configuration updated successfully.");
    } else {
      showToast(result.error, "error");
    }
    setLoading(false);
  };

  const handleQuickApprove = async (facilityId: string) => {
    setLoading(true);
    const { approveFacility } = await import("@/lib/actions/admin");
    const result = await approveFacility(facilityId);
    if (result.success) {
      setFacilities(facilities.map(f => f.id === facilityId ? { ...f, status: 'active', subscription_status: 'trialing' } : f));
      showToast("Organization approved and trial started.");
    } else {
      showToast(result.error || "Approval failed. Check system logs.", "error");
    }
    setConfirmModal({ isOpen: false, facilityId: null });
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h3 className="text-4xl font-black tracking-tighter italic uppercase text-foreground leading-none">Hub Registry</h3>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2 opacity-50 italic">Unified Platform Nodes</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 bg-card border border-border/50 px-4 rounded-2xl text-[10px] font-bold outline-none focus:ring-2 ring-primary/20 transition-all uppercase tracking-widest text-muted-foreground cursor-pointer hover:bg-muted"
          >
             <option value="all">All Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="inactive">Inactive</option>
            <option value="past_due">Past Due</option>
          </select>
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search nodes..."
              className="h-12 w-full md:w-64 bg-card border border-border/50 pl-11 pr-4 rounded-2xl text-[10px] font-bold outline-none focus:ring-2 ring-primary/20 transition-all placeholder:text-muted-foreground/30 uppercase tracking-widest"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredFacilities.map((fac) => (
          <Card key={fac.id} className="p-6 bg-card border-border rounded-[32px] group hover:border-primary/50 transition-all shadow-xl hover:shadow-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {editingId === fac.id ? (
              <form onSubmit={(e) => handleSave(e, fac.id)} className="relative z-10 bg-muted/10 p-6 md:p-8 rounded-3xl border border-primary/30 animate-in fade-in zoom-in-95 duration-200 shadow-2xl backdrop-blur-sm">
                <div className="mb-6 pb-4 border-b border-border/50 flex justify-between items-center">
                   <h4 className="text-xl font-black italic uppercase text-foreground">Configure Hub</h4>
                   <Button type="button" onClick={() => setEditingId(null)} variant="outline" className="h-8 w-8 rounded-full p-0 flex items-center justify-center border-border/50 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20">
                     <X className="h-4 w-4" />
                   </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2 w-full">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Hub Name</label>
                    <input required name="name" defaultValue={fac.name} className="w-full h-12 bg-card border border-border/50 px-4 rounded-xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 placeholder:italic transition-all" placeholder="E.g. Nexus Arena" />
                  </div>
                  <div className="space-y-2 w-full">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Contact Number</label>
                    <input name="phone" defaultValue={fac.phone || ""} className="w-full h-12 bg-card border border-border/50 px-4 rounded-xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 placeholder:italic transition-all" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="space-y-2 w-full">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Email Address</label>
                    <input type="email" name="email" defaultValue={fac.email || ""} className="w-full h-12 bg-card border border-border/50 px-4 rounded-xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 placeholder:italic transition-all" placeholder="admin@hub.com" />
                  </div>
                  <div className="space-y-2 w-full">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Physical Address</label>
                    <input name="address" defaultValue={fac.address || ""} className="w-full h-12 bg-card border border-border/50 px-4 rounded-xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 placeholder:italic transition-all" placeholder="123 Elite St. City" />
                  </div>

                  <div className="space-y-2 w-full pt-4 border-t border-border/30 md:col-span-2 md:grid md:grid-cols-3 md:gap-6 md:border-none md:pt-0">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Assign Plan</label>
                      <select name="plan_id" defaultValue={fac.plan_id || ""} className="w-full h-12 bg-card border border-border/50 px-4 rounded-xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 uppercase tracking-wider transition-all">
                        <option value="">No Plan</option>
                        {plans.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - {p.price} NRS</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Approval Status</label>
                       <select name="orgStatus" defaultValue={fac.status || 'pending'} className="w-full h-12 bg-card border border-border/50 px-4 rounded-xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 uppercase tracking-wider transition-all">
                         <option value="pending">Pending</option>
                         <option value="active">Active</option>
                         <option value="suspended">Suspended</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Subscription Status</label>
                      <select name="status" defaultValue={fac.subscription_status} className="w-full h-12 bg-card border border-border/50 px-4 rounded-xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 uppercase tracking-wider transition-all">
                        <option value="active">Active</option>
                        <option value="trialing">Trialing</option>
                        <option value="inactive">Inactive</option>
                        <option value="past_due">Past Due</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/50">
                  <Button type="submit" disabled={loading} variant="primary" className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                    {loading ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Configuration</>}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6 grow min-w-0">
                  <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-3 transition-all shrink-0">
                    <Globe className="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-black tracking-tighter italic uppercase truncate">{fac.name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-muted text-[7px] font-black uppercase tracking-widest text-muted-foreground border border-border/50">ID: {fac.id.slice(0, 8)}</span>
                      {fac.subscription_plans?.name && (
                         <span className="px-2 py-0.5 rounded-md bg-primary/10 text-[7px] font-black uppercase tracking-widest text-primary border border-primary/20">
                           {fac.subscription_plans.name}
                         </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">
                      <span className="flex items-center gap-1.5">
                        <Activity className="h-3 w-3 text-primary" /> {fac.sport_type} hub
                      </span>
                      <span className="opacity-30">|</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> {new Date(fac.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-8 lg:gap-12 shrink-0">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Approval</p>
                    <div className="flex items-center gap-2">
                       <span className={cn(
                         "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                         fac.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                         fac.status === 'suspended' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                         'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
                       )}>
                         {fac.status || 'pending'}
                       </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Subscription</p>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-1.5 w-1.5 rounded-full", fac.subscription_status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
                      <span className={cn("text-[10px] font-black uppercase italic tracking-widest", fac.subscription_status === 'active' ? 'text-emerald-500' : 'text-red-500')}>
                        {fac.subscription_status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {fac.status === 'pending' && (
                       <button 
                         onClick={() => setConfirmModal({ isOpen: true, facilityId: fac.id })}
                         disabled={loading}
                         className="h-10 px-6 rounded-xl bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-[0.95]"
                       >
                         Approve Account
                       </button>
                    )}
                    <button className="h-10 w-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all">
                      <CreditCard className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditingId(fac.id)} className="h-10 px-5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}

        {filteredFacilities.length === 0 && (
          <div className="py-20 text-center opacity-30 border-2 border-dashed border-border rounded-[32px]">
            <p className="text-xs font-black uppercase tracking-widest italic">Hub registry incoming...</p>
          </div>
        )}
      </div>

      {/* Artisan Feedback Overlays */}
      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, facilityId: null })}
        onConfirm={() => confirmModal.facilityId && handleQuickApprove(confirmModal.facilityId)}
        title="Approve Hub?"
        message="This will activate the organization's account and start their 14-day premium trial immediately."
        confirmLabel="Approve Now"
        type="warning"
        isLoading={loading}
      />

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
