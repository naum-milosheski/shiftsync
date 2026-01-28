import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "gold" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "gold",
            size = "md",
            isLoading = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed",
                    // Variants
                    variant === "gold" &&
                    "bg-gradient-to-r from-accent-gold to-accent-gold-muted text-bg-primary hover:from-accent-gold-hover hover:to-accent-gold shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:ring-accent-gold/50",
                    variant === "outline" &&
                    "border border-border-medium text-text-primary hover:bg-bg-hover hover:border-accent-gold hover:text-accent-gold focus:ring-accent-gold/50",
                    variant === "ghost" &&
                    "text-text-secondary hover:bg-bg-hover hover:text-text-primary focus:ring-text-muted/50",
                    variant === "danger" &&
                    "bg-error text-white hover:bg-error/90 focus:ring-error/50",
                    // Sizes
                    size === "sm" && "px-3 py-1.5 text-sm",
                    size === "md" && "px-5 py-2.5 text-sm",
                    size === "lg" && "px-6 py-3 text-base",
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
