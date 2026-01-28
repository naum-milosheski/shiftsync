"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    Clock,
    MapPin,
    DollarSign,
    Shirt,
    Building,
    Navigation,
    Phone,
    CheckCircle,
    Play,
    Square,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock shift data - would come from Supabase
const mockShift = {
    id: "shift-1",
    title: "VIP Bartender - NYE Gala",
    description: "Exclusive New Year's Eve celebration at The Ritz Carlton. High-end clientele expected. Experience with craft cocktails required.",
    event_date: "2024-12-31",
    start_time: "18:00",
    end_time: "02:00",
    venue_name: "The Ritz Carlton",
    venue_address: "123 Luxury Avenue, Beverly Hills, CA 90210",
    role_type: "bartender",
    hourly_rate: 45,
    attire_code: "All black formal attire. No visible tattoos.",
    status: "filled" as const,
    workers_needed: 4,
    workers_confirmed: 4,
    business: {
        company_name: "Elite Events Co.",
        logo_url: null,
    },
};

export default function TalentShiftDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [clockedIn, setClockedIn] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const isUpcoming = mockShift.status === "filled" || mockShift.status === "open";
    const isToday = mockShift.event_date === new Date().toISOString().split("T")[0];

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
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

    const handleClockAction = async () => {
        setIsProcessing(true);
        await new Promise((r) => setTimeout(r, 1000));
        setClockedIn(!clockedIn);
        setIsProcessing(false);
    };

    const openDirections = () => {
        const address = encodeURIComponent(mockShift.venue_address);
        window.open(`https://maps.google.com/maps?q=${address}`, "_blank");
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Shifts</span>
            </button>

            {/* Header Card */}
            <div className="card-luxury overflow-hidden">
                <div className="p-3 sm:p-4 lg:p-6 border-b border-border-subtle bg-gradient-to-r from-accent-gold/10 to-transparent">
                    <div className="flex items-start gap-4">
                        <span className="text-2xl sm:text-4xl lg:text-5xl">
                            {roleEmoji[mockShift.role_type] || "💼"}
                        </span>
                        <div className="flex-1">
                            <span className="tag tag-gold text-xs uppercase tracking-wide">
                                {mockShift.role_type.replace("_", " ")}
                            </span>
                            <h1 className="font-serif text-lg sm:text-xl lg:text-2xl font-semibold text-text-primary mt-2">
                                {mockShift.title}
                            </h1>
                            <div className="flex items-center gap-2 mt-2 text-text-secondary text-sm">
                                <Building className="w-4 h-4" />
                                <span>{mockShift.business.company_name}</span>
                            </div>
                        </div>
                        <span
                            className={cn(
                                "tag",
                                mockShift.status === "filled" ? "tag-success" : "tag-gold"
                            )}
                        >
                            {mockShift.status === "filled" ? "Confirmed" : "Open"}
                        </span>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    {/* Date & Time */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center shrink-0">
                                <CalendarDays className="w-5 h-5 text-accent-gold" />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Date</p>
                                <p className="font-medium text-text-primary">
                                    {formatDate(mockShift.event_date)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 text-accent-gold" />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Time</p>
                                <p className="font-medium text-text-primary">
                                    {formatTime(mockShift.start_time)} - {formatTime(mockShift.end_time)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center shrink-0">
                                <DollarSign className="w-5 h-5 text-accent-gold" />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Pay Rate</p>
                                <p className="font-bold text-accent-gold text-lg">
                                    ${mockShift.hourly_rate}/hr
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Location & Attire */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-accent-gold" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-text-muted">Venue</p>
                                <p className="font-medium text-text-primary">{mockShift.venue_name}</p>
                                <p className="text-sm text-text-secondary">{mockShift.venue_address}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center shrink-0">
                                <Shirt className="w-5 h-5 text-accent-gold" />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Dress Code</p>
                                <p className="font-medium text-text-primary">{mockShift.attire_code}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {mockShift.description && (
                    <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
                        <h3 className="text-sm font-medium text-text-muted mb-2">Description</h3>
                        <p className="text-text-secondary">{mockShift.description}</p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Get Directions */}
                <button
                    onClick={openDirections}
                    className="btn-outline py-3 sm:py-4 flex items-center justify-center gap-3 text-sm sm:text-base"
                >
                    <Navigation className="w-5 h-5" />
                    Get Directions
                </button>

                {/* Contact Business */}
                <button className="btn-outline py-3 sm:py-4 flex items-center justify-center gap-3 text-sm sm:text-base">
                    <Phone className="w-5 h-5" />
                    Contact Business
                </button>
            </div>

            {/* Clock In/Out Section - Only show on shift day */}
            {isUpcoming && (
                <div
                    className={cn(
                        "card-luxury p-4 sm:p-6 border-2 transition-all",
                        clockedIn
                            ? "border-green-500/50 bg-green-500/5"
                            : "border-accent-gold/50 bg-accent-gold/5"
                    )}
                >
                    <div className="flex items-center gap-3 mb-4">
                        {clockedIn ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                            <Clock className="w-6 h-6 text-accent-gold" />
                        )}
                        <div>
                            <h3 className="font-semibold text-text-primary">
                                {clockedIn ? "You're clocked in!" : "Ready to start?"}
                            </h3>
                            <p className="text-sm text-text-secondary">
                                {clockedIn
                                    ? "Tap below when you're done"
                                    : "Clock in when you arrive at the venue"}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleClockAction}
                        disabled={isProcessing}
                        className={cn(
                            "w-full py-3 sm:py-5 rounded-xl font-bold text-base sm:text-lg",
                            "flex items-center justify-center gap-3 transition-all",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            clockedIn
                                ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                                : "bg-gradient-to-r from-accent-gold to-accent-gold-hover text-bg-primary hover:scale-[1.02]"
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
            )}
        </div>
    );
}
