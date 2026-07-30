import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-sm hover:bg-primary-hover active:bg-primary-pressed",
        accent:
          "bg-accent text-white shadow-sm hover:bg-accent-hover active:bg-accent-hover",
        secondary:
          "bg-white text-foreground border border-border-hover hover:bg-background-secondary",
        outline:
          "border border-border-hover bg-white text-foreground hover:bg-background-secondary",
        ghost: "text-muted-secondary hover:bg-background-hover hover:text-foreground",
        white: "bg-white text-foreground border border-border shadow-sm hover:bg-background-secondary",
        destructive: "bg-error text-white hover:bg-error/90",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-[12px] px-4 text-xs",
        lg: "h-12 rounded-[14px] px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
