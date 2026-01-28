"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

interface SidebarProps {
    items: NavItem[];
    userRole: "business" | "talent";
}

export function Sidebar({ items, userRole }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0 lg:left-0 z-50 bg-bg-secondary border-r border-border-subtle">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-border-subtle">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-gold to-accent-gold-muted flex items-center justify-center">
                        <span className="text-bg-primary font-bold text-sm">S</span>
                    </div>
                    <span className="font-serif text-xl font-semibold text-text-primary">
                        Shift<span className="text-accent-gold">Sync</span>
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {items.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                isActive
                                    ? "bg-accent-gold/10 text-accent-gold border border-accent-gold/20"
                                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="ml-auto bg-accent-gold text-bg-primary text-xs font-bold px-2 py-0.5 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Sign Out */}
            <div className="p-4 border-t border-border-subtle">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-error/10 hover:text-error transition-colors cursor-pointer"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
