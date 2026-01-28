"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    DollarSign,
    Filter,
    Check,
    Plus
} from "lucide-react";
import { cn, formatTimeRange, formatDate } from "@/lib/utils";

interface Shift {
    id: string;
    title: string;
    status: string;
    event_date: string;
    start_time: string;
    end_time: string;
    venue_name: string;
    workers_needed: number;
    workers_confirmed: number;
    hourly_rate: number;
}

interface ShiftsListProps {
    shifts: Shift[];
}

const statusColors: Record<string, "warning" | "success" | "error" | "neutral" | "gold"> = {
    draft: "neutral",
    open: "warning",
    filled: "success",
    in_progress: "gold",
    completed: "success",
    cancelled: "error",
};

const statusLabels: Record<string, string> = {
    draft: "Draft",
    open: "Open",
    filled: "Filled",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
};

// Filter categories that group multiple statuses
const filterCategories = [
    { key: "open", label: "Open", statuses: ["draft", "open"] },
    { key: "filled", label: "Filled", statuses: ["filled", "in_progress"] },
    { key: "completed", label: "Completed", statuses: ["completed"] },
];

export default function ShiftsList({ shifts }: ShiftsListProps) {
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleFilter = (filterKey: string) => {
        setActiveFilters(prev =>
            prev.includes(filterKey)
                ? prev.filter(f => f !== filterKey)
                : [...prev, filterKey]
        );
    };

    // Filter shifts based on active filters
    const getFilteredShifts = (shiftsToFilter: Shift[]) => {
        if (activeFilters.length === 0) return shiftsToFilter;

        const allowedStatuses = filterCategories
            .filter(cat => activeFilters.includes(cat.key))
            .flatMap(cat => cat.statuses);

        return shiftsToFilter.filter(shift => allowedStatuses.includes(shift.status));
    };

    const upcomingShifts = shifts.filter(s =>
        new Date(s.event_date) >= new Date() && s.status !== "cancelled"
    );
    const pastShifts = shifts.filter(s =>
        new Date(s.event_date) < new Date() || s.status === "completed"
    );

    const filteredUpcoming = getFilteredShifts(upcomingShifts);
    const filteredPast = getFilteredShifts(pastShifts);

    const hasActiveFilters = activeFilters.length > 0;

    return (
        <>
            {/* Upcoming Shifts */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-lg sm:text-xl font-semibold text-text-primary">
                        Upcoming Shifts
                    </h2>

                    {/* Filter Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={cn(
                                "cursor-pointer",
                                hasActiveFilters
                                    ? "border border-accent-gold text-accent-gold hover:bg-accent-gold/10"
                                    : ""
                            )}
                        >
                            <Filter className="w-4 h-4" />
                            Filter
                            {hasActiveFilters && (
                                <span className="ml-1 text-xs bg-accent-gold text-bg-primary px-1.5 py-0.5 rounded-full font-semibold">
                                    {activeFilters.length}
                                </span>
                            )}
                        </Button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-bg-elevated border border-border-subtle rounded-xl shadow-xl z-50 py-2">
                                <p className="px-3 py-2 text-xs text-text-muted uppercase tracking-wide">
                                    Filter by Status
                                </p>
                                {filterCategories.map((category) => {
                                    const isActive = activeFilters.includes(category.key);
                                    return (
                                        <button
                                            key={category.key}
                                            onClick={() => toggleFilter(category.key)}
                                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-bg-primary transition-colors text-left cursor-pointer"
                                        >
                                            <span className={isActive ? "text-accent-gold font-medium" : "text-text-secondary"}>
                                                {category.label}
                                            </span>
                                            {isActive && (
                                                <Check className="w-4 h-4 text-accent-gold" />
                                            )}
                                        </button>
                                    );
                                })}
                                {hasActiveFilters && (
                                    <>
                                        <div className="border-t border-border-subtle my-2" />
                                        <button
                                            onClick={() => setActiveFilters([])}
                                            className="w-full px-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors text-left"
                                        >
                                            Clear filters
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {filteredUpcoming.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Calendar className="w-12 h-12 mx-auto text-text-muted mb-4" />
                            <h3 className="font-serif text-lg font-semibold text-text-primary mb-2">
                                {hasActiveFilters ? "No Matching Shifts" : "No Upcoming Shifts"}
                            </h3>
                            <p className="text-text-secondary mb-4">
                                {hasActiveFilters
                                    ? "Try adjusting your filters to see more shifts"
                                    : "Post your first shift to start finding talent"
                                }
                            </p>
                            {hasActiveFilters ? (
                                <Button variant="outline" onClick={() => setActiveFilters([])}>
                                    Clear Filters
                                </Button>
                            ) : (
                                <Link href="/business/shifts/new">
                                    <Button>
                                        <Plus className="w-4 h-4" />
                                        Post New Shift
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredUpcoming.map((shift) => (
                            <Link key={shift.id} href={`/business/shifts/${shift.id}`}>
                                <Card variant="interactive" className="hover:border-accent-gold/30">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                                    <h3 className="font-serif text-base sm:text-lg font-semibold text-text-primary">
                                                        {shift.title}
                                                    </h3>
                                                    <Badge variant={statusColors[shift.status]} className="text-[10px] sm:text-xs">
                                                        {statusLabels[shift.status]}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-text-secondary">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        {formatDate(shift.event_date)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        {formatTimeRange(shift.start_time, shift.end_time)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        {shift.venue_name}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle mt-2 sm:mt-0">
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1 text-text-primary">
                                                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        <span className="font-semibold text-sm sm:text-base">
                                                            {shift.workers_confirmed}/{shift.workers_needed}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] sm:text-xs text-text-muted">Confirmed</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1 text-accent-gold">
                                                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        <span className="font-semibold text-sm sm:text-base">{shift.hourly_rate}</span>
                                                    </div>
                                                    <p className="text-[10px] sm:text-xs text-text-muted">/hour</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Past Shifts */}
            {filteredPast.length > 0 && (
                <div>
                    <h2 className="font-serif text-lg sm:text-xl font-semibold text-text-primary mb-4">
                        Past Shifts
                    </h2>
                    <div className="space-y-4 opacity-75">
                        {filteredPast.slice(0, 5).map((shift) => (
                            <Link key={shift.id} href={`/business/shifts/${shift.id}`}>
                                <Card variant="interactive">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <h3 className="font-serif text-sm sm:text-base font-semibold text-text-primary">
                                                    {shift.title}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-text-muted mt-1">
                                                    {new Date(shift.event_date).toLocaleDateString()} • {shift.venue_name}
                                                </p>
                                            </div>
                                            <Badge variant={statusColors[shift.status]} className="text-[10px] sm:text-xs">
                                                {statusLabels[shift.status]}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
