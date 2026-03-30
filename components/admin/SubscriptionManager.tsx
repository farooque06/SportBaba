"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Check, Trash2, Power, PowerOff, Sparkles } from "lucide-react";
import { createSubscriptionPlan, togglePlanStatus, deleteSubscriptionPlan, SubscriptionPlan } from "@/lib/actions/plans";
import { cn, formatCurrency } from "@/lib/utils";

export function SubscriptionManager({ initialPlans }: { initialPlans: SubscriptionPlan[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Optimistic update
    setPlans(plans.map(p => p.id === id ? { ...p, is_active: newStatus } : p));
    const result = await togglePlanStatus(id, newStatus);
    if (!result.success) {
      // Revert if failed
      setPlans(plans.map(p => p.id === id ? { ...p, is_active: currentStatus } : p));
      alert(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    const result = await deleteSubscriptionPlan(id);
    if (result.success) {
      setPlans(plans.filter(p => p.id !== id));
    } else {
      alert(result.error);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createSubscriptionPlan(formData);
    
    if (result.success) {
      window.location.reload(); // Quick refresh to get new plan with real UUID
    } else {
      alert(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8] mb-2">Subs Engine</h1>
          <p className="text-muted-foreground font-medium text-sm tracking-tight opacity-80 uppercase flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Manage Pricing & Tiers
          </p>
        </div>
        <Button 
          onClick={() => setIsCreating(!isCreating)}
          variant={isCreating ? "outline" : "primary"}
          className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px]"
        >
          {isCreating ? "Cancel" : <><Plus className="h-4 w-4 mr-2" /> New Node</>}
        </Button>
      </div>

      {isCreating && (
        <Card className="p-8 bg-card border-primary/20 rounded-[32px] shadow-2xl relative overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          <h2 className="text-2xl font-black italic uppercase mb-6 flex items-center gap-3">
            <Plus className="text-primary" /> Create Subscription Tier
          </h2>
          <form onSubmit={handleCreate} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plan Name</label>
                <input required name="name" placeholder="e.g., Artisan Pro" className="w-full h-12 bg-muted/50 border border-border/50 px-4 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all placeholder:italic" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price (NRS)</label>
                <input required type="number" name="price" placeholder="4999" className="w-full h-12 bg-muted/50 border border-border/50 px-4 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all placeholder:italic" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Billing Interval</label>
                <select name="interval" className="w-full h-12 bg-muted/50 border border-border/50 px-4 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all uppercase tracking-wider">
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</label>
                <input name="description" placeholder="Brief tagline..." className="w-full h-12 bg-muted/50 border border-border/50 px-4 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all placeholder:italic" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Features (Comma Separated)</label>
              <textarea name="features" placeholder="Unlimited players, Analytics dashboard, Artisan Themes..." className="w-full h-24 bg-muted/50 border border-border/50 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all placeholder:italic resize-none custom-scrollbar" />
            </div>
            <Button type="submit" disabled={loading} variant="primary" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs">
              {loading ? "Forging..." : "Forge Subscription Plan"}
            </Button>
          </form>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={cn(
            "p-8 rounded-[32px] transition-all group relative overflow-hidden flex flex-col justify-between",
            plan.is_active 
              ? "bg-card border-border hover:border-primary/50 shadow-xl" 
              : "bg-muted/30 border-border/30 opacity-70 grayscale"
          )}>
            <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">{plan.name}</h3>
                <span className={cn(
                  "px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border",
                  plan.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                  {plan.is_active ? "Active" : "Disabled"}
                </span>
              </div>
              <p className="text-muted-foreground text-sm font-medium mb-6">{plan.description || "No description provided."}</p>
              
              <div className="flex items-end gap-1 mb-8">
                <span className="text-4xl font-black italic tracking-tighter">{formatCurrency(plan.price)}</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">/{plan.interval}</span>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features?.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm font-bold text-foreground opacity-80">{f}</span>
                  </div>
                ))}
                {(!plan.features || plan.features.length === 0) && (
                   <span className="text-xs italic text-muted-foreground opacity-50">No features listed.</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-6 border-t border-border/50 mt-auto relative z-10">
              <Button 
                onClick={() => handleToggle(plan.id, plan.is_active)}
                variant="outline" 
                className={cn(
                  "flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-border/50",
                  !plan.is_active && "text-emerald-500 hover:text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10",
                  plan.is_active && "text-amber-500 hover:text-amber-400 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
                )}
              >
                {plan.is_active ? <><PowerOff className="h-4 w-4 mr-2" /> Suspend</> : <><Power className="h-4 w-4 mr-2" /> Reactivate</>}
              </Button>
              <Button 
                onClick={() => handleDelete(plan.id)}
                variant="outline" 
                className="h-12 w-12 rounded-xl text-red-500 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}

        {plans.length === 0 && !isCreating && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center border-2 border-dashed border-border rounded-[32px] opacity-50">
            <p className="text-sm font-black uppercase tracking-widest italic text-muted-foreground">No Subscriptions Defined</p>
          </div>
        )}
      </div>
    </div>
  );
}
