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
        "rounded-[32px] border border-border bg-card p-8 text-card-foreground",
        glass && "glass-card",
        glint && "glint-effect",
        hover && "transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-accent/40",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card }
