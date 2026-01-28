"use client";

import { Sidebar, BottomNav, Header } from "@/components/navigation";
import {
    LayoutDashboard,
    Briefcase,
    Calendar,
    MessageSquare,
    DollarSign,
    Settings,
} from "lucide-react";
import type { NavItem } from "@/types";

const talentNavItems: NavItem[] = [
    { label: "Dashboard", href: "/talent/dashboard", icon: LayoutDashboard },
    { label: "Gigs", href: "/talent/shifts", icon: Briefcase },
    { label: "Availability", href: "/talent/availability", icon: Calendar },
    { label: "Messages", href: "/talent/messages", icon: MessageSquare },
    { label: "Earnings", href: "/talent/earnings", icon: DollarSign },
    { label: "Settings", href: "/talent/settings", icon: Settings },
];

export default function TalentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Desktop Sidebar */}
            <Sidebar items={talentNavItems} userRole="talent" />

            {/* Mobile Bottom Nav */}
            <BottomNav items={talentNavItems} />

            {/* Main Content */}
            <main className="lg:pl-[260px] pb-[88px] lg:pb-0 relative">
                <Header variant="minimal" />
                <div className="p-4 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
