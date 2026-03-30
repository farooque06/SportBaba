import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'black'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild, ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-white hover:opacity-90 shadow-[0_0_20px_rgba(34,197,94,0.3)]",
      secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
      outline: "border border-border bg-transparent hover:bg-muted text-foreground",
      ghost: "bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground",
      black: "bg-foreground text-background hover:opacity-90 shadow-xl",
    }

    const sizes = {
      sm: "h-9 px-4 text-xs",
      md: "h-11 px-6 text-sm",
      lg: "h-14 px-10 text-lg",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
