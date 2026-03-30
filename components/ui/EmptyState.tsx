"use client"

import { LucideIcon } from "lucide-react";
import { Card } from "./Card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse-soft" />
        <div className="relative h-24 w-24 bg-card border border-border/40 rounded-[32px] flex items-center justify-center text-primary shadow-2xl overflow-hidden group">
            <Icon className="h-10 w-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent" />
        </div>
      </div>
      
      <div className="space-y-2 max-w-sm mx-auto mb-10">
        <h3 className="text-3xl font-black tracking-tighter italic uppercase text-foreground leading-none">
          {title}
        </h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-relaxed">
          {description}
        </p>
      </div>

      {action && (
        <div className="animate-in fade-in slide-in-from-bottom-4 delay-300 duration-700">
            {action}
        </div>
      )}
    </div>
  );
}
