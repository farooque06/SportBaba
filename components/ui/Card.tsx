import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glass?: boolean
  glint?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, glass = false, glint = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-border/50 bg-card p-6 text-card-foreground",
        glass && "glass-card",
        hover && "transition-colors duration-300 md:hover:-translate-y-1 md:hover:shadow-lg hover:border-primary/20",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card }
