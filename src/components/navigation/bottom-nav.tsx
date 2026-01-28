"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

interface BottomNavProps {
    items: NavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
    const pathname = usePathname();

    // Filter out Settings (accessible via header) and show up to 5 items on mobile
    const mobileItems = items.filter(item => item.label !== "Settings").slice(0, 5);

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-primary border-t border-border-subtle pb-safe">
            <div className="flex items-center justify-around h-[72px] px-2">
                {mobileItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[64px]",
                                isActive
                                    ? "text-accent-gold"
                                    : "text-text-muted hover:text-text-secondary"
                            )}
                        >
                            <div className="relative">
                                <Icon className={cn("w-6 h-6", isActive && "animate-pulse-gold")} />
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-gold text-bg-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {item.badge > 9 ? "9+" : item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={cn(
                                "text-[11px] font-medium",
                                isActive ? "text-accent-gold" : "text-text-muted"
                            )}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute bottom-1 w-5 h-0.5 rounded-full bg-accent-gold" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
