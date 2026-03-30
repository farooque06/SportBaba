"use client"

import { Card } from "@/components/ui/Card";
import { TrendingUp, ArrowUpRight } from "lucide-react";

interface RevenueGaugeProps {
  today: number;
  target: number;
}

export function RevenueGauge({ today, target }: RevenueGaugeProps) {
  const percentage = Math.min(100, (today / target) * 100);
  const strokeDasharray = 251.2; // 2 * PI * 40
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray;

  return (
    <Card className="p-6 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Daily Revenue</p>
          <h3 className="text-3xl font-black tracking-tighter">NRS {today.toLocaleString()}</h3>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>

      <div className="flex justify-center items-center py-4 relative">
        <svg className="h-40 w-40 transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="40"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-muted/20"
          />
          <circle
            cx="80"
            cy="80"
            r="40"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className="text-primary transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-2xl font-black tracking-tighter">{Math.round(percentage)}%</span>
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">of goal</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-muted-foreground">Target: NRS {target.toLocaleString()}</span>
        <span className="flex items-center gap-1 text-primary">
          <ArrowUpRight className="h-3 w-3" />
          Keep it up
        </span>
      </div>
    </Card>
  );
}
