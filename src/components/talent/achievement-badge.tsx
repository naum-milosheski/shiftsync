"use client";

import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
    emoji: string;
    title: string;
    description: string;
    earned: boolean;
    earnedDate?: string;
}

export function AchievementBadge({
    emoji,
    title,
    description,
    earned,
    earnedDate,
}: AchievementBadgeProps) {
    return (
        <div
            className={cn(
                "relative rounded-2xl border p-4 transition-all",
                earned
                    ? "bg-gradient-to-br from-accent-gold/20 to-amber-500/5 border-accent-gold/40"
                    : "bg-bg-elevated border-border-subtle opacity-50 grayscale"
            )}
        >
            {/* Glow effect when earned */}
            {earned && (
                <div className="absolute inset-0 rounded-2xl bg-accent-gold/5 animate-pulse" />
            )}

            <div className="relative flex items-center gap-4">
                {/* Badge Icon */}
                <div
                    className={cn(
                        "w-16 h-16 rounded-xl flex items-center justify-center text-4xl",
                        earned
                            ? "bg-accent-gold/20"
                            : "bg-bg-hover"
                    )}
                >
                    {emoji}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h4 className="font-semibold text-text-primary">{title}</h4>
                    <p className="text-sm text-text-secondary">{description}</p>
                    {earned && earnedDate && (
                        <p className="text-xs text-accent-gold mt-1">
                            Earned on {new Date(earnedDate).toLocaleDateString()}
                        </p>
                    )}
                </div>

                {/* Status */}
                {earned ? (
                    <div className="text-2xl">✓</div>
                ) : (
                    <div className="text-text-muted text-2xl">🔒</div>
                )}
            </div>
        </div>
    );
}
