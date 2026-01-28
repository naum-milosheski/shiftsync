"use client";

import { useState, useTransition, useEffect } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    toggleBlockedDate,
    blockDateRange,
    clearMonth,
    getBlockedDates,
    getBookedDates,
} from "@/lib/actions/availability";
import type { BlockedDate, BookedDate } from "@/lib/actions/availability";

interface AvailabilityPageClientProps {
    initialBlockedDates: BlockedDate[];
    initialBookedDates: BookedDate[];
    initialYear: number;
    initialMonth: number;
}

type DayStatus = "available" | "unavailable" | "booked";

export function AvailabilityPageClient({
    initialBlockedDates,
    initialBookedDates,
    initialYear,
    initialMonth,
}: AvailabilityPageClientProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date(initialYear, initialMonth, 1));
    const [blockedDates, setBlockedDates] = useState<Set<string>>(
        new Set(initialBlockedDates.map((d) => d.blocked_date))
    );
    const [bookedDates, setBookedDates] = useState<Set<string>>(
        new Set(initialBookedDates.map((d) => d.date))
    );
    const [isPending, startTransition] = useTransition();
    const [loadingDate, setLoadingDate] = useState<string | null>(null);

    // Fetch data when month changes
    useEffect(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        startTransition(async () => {
            const [blocked, booked] = await Promise.all([
                getBlockedDates(year, month),
                getBookedDates(year, month),
            ]);
            setBlockedDates(new Set(blocked.map((d) => d.blocked_date)));
            setBookedDates(new Set(booked.map((d) => d.date)));
        });
    }, [currentMonth]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];

        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const formatDateKey = (date: Date) => {
        return date.toISOString().split("T")[0];
    };

    const getDayStatus = (date: Date): DayStatus => {
        const key = formatDateKey(date);
        if (bookedDates.has(key)) return "booked";
        if (blockedDates.has(key)) return "unavailable";
        return "available";
    };

    const handleToggleDay = (date: Date) => {
        const key = formatDateKey(date);
        if (bookedDates.has(key)) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) return;

        setLoadingDate(key);

        startTransition(async () => {
            const result = await toggleBlockedDate(key);
            if (result.success) {
                setBlockedDates((prev) => {
                    const next = new Set(prev);
                    if (result.blocked) {
                        next.add(key);
                    } else {
                        next.delete(key);
                    }
                    return next;
                });
            }
            setLoadingDate(null);
        });
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const resetMonth = () => {
        setCurrentMonth(new Date());
    };

    const handleBlockWeekends = () => {
        const days = getDaysInMonth(currentMonth);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekendDates = days
            .filter((day) => {
                if (!day || day < today) return false;
                if (bookedDates.has(formatDateKey(day))) return false;
                const dayOfWeek = day.getDay();
                return dayOfWeek === 0 || dayOfWeek === 6;
            })
            .map((day) => formatDateKey(day!));

        startTransition(async () => {
            await blockDateRange(weekendDates);
            weekendDates.forEach((d) => setBlockedDates((prev) => new Set(prev).add(d)));
        });
    };

    const handleBlockWeekdays = () => {
        const days = getDaysInMonth(currentMonth);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekdayDates = days
            .filter((day) => {
                if (!day || day < today) return false;
                if (bookedDates.has(formatDateKey(day))) return false;
                const dayOfWeek = day.getDay();
                return dayOfWeek !== 0 && dayOfWeek !== 6;
            })
            .map((day) => formatDateKey(day!));

        startTransition(async () => {
            await blockDateRange(weekdayDates);
            weekdayDates.forEach((d) => setBlockedDates((prev) => new Set(prev).add(d)));
        });
    };

    const handleClearMonth = () => {
        startTransition(async () => {
            await clearMonth(currentMonth.getFullYear(), currentMonth.getMonth());
            setBlockedDates(new Set());
        });
    };

    const days = getDaysInMonth(currentMonth);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="font-serif text-2xl lg:text-3xl font-semibold text-text-primary">
                    Availability
                </h1>
                <p className="text-text-secondary mt-1">
                    Tap dates to mark when you're unavailable
                </p>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 lg:flex lg:flex-wrap lg:gap-6">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-accent-gold/30 border border-accent-gold shrink-0" />
                    <span className="text-xs sm:text-sm text-text-secondary truncate">Available</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-bg-elevated border border-border-subtle shrink-0" />
                    <span className="text-xs sm:text-sm text-text-secondary truncate">Unavailable</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500/30 border border-green-500 shrink-0" />
                    <span className="text-xs sm:text-sm text-text-secondary truncate">Booked</span>
                </div>
            </div>

            {/* Calendar Card */}
            <div className="card-luxury p-3 sm:p-4 lg:p-6 max-w-sm mx-auto">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-text-secondary" />
                    </button>

                    <div className="flex items-center gap-3">
                        <h2 className="font-serif text-xl font-semibold text-text-primary">
                            {currentMonth.toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                            })}
                        </h2>
                        <button
                            onClick={resetMonth}
                            className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors"
                            title="Go to today"
                        >
                            <RefreshCw className="w-4 h-4 text-text-muted" />
                        </button>
                        {isPending && <Loader2 className="w-4 h-4 text-accent-gold animate-spin" />}
                    </div>

                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                {/* Week Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day) => (
                        <div
                            key={day}
                            className="text-center text-[10px] sm:text-xs lg:text-sm font-medium text-text-muted py-2"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                        if (!day) {
                            return <div key={`empty-${index}`} className="aspect-square" />;
                        }

                        const key = formatDateKey(day);
                        const status = getDayStatus(day);
                        const isPast = day < today;
                        const isToday = day.getTime() === today.getTime();
                        const isLoading = loadingDate === key;

                        return (
                            <button
                                key={key}
                                onClick={() => handleToggleDay(day)}
                                disabled={isPast || status === "booked" || isLoading}
                                className={cn(
                                    "aspect-square rounded-xl flex items-center justify-center text-xs sm:text-sm lg:text-base font-medium transition-all relative",
                                    "focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-offset-2 focus:ring-offset-bg-primary",
                                    isPast && "opacity-30 cursor-not-allowed",
                                    !isPast && status === "available" && "bg-accent-gold/20 border border-accent-gold/40 text-accent-gold hover:bg-accent-gold/30",
                                    !isPast && status === "unavailable" && "bg-bg-elevated border border-border-subtle text-text-muted hover:bg-bg-hover",
                                    status === "booked" && "bg-green-500/20 border border-green-500/40 text-green-400 cursor-not-allowed",
                                    isToday && "ring-2 ring-accent-gold ring-offset-1 sm:ring-offset-2 ring-offset-bg-secondary"
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    day.getDate()
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card-luxury p-4 lg:p-6">
                <h3 className="font-medium text-text-primary mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <button
                        onClick={handleBlockWeekends}
                        disabled={isPending}
                        className="btn-outline py-3 text-sm"
                    >
                        Block Weekends
                    </button>
                    <button
                        onClick={handleBlockWeekdays}
                        disabled={isPending}
                        className="btn-outline py-3 text-sm"
                    >
                        Block Weekdays
                    </button>
                    <button
                        onClick={handleClearMonth}
                        disabled={isPending}
                        className="btn-outline py-3 text-sm col-span-2 lg:col-span-1"
                    >
                        Clear Month
                    </button>
                </div>
            </div>
        </div>
    );
}
