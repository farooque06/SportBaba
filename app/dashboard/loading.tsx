import { Card } from "@/components/ui/Card"

export default function DashboardLoading() {
  return (
    <div className="space-y-8 md:space-y-10 animate-pulse pb-20 mesh-gradient p-1 rounded-[48px]">
      {/* Header Skeleton */}
      <div className="px-1 md:px-2 flex flex-col gap-4 mt-8">
        <div className="h-10 md:h-12 w-64 bg-muted/40 rounded-2xl" />
        <div className="h-4 w-48 bg-muted/20 rounded-xl" />
      </div>

      {/* Stats Skeletons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 px-1 md:px-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-8 h-40 bg-card/60 border-border/40 rounded-[40px] flex flex-col justify-between">
            <div className="h-10 w-10 bg-muted/30 rounded-xl" />
            <div className="space-y-2">
              <div className="h-3 w-12 bg-muted/20 rounded" />
              <div className="h-8 w-16 bg-muted/40 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>

      {/* Notifications Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 px-1 md:px-2">
        <Card className="h-64 bg-card/60 border-border/40 rounded-[48px]" />
        <Card className="h-64 bg-card/60 border-border/40 rounded-[48px]" />
      </div>

      {/* Grid Skeleton */}
      <div className="pt-2 md:pt-4 px-1 md:px-2">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-2 bg-primary/20 rounded-full" />
          <div className="h-8 w-48 bg-muted/40 rounded-xl" />
        </div>
        <Card className="h-[600px] bg-card/60 border-border/40 rounded-[48px]" />
      </div>
    </div>
  )
}
