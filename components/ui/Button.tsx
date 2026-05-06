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
      primary: "bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20",
      secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
      outline: "border border-border bg-transparent hover:bg-muted/50 text-foreground",
      ghost: "bg-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground",
      black: "bg-foreground text-background hover:opacity-90 shadow-lg",
    }

    const sizes = {
      sm: "h-9 px-4 text-xs",
      md: "h-11 px-6 text-sm",
      lg: "h-12 px-8 text-base",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-200 md:active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none cursor-pointer min-h-[44px]",
          variants[variant],
          sizes[size],
          className
        )}
        style={{ touchAction: 'manipulation' }}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
