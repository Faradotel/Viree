"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { hapticFeedback } from "@/utils/haptics"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation select-none active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline active:no-underline",
      },
      size: {
        default: "h-11 px-4 py-2 min-w-[44px]", // Increased height for better touch targets
        sm: "h-9 rounded-md px-3 min-w-[36px]",
        lg: "h-12 rounded-md px-8 min-w-[48px]", // Even larger for primary actions
        icon: "h-11 w-11", // Square touch target
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  haptic?: "tap" | "press" | "selection" | "impact" | "success" | false
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, haptic = "tap", onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback based on type
      if (haptic) {
        switch (haptic) {
          case "tap":
            hapticFeedback.tap()
            break
          case "press":
            hapticFeedback.press()
            break
          case "selection":
            hapticFeedback.selection()
            break
          case "impact":
            hapticFeedback.impact()
            break
          case "success":
            hapticFeedback.success()
            break
        }
      }

      // Call the original onClick handler
      onClick?.(event)
    }

    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} onClick={handleClick} {...props} />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
