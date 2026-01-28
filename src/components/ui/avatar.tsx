import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

interface AvatarProps {
    src?: string | null;
    name: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-16 h-16 text-lg",
    };

    if (src) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src}
                alt={name}
                className={cn(
                    "rounded-full object-cover ring-2 ring-border-subtle",
                    sizeClasses[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                "rounded-full bg-gradient-to-br from-accent-gold to-accent-gold-muted flex items-center justify-center font-semibold text-bg-primary",
                sizeClasses[size],
                className
            )}
        >
            {getInitials(name)}
        </div>
    );
}

interface AvatarGroupProps {
    avatars: { src?: string | null; name: string }[];
    max?: number;
    size?: "sm" | "md" | "lg";
}

export function AvatarGroup({ avatars, max = 4, size = "md" }: AvatarGroupProps) {
    const visible = avatars.slice(0, max);
    const remaining = avatars.length - max;

    const overlapClasses = {
        sm: "-ml-2",
        md: "-ml-3",
        lg: "-ml-4",
    };

    return (
        <div className="flex items-center">
            {visible.map((avatar, index) => (
                <div
                    key={index}
                    className={cn(index > 0 && overlapClasses[size], "relative")}
                    style={{ zIndex: visible.length - index }}
                >
                    <Avatar {...avatar} size={size} />
                </div>
            ))}
            {remaining > 0 && (
                <div
                    className={cn(
                        overlapClasses[size],
                        "rounded-full bg-bg-elevated border-2 border-bg-secondary flex items-center justify-center text-text-secondary font-medium",
                        size === "sm" && "w-8 h-8 text-xs",
                        size === "md" && "w-10 h-10 text-sm",
                        size === "lg" && "w-12 h-12 text-base"
                    )}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
}
