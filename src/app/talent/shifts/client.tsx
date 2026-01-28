"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, DollarSign, Filter, ChevronRight } from "lucide-react";
import { GigCard } from "@/components/talent";
import { cn } from "@/lib/utils";
import { acceptShift } from "@/lib/actions/talent";
import type { TalentShift } from "@/lib/actions/talent";

interface ShiftsPageClientProps {
    availableShifts: TalentShift[];
    upcomingShifts: TalentShift[];
    pastShifts: TalentShift[];
}

type TabType = "available" | "upcoming" | "past";

export function ShiftsPageClient({
    availableShifts,
    upcomingShifts,
    pastShifts,
}: ShiftsPageClientProps) {
    const [activeTab, setActiveTab] = useState<TabType>("available");
    const [isPending, startTransition] = useTransition();

    const tabs = [
        { id: "available" as TabType, label: "Available", count: availableShifts.length },
        { id: "upcoming" as TabType, label: "Upcoming", count: upcomingShifts.length },
        { id: "past" as TabType, label: "Past", count: pastShifts.length },
    ];

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

    // Convert to Shift format for components
    const convertToShift = (s: TalentShift) => ({
        id: s.id,
        business_id: "",
        title: s.title,
        description: s.description || undefined,
        event_date: s.event_date,
        start_time: s.start_time,
        end_time: s.end_time,
        venue_name: s.venue_name,
        venue_address: s.venue_address || undefined,
        role_type: s.role_type as "bartender" | "server" | "host" | "valet" | "security" | "coat_check" | "sommelier",
        workers_needed: s.workers_needed,
        workers_confirmed: s.workers_confirmed,
        hourly_rate: s.hourly_rate,
        attire_code: s.attire_code || undefined,
        status: s.status as "draft" | "open" | "filled" | "in_progress" | "completed" | "cancelled",
        created_at: "",
    });

    const renderShiftCard = (shift: TalentShift, isCompact = false) => (
        <Link key={shift.id} href={`/talent/shifts/${shift.id}`}>
            <div className={cn(
                "card-luxury-interactive p-3 sm:p-4",
                isCompact ? "flex items-center gap-4" : ""
            )}>
                {isCompact ? (
                    <>
                        <div className="w-12 h-12 rounded-xl bg-accent-gold/10 flex items-center justify-center text-2xl shrink-0">
                            {roleEmoji[shift.role_type] || "💼"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-text-primary truncate">{shift.title}</p>
                            <div className="flex items-center gap-3 text-sm text-text-secondary mt-1">
                                <span className="flex items-center gap-1">
                                    <CalendarDays className="w-3 h-3" />
                                    {formatDate(shift.event_date)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(shift.start_time)}
                                </span>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="font-bold text-accent-gold">${shift.hourly_rate}/hr</p>
                            <span className={cn(
                                "tag text-xs mt-1",
                                shift.assignment?.status === "completed" ? "tag-success" : "tag-gold"
                            )}>
                                {shift.assignment?.status === "completed" ? "Completed" : "Confirmed"}
                            </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-muted shrink-0" />
                    </>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="text-3xl">{roleEmoji[shift.role_type] || "💼"}</span>
                            <div className="flex-1">
                                <span className="tag tag-gold text-xs uppercase tracking-wide">
                                    {shift.role_type.replace("_", " ")}
                                </span>
                                <h3 className="font-serif text-lg font-semibold text-text-primary mt-1">
                                    {shift.title}
                                </h3>
                            </div>
                            <span className={cn(
                                "tag",
                                shift.assignment?.status === "completed" ? "tag-success" : "tag-gold"
                            )}>
                                {shift.assignment?.status === "completed" ? "Done" : "Confirmed"}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                            <span className="flex items-center gap-1">
                                <CalendarDays className="w-4 h-4" />
                                {formatDate(shift.event_date)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {shift.venue_name}
                            </span>
                            <span className="flex items-center gap-1 text-accent-gold font-semibold">
                                <DollarSign className="w-4 h-4" />
                                ${shift.hourly_rate}/hr
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );

    const handleAcceptGig = (shiftId: string) => {
        startTransition(async () => {
            await acceptShift(shiftId);
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-text-primary">
                        My Shifts
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Find gigs and manage your schedule
                    </p>
                </div>
            </div>


            {/* Tabs */}
            {/* Tabs */}
            <div className="flex w-full lg:w-auto gap-2 border-b border-border-subtle overflow-x-auto pb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex-1 lg:flex-none flex items-center justify-center px-1 sm:px-4 py-1.5 sm:py-2 text-sm font-medium whitespace-nowrap transition-all relative cursor-pointer",
                            activeTab === tab.id
                                ? "text-accent-gold"
                                : "text-text-secondary hover:text-text-primary"
                        )}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={cn(
                                "ml-2 px-1.5 py-0.5 text-xs rounded-full",
                                activeTab === tab.id
                                    ? "bg-accent-gold text-bg-primary"
                                    : "bg-bg-elevated text-text-secondary"
                            )}>
                                {tab.count}
                            </span>
                        )}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-gold rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {
                activeTab === "available" && (
                    availableShifts.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                            {availableShifts.map((gig) => (
                                <GigCard
                                    key={gig.id}
                                    shift={convertToShift(gig)}
                                    onAccept={handleAcceptGig}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="card-luxury p-8 text-center">
                            <p className="text-text-muted">No available gigs right now.</p>
                            <p className="text-sm text-text-muted mt-1">Check back soon!</p>
                        </div>
                    )
                )
            }

            {
                activeTab === "upcoming" && (
                    upcomingShifts.length > 0 ? (
                        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                            {upcomingShifts.map((shift) => renderShiftCard(shift))}
                        </div>
                    ) : (
                        <div className="card-luxury p-8 text-center">
                            <p className="text-text-muted">No upcoming shifts.</p>
                            <p className="text-sm text-text-muted mt-1">Apply to available gigs to get started!</p>
                        </div>
                    )
                )
            }

            {
                activeTab === "past" && (
                    pastShifts.length > 0 ? (
                        <div className="space-y-2">
                            {pastShifts.map((shift) => renderShiftCard(shift, true))}
                        </div>
                    ) : (
                        <div className="card-luxury p-8 text-center">
                            <p className="text-text-muted">No past shifts yet.</p>
                        </div>
                    )
                )
            }
        </div >
    );
}
