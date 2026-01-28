import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "gold" | "success" | "warning" | "error" | "neutral";
    size?: "sm" | "md";
}

export function Badge({
    className,
    variant = "neutral",
    size = "md",
    children,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center font-mono font-medium rounded-full border",
                // Variants
                variant === "gold" &&
                "bg-accent-gold/15 text-accent-gold border-accent-gold/30",
                variant === "success" &&
                "bg-success/15 text-success border-success/30",
                variant === "warning" &&
                "bg-warning/15 text-warning border-warning/30",
                variant === "error" && "bg-error/15 text-error border-error/30",
                variant === "neutral" &&
                "bg-bg-elevated text-text-secondary border-border-subtle",
                // Sizes
                size === "sm" && "px-2 py-0.5 text-[10px]",
                size === "md" && "px-2.5 py-1 text-xs",
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}

interface StatusDotProps {
    status: "online" | "busy" | "offline" | "pending";
    className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
    return (
        <span
            className={cn(
                "inline-block w-2 h-2 rounded-full",
                status === "online" && "bg-success shadow-[0_0_8px] shadow-success",
                status === "busy" && "bg-error shadow-[0_0_8px] shadow-error",
                status === "pending" && "bg-warning shadow-[0_0_8px] shadow-warning",
                status === "offline" && "bg-text-muted",
                className
            )}
        />
    );
}
