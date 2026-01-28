"use client";

import { useState } from "react";
import { Clock, MapPin, Play, Square } from "lucide-react";
import { cn, formatTimeRange } from "@/lib/utils";
import type { Shift } from "@/types";

interface ActiveShiftBannerProps {
    shift: Shift;
    clockedIn: boolean;
    clockInTime?: string;
    onClockIn?: () => void;
    onClockOut?: () => void;
}

export function ActiveShiftBanner({
    shift,
    clockedIn,
    clockInTime,
    onClockIn,
    onClockOut,
}: ActiveShiftBannerProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAction = async () => {
        setIsProcessing(true);
        if (clockedIn) {
            onClockOut?.();
        } else {
            onClockIn?.();
        }
        setTimeout(() => setIsProcessing(false), 1000);
    };

    // Calculate working time if clocked in
    const getWorkingTime = () => {
        if (!clockInTime) return "0:00";
        const start = new Date(clockInTime);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        return `${hours}:${minutes.toString().padStart(2, "0")}`;
    };

    return (
        <div
            className={cn(
                "rounded-2xl p-4 lg:p-6 border-2 transition-all",
                clockedIn
                    ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 border-green-500/50"
                    : "bg-gradient-to-r from-accent-gold/20 to-amber-500/10 border-accent-gold/50 animate-pulse-gold"
            )}
        >
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            "w-3 h-3 rounded-full",
                            clockedIn ? "bg-green-500 animate-pulse" : "bg-accent-gold"
                        )}
                    />
                    <span className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
                        {clockedIn ? "Currently Working" : "Active Shift Today"}
                    </span>
                </div>
                {clockedIn && (
                    <div className="text-right">
                        <p className="text-xs text-text-muted">Time Worked</p>
                        <p className="text-xl font-mono font-bold text-green-400">
                            {getWorkingTime()}
                        </p>
                    </div>
                )}
            </div>

            {/* Shift Info */}
            <div className="mb-4">
                <h3 className="font-serif text-xl lg:text-2xl font-semibold text-text-primary">
                    {shift.title}
                </h3>
                <div className="flex flex-wrap gap-4 mt-2 text-text-secondary text-sm">
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                            {formatTimeRange(shift.start_time, shift.end_time)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{shift.venue_name}</span>
                    </div>
                </div>
            </div>

            {/* Big Action Button */}
            <button
                onClick={handleAction}
                disabled={isProcessing}
                className={cn(
                    "w-full py-5 lg:py-6 rounded-xl font-bold text-lg lg:text-xl",
                    "flex items-center justify-center gap-3 transition-all",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    clockedIn
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25"
                        : "bg-gradient-to-r from-accent-gold to-accent-gold-hover text-bg-primary hover:scale-[1.02] shadow-lg shadow-accent-gold/25"
                )}
            >
                {isProcessing ? (
                    <span className="animate-spin">⏳</span>
                ) : clockedIn ? (
                    <>
                        <Square className="w-6 h-6" fill="currentColor" />
                        CLOCK OUT
                    </>
                ) : (
                    <>
                        <Play className="w-6 h-6" fill="currentColor" />
                        CLOCK IN
                    </>
                )}
            </button>
        </div>
    );
}
