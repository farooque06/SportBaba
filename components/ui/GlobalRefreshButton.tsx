"use client";

import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function GlobalRefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000); // Spin for at least 1s for visual feedback
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="fixed top-4 right-4 md:top-6 md:right-8 z-50 p-3 bg-background/80 backdrop-blur-md border border-border/50 rounded-full shadow-lg hover:shadow-primary/20 hover:border-primary/50 transition-all group active:scale-95 disabled:opacity-50"
      title="Refresh Current Page"
    >
      <RefreshCcw
        className={cn(
          "h-5 w-5 text-primary/80 group-hover:text-primary transition-colors",
          isRefreshing && "animate-spin"
        )}
      />
    </button>
  );
}
