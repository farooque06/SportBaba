"use client"

import { Card } from "@/components/ui/Card";
import { Package, Plus, ArrowRight, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function InventoryAlerts() {
  return (
    <Card className="h-full bg-card/40 border-border/40 rounded-[48px] p-8 md:p-10 relative overflow-hidden group hover:border-primary/20 transition-all flex flex-col justify-between">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Zap className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Action Center</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Hub Operations</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Real-time inventory & sales optimizations</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-[24px] bg-muted/20 border border-border/20 flex items-center justify-between hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight italic">Product Spotlight</p>
                  <p className="text-[10px] font-bold text-muted-foreground opacity-60">Monitor your top-selling items</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
            </div>

            <div className="p-4 rounded-[24px] bg-muted/20 border border-border/20 flex items-center justify-between hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight italic">Stock Check</p>
                  <p className="text-[10px] font-bold text-muted-foreground opacity-60">Coming Soon: Automatic low-stock alerts</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-8">
        <Link href="/dashboard/inventory">
            <Button className="w-full h-14 rounded-2xl bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3">
              <Plus className="h-4 w-4" />
              Manage Inventory Hub
            </Button>
        </Link>
      </div>

      {/* Decorative backdrop */}
      <Zap className="absolute -right-8 -bottom-8 h-48 w-48 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
    </Card>
  );
}
