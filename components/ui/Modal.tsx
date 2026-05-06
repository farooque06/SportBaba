"use client";

import { X, AlertTriangle, AlertCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = "Confirm", 
  cancelLabel = "Cancel", 
  type = "info",
  isLoading = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const icons = {
    danger: <AlertTriangle className="h-10 w-10 text-red-500" />,
    warning: <AlertCircle className="h-10 w-10 text-amber-500" />,
    info: <HelpCircle className="h-10 w-10 text-blue-500" />,
  };

  const colors = {
    danger: "bg-red-500/10 border-red-500/20 shadow-red-500/20",
    warning: "bg-amber-500/10 border-amber-500/20 shadow-amber-500/20",
    info: "bg-blue-500/10 border-blue-500/20 shadow-blue-500/20",
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-card w-full max-w-sm rounded-[32px] border border-border/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn("p-10 flex flex-col items-center text-center", colors[type])}>
          <div className="h-20 w-20 rounded-3xl bg-card border border-border/50 flex items-center justify-center mb-6 shadow-xl">
             {icons[type]}
          </div>
          <h3 className="text-2xl font-black tracking-tight italic uppercase mb-4">{title}</h3>
          <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed max-w-[280px]">
            {message}
          </p>
        </div>

        <div className="p-8 pb-24 md:pb-8 space-y-3 bg-muted/10 border-t border-border/10">
          <Button 
            disabled={isLoading}
            variant="primary" 
            className={cn(
               "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg",
               type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 
               type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 
               'bg-primary shadow-primary/20'
            )}
            onClick={onConfirm}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
          <button 
            disabled={isLoading}
            onClick={onClose}
            className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:bg-muted transition-all"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
