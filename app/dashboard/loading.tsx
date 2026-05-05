import { Card } from "@/components/ui/Card"

export default function DashboardLoading() {
  return (
    <div className="space-y-6 md:space-y-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-28 bg-muted/60 rounded-full" />
        <div className="h-10 w-72 bg-muted/40 rounded-2xl" />
        <div className="h-4 w-56 bg-muted/30 rounded-lg" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} hover={false} className="p-5 md:p-8 space-y-4">
            <div className="h-12 w-12 bg-muted/40 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-3 w-16 bg-muted/30 rounded-full" />
              <div className="h-8 w-20 bg-muted/50 rounded-xl" />
            </div>
            <div className="pt-4 border-t border-border/10">
              <div className="h-5 w-14 bg-muted/20 rounded-full" />
            </div>
          </Card>
        ))}
      </div>

      {/* Booking Grid Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-2 bg-primary/20 rounded-full" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted/40 rounded-xl" />
            <div className="h-3 w-64 bg-muted/20 rounded-lg" />
          </div>
        </div>
        <div className="rounded-[48px] border border-border/20 bg-card/20 p-6 space-y-3">
          {/* Toolbar skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-12 w-52 bg-muted/30 rounded-2xl" />
            <div className="h-12 w-36 bg-primary/10 rounded-xl" />
          </div>
          {/* Grid rows */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="h-[60px] w-[90px] bg-muted/20 rounded-lg shrink-0" />
              <div className="h-[60px] flex-1 bg-muted/10 rounded-lg" />
              <div className="h-[60px] flex-1 bg-muted/10 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
