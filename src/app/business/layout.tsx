"use client";

import { Sidebar, BottomNav, Header } from "@/components/navigation";
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    MessageSquare,
    Settings,
} from "lucide-react";
import type { NavItem } from "@/types";

const businessNavItems: NavItem[] = [
    { label: "Dashboard", href: "/business/dashboard", icon: LayoutDashboard },
    { label: "Shifts", href: "/business/shifts", icon: CalendarDays },
    { label: "Team", href: "/business/team", icon: Users },
    { label: "Messages", href: "/business/messages", icon: MessageSquare, badge: 3 },
    { label: "Settings", href: "/business/settings", icon: Settings },
];

export default function BusinessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Desktop Sidebar */}
            <Sidebar items={businessNavItems} userRole="business" />

            {/* Mobile Bottom Nav */}
            <BottomNav items={businessNavItems} />

            {/* Main Content */}
            <main className="lg:pl-[260px] pb-[88px] lg:pb-0">
                <Header />
                <div className="p-4 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
