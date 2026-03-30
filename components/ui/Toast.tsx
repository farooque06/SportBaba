"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const bgStyles = {
    success: "bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10",
    error: "bg-red-500/10 border-red-500/20 shadow-red-500/10",
    info: "bg-blue-500/10 border-blue-500/20 shadow-blue-500/10",
  };

  return (
    <div className={cn(
      "fixed bottom-8 left-1/2 -translate-x-1/2 z-[500] transition-all duration-300 ease-out flex items-center gap-3 px-6 py-4 rounded-[24px] border backdrop-blur-xl shadow-2xl",
      bgStyles[type],
      isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"
    )}>
      <div className="shrink-0">{icons[type]}</div>
      <p className="text-sm font-black uppercase tracking-tight text-foreground/80 pr-4">{message}</p>
      <button 
        onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
        className="shrink-0 p-1 rounded-full hover:bg-foreground/5 transition-colors"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
