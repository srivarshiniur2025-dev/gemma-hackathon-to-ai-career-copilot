"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? React.useId();

    return (
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className={cn(
            "group flex cursor-pointer items-start gap-3 text-sm text-foreground",
            props.disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
            <input
              type="checkbox"
              id={inputId}
              ref={ref}
              className={cn(
                "peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-border-hover bg-white transition-all duration-200",
                "checked:border-accent checked:bg-accent",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20",
                "disabled:cursor-not-allowed",
                className
              )}
              {...props}
            />
            <Check className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
          </span>
          {label && <span className="leading-snug text-muted-secondary group-hover:text-foreground">{label}</span>}
        </label>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
