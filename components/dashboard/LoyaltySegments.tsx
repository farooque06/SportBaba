"use client"

import { Card } from "@/components/ui/Card";
import { UserCheck } from "lucide-react";

interface LoyaltySegmentsProps {
  counts: {
    bronze: number;
    silver: number;
    gold: number;
  };
}

export function LoyaltySegments({ counts }: LoyaltySegmentsProps) {
  const total = counts.bronze + counts.silver + counts.gold || 1;
  const getWidth = (count: number) => (count / total) * 100;

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <UserCheck className="h-4 w-4" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Customer Loyalty Base</h3>
      </div>

      <div className="flex-1 space-y-6">
        <Segment label="Gold (16+ visits)" count={counts.gold} width={getWidth(counts.gold)} color="bg-yellow-500" />
        <Segment label="Silver (6-15 visits)" count={counts.silver} width={getWidth(counts.silver)} color="bg-slate-400" />
        <Segment label="Bronze (1-5 visits)" count={counts.bronze} width={getWidth(counts.bronze)} color="bg-orange-700" />
      </div>

      <div className="mt-8 pt-4 border-t border-border/50 text-center">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          Total Players: <span className="text-foreground">{counts.bronze + counts.silver + counts.gold}</span>
        </p>
      </div>
    </Card>
  );
}

function Segment({ label, count, width, color }: { label: string, count: number, width: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">{label}</span>
        <span className="text-sm font-black tracking-tighter">{count}</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${Math.max(2, width)}%` }} 
        />
      </div>
    </div>
  )
}
