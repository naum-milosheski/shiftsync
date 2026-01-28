"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    "flex min-h-[80px] w-full rounded-xl border border-border-subtle bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/30 focus-visible:border-accent-gold disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors",
                    className
                )}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
