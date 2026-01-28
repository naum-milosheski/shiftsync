"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Clock, DollarSign, Briefcase, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Shift } from "@/types";

interface GigCardProps {
    shift: Shift;
    onAccept?: (shiftId: string) => void;
    variant?: "compact" | "full";
}

export function GigCard({ shift, onAccept, variant = "full" }: GigCardProps) {
    const [isAccepting, setIsAccepting] = useState(false);

    const handleAccept = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsAccepting(true);
        onAccept?.(shift.id);
        // Reset after animation
        setTimeout(() => setIsAccepting(false), 2000);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const roleEmoji: Record<string, string> = {
        bartender: "🍸",
        server: "🍽️",
        host: "🎩",
        valet: "🚗",
        security: "🛡️",
        coat_check: "🧥",
        sommelier: "🍷",
    };

    if (variant === "compact") {
        return (
            <Link href={`/talent/shifts/${shift.id}`}>
                <div className="card-luxury-interactive p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-gold/10 flex items-center justify-center text-2xl">
                        {roleEmoji[shift.role_type] || "💼"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary truncate">{shift.title}</p>
                        <p className="text-sm text-text-secondary">{formatDate(shift.event_date)}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-accent-gold">${shift.hourly_rate}/hr</p>
                        <ChevronRight className="w-5 h-5 text-text-muted ml-auto" />
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <div className="card-luxury overflow-hidden group">
            {/* Header with Role */}
            <div className="p-3 sm:p-4 border-b border-border-subtle bg-gradient-to-r from-accent-gold/10 to-transparent">
                <div className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl">{roleEmoji[shift.role_type] || "💼"}</span>
                    <div>
                        <span className="tag tag-gold text-xs uppercase tracking-wide">
                            {shift.role_type.replace("_", " ")}
                        </span>
                        <h3 className="font-serif text-lg font-semibold text-text-primary mt-1">
                            {shift.title}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="p-3 sm:p-4 space-y-3">
                <div className="flex items-center gap-2 text-text-secondary">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                        {formatDate(shift.event_date)} • {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm truncate">{shift.venue_name}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-semibold text-accent-gold">${shift.hourly_rate}/hr</span>
                </div>
            </div>

            {/* Action */}
            <div className="p-3 sm:p-4 border-t border-border-subtle flex gap-2">
                <Link
                    href={`/talent/shifts/${shift.id}`}
                    className="flex-1 btn-outline flex items-center justify-center text-sm py-2 sm:py-3"
                >
                    View Details
                </Link>
                <button
                    onClick={handleAccept}
                    disabled={isAccepting}
                    className={cn(
                        "flex-1 btn-gold flex items-center justify-center text-sm py-2 sm:py-3 transition-all",
                        isAccepting && "bg-green-500 scale-105"
                    )}
                >
                    {isAccepting ? "✓ Applied!" : "One-Tap Accept"}
                </button>
            </div>
        </div>
    );
}
