"use client";

import { X } from "lucide-react";
import { stopImpersonation } from "@/lib/actions/admin";
import { useState } from "react";

export function ImpersonationBanner({ facilityName }: { facilityName: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold shadow-lg">
      <div className="flex items-center gap-2">
        <span className="animate-pulse">🕵️‍♂️</span>
        <span className="uppercase tracking-widest">
          Superadmin Mode: Impersonating <span className="italic">{facilityName}</span>
        </span>
      </div>
      <button 
        onClick={async () => {
          setLoading(true);
          await stopImpersonation();
        }}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md transition-colors disabled:opacity-50"
      >
        <X className="h-3 w-3" />
        {loading ? "EXITING..." : "EXIT IMPERSONATION"}
      </button>
    </div>
  );
}
