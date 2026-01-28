"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { StatCard, GigCard, ActiveShiftBanner } from "@/components/talent";
import { RatingPrompt } from "@/components/rating-prompt";
import { clockIn, clockOut, acceptShift } from "@/lib/actions/talent";
import type { ActiveShift, TalentShift } from "@/lib/actions/talent";
import type { EarningsSummary } from "@/lib/actions/earnings";
import type { PendingRating } from "@/lib/actions/ratings";

interface TalentDashboardClientProps {
    activeShift: ActiveShift | null;
    availableShifts: TalentShift[];
    earnings: EarningsSummary | null;
    pendingRating: PendingRating | null;
}

export function TalentDashboardClient({
    activeShift,
    availableShifts,
    earnings,
    pendingRating,
}: TalentDashboardClientProps) {
    const [isPending, startTransition] = useTransition();
    const [localClockedIn, setLocalClockedIn] = useState(!!activeShift?.time_entry?.clock_in);
    const [showRating, setShowRating] = useState(!!pendingRating);

    const stats = {
        streak: 7, // Would need to calculate from shifts
        shiftsCompleted: earnings?.totalShifts || 0,
        rating: earnings?.rating || 0,
        earnings: earnings?.pendingBalance || 0 + (earnings?.availableBalance || 0),
    };

    const handleClockIn = () => {
        if (!activeShift?.assignment?.id) return;

        startTransition(async () => {
            const result = await clockIn(activeShift.assignment.id);
            if (result.success) {
                setLocalClockedIn(true);
            }
        });
    };

    const handleClockOut = () => {
        if (!activeShift?.assignment?.id) return;

        startTransition(async () => {
            const result = await clockOut(activeShift.assignment.id);
            if (result.success) {
                setLocalClockedIn(false);
            }
        });
    };

    const handleAcceptGig = (shiftId: string) => {
        startTransition(async () => {
            await acceptShift(shiftId);
        });
    };

    // Convert TalentShift to Shift format for components
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

    return (
        <div className="space-y-6 lg:space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-text-primary">
                    Welcome back, <span className="text-gold-gradient">Pro</span>
                </h1>
                <p className="text-text-secondary mt-1 text-sm sm:text-base">
                    {localClockedIn ? "You're currently on the clock!" : "Ready to earn?"}
                </p>
            </div>

            {/* Active Shift Banner (if active) */}
            {activeShift && (
                <ActiveShiftBanner
                    shift={convertToShift(activeShift)}
                    clockedIn={localClockedIn}
                    clockInTime={activeShift.time_entry?.clock_in || undefined}
                    onClockIn={handleClockIn}
                    onClockOut={handleClockOut}
                />
            )}

            {/* Stats Grid - Mobile: stacked, Desktop: 4 columns */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                <StatCard
                    emoji="🔥"
                    label="Hot Streak"
                    value={stats.streak}
                    subtext="days in a row"
                    variant="fire"
                />
                <StatCard
                    emoji="🏆"
                    label="Shifts Done"
                    value={stats.shiftsCompleted}
                    subtext="lifetime"
                    variant="trophy"
                />
                <StatCard
                    emoji="⭐"
                    label="Rating"
                    value={stats.rating}
                    subtext="average"
                    variant="gold"
                    animate={false}
                />
                <StatCard
                    emoji="💰"
                    label="Balance"
                    value={stats.earnings}
                    subtext="available"
                    variant="success"
                />
            </div>

            {/* Available Gigs Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent-gold" />
                        <h2 className="font-serif text-base sm:text-lg lg:text-xl font-semibold text-text-primary">
                            Available Gigs
                        </h2>
                    </div>
                    <Link
                        href="/talent/shifts"
                        className="flex items-center gap-1 text-sm text-accent-gold hover:text-accent-gold-hover transition-colors"
                    >
                        View All
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Mobile: Stacked Cards, Desktop: 3-column Grid */}
                {availableShifts.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                        {availableShifts.slice(0, 6).map((gig) => (
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
                )}
            </div>

            {/* Quick Actions - Mobile Only */}
            <div className="lg:hidden space-y-3">
                <h3 className="text-text-secondary text-sm font-medium uppercase tracking-wide">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/talent/availability"
                        className="card-luxury-interactive p-4 text-center"
                    >
                        <span className="text-2xl block mb-2">📅</span>
                        <span className="text-sm font-medium text-text-primary">
                            Set Availability
                        </span>
                    </Link>
                    <Link
                        href="/talent/earnings"
                        className="card-luxury-interactive p-4 text-center"
                    >
                        <span className="text-2xl block mb-2">💵</span>
                        <span className="text-sm font-medium text-text-primary">
                            Withdraw Funds
                        </span>
                    </Link>
                </div>
            </div>

            {/* Rating Prompt Modal */}
            {showRating && pendingRating && (
                <RatingPrompt
                    rating={pendingRating}
                    onClose={() => setShowRating(false)}
                />
            )}
        </div>
    );
}
