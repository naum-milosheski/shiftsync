"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Search, Menu, X, Calendar, MessageSquare, Users, DollarSign, ChevronRight, Briefcase, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
    title?: string;
    showSearch?: boolean;
    className?: string;
    variant?: "default" | "minimal";
}

interface SearchResult {
    id: string;
    type: "shift" | "message" | "talent" | "page";
    title: string;
    subtitle: string;
    href: string;
    icon: React.ReactNode;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: "shift" | "message" | "payment" | "system";
    href?: string;
}

// Demo search results
const demoSearchResults: SearchResult[] = [
    { id: "1", type: "shift", title: "NYE Gala Bartenders", subtitle: "Dec 31, 2024 • Sterling Events", href: "/business/shifts/s1000000-0000-0000-0000-000000000001", icon: <Calendar className="w-4 h-4 text-accent-gold" /> },
    { id: "2", type: "shift", title: "Corporate Mixer", subtitle: "Jan 5, 2025 • Open", href: "/business/shifts/s1000000-0000-0000-0000-000000000002", icon: <Calendar className="w-4 h-4 text-accent-gold" /> },
    { id: "3", type: "talent", title: "Marcus Beaumont", subtitle: "Bartender • 4.95★", href: "/business/team", icon: <Image src="/images/talent/marcus.png" alt="Marcus" width={32} height={32} className="rounded-lg object-cover" /> },
    { id: "4", type: "talent", title: "Isabella Vance", subtitle: "Sommelier • 4.88★", href: "/business/team", icon: <Image src="/images/talent/isabella.png" alt="Isabella" width={32} height={32} className="rounded-lg object-cover" /> },
    { id: "5", type: "message", title: "James Thornton", subtitle: "Thank you for the opportunity!", href: "/business/messages", icon: <MessageSquare className="w-4 h-4 text-info" /> },
    { id: "6", type: "page", title: "Dashboard", subtitle: "View your overview", href: "/business/dashboard", icon: <Briefcase className="w-4 h-4 text-text-muted" /> },
    { id: "7", type: "page", title: "Team", subtitle: "Manage your talent roster", href: "/business/team", icon: <Users className="w-4 h-4 text-text-muted" /> },
    { id: "8", type: "page", title: "Settings", subtitle: "Manage your account", href: "/business/settings", icon: <Briefcase className="w-4 h-4 text-text-muted" /> },
];

// Demo notifications
const demoNotifications: Notification[] = [
    { id: "1", title: "Shift Filled", message: "NYE Gala Bartenders is now fully staffed", time: "5m ago", read: false, type: "shift", href: "/business/shifts" },
    { id: "2", title: "New Message", message: "Marcus Beaumont sent you a message", time: "15m ago", read: false, type: "message", href: "/business/messages" },
    { id: "3", title: "Payment Processed", message: "$1,240 sent for Corporate Mixer", time: "1h ago", read: true, type: "payment" },
    { id: "4", title: "Application Received", message: "Sophia Chen applied for Wine Tasting event", time: "2h ago", read: true, type: "shift", href: "/business/shifts" },
];

export function Header({ title, showSearch = true, className, variant = "default" }: HeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [notifications, setNotifications] = useState(demoNotifications);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const resultRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Filter search results based on query
    const filteredResults = searchQuery.trim()
        ? demoSearchResults.filter(r =>
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : demoSearchResults.slice(0, 6);

    // Keyboard shortcut for search (⌘K / Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === "Escape") {
                setIsSearchOpen(false);
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Reset selected index when search query or modal changes
    useEffect(() => {
        setSelectedIndex(0);
        resultRefs.current = [];
    }, [searchQuery, isSearchOpen]);

    // Auto-scroll selected item into view
    useEffect(() => {
        const selectedRef = resultRefs.current[selectedIndex];
        if (selectedRef) {
            selectedRef.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
    }, [selectedIndex]);

    // Arrow key navigation for search results
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && filteredResults.length > 0) {
            e.preventDefault();
            handleSearchSelect(filteredResults[selectedIndex]);
        }
    };

    // Focus search input when modal opens
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchSelect = useCallback((result: SearchResult) => {
        setIsSearchOpen(false);
        setSearchQuery("");
        router.push(result.href);
    }, [router]);

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getNotificationIcon = (type: Notification["type"]) => {
        switch (type) {
            case "shift": return <Calendar className="w-4 h-4 text-accent-gold" />;
            case "message": return <MessageSquare className="w-4 h-4 text-info" />;
            case "payment": return <DollarSign className="w-4 h-4 text-success" />;
            default: return <Bell className="w-4 h-4 text-text-muted" />;
        }
    };

    const isMinimal = variant === "minimal";

    return (
        <>
            <header
                className={cn(
                    isMinimal
                        ? "absolute top-0 right-0 z-40 p-4 w-auto h-auto bg-transparent border-none pointer-events-none"
                        : "sticky top-0 z-40 h-16 flex items-center justify-between px-4 lg:px-8 bg-bg-primary/80 backdrop-blur-lg border-b border-border-subtle",
                    className
                )}
            >
                {/* Mobile menu button */}
                {/* Mobile menu button - Removed as we have bottom nav */}
                {!isMinimal && <div className="lg:hidden w-2" />}

                {/* Title (mobile) or Search (desktop) */}
                {!isMinimal && (
                    <div className="flex-1 flex items-center justify-center lg:justify-start">
                        {title && (
                            <h1 className="font-serif text-lg font-semibold text-text-primary lg:hidden">
                                {title}
                            </h1>
                        )}

                        {showSearch && (
                            <div className="hidden lg:flex items-center gap-3 max-w-md w-full">
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="relative flex-1 flex items-center cursor-pointer"
                                >
                                    <Search className="absolute left-3 w-4 h-4 text-text-muted" />
                                    <div className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-muted text-left hover:border-accent-gold/30 transition-all">
                                        Search shifts, talent, or messages...
                                    </div>
                                    <kbd className="absolute right-3 hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border-subtle bg-bg-elevated px-1.5 font-mono text-[10px] font-medium text-text-muted">
                                        ⌘K
                                    </kbd>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className={cn("flex items-center gap-2 pointer-events-auto", isMinimal && "ml-auto")}>
                    {/* Settings (Mobile/Tablet only) */}
                    <Link
                        href={pathname.startsWith("/talent") ? "/talent/settings" : "/business/settings"}
                        className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors cursor-pointer"
                    >
                        <Settings className="w-5 h-5" />
                    </Link>

                    {/* Notifications */}
                    <div className="relative" ref={notificationsRef}>
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors cursor-pointer"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-gold rounded-full" />
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {isNotificationsOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-bg-elevated border border-border-subtle rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                                <div className="p-3 border-b border-border-subtle flex items-center justify-between">
                                    <h3 className="font-semibold text-text-primary">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-accent-gold hover:underline cursor-pointer"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map((notification) => (
                                        <Link
                                            key={notification.id}
                                            href={notification.href || "#"}
                                            onClick={() => setIsNotificationsOpen(false)}
                                            className={cn(
                                                "flex items-start gap-3 p-3 hover:bg-bg-primary transition-colors cursor-pointer",
                                                !notification.read && "bg-accent-gold/5"
                                            )}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center shrink-0">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-text-primary truncate">
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read && (
                                                        <span className="w-1.5 h-1.5 bg-accent-gold rounded-full shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-text-muted truncate">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-text-muted mt-1">
                                                    {notification.time}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <Link
                                    href="/business/settings"
                                    onClick={() => setIsNotificationsOpen(false)}
                                    className="block p-3 text-center text-sm text-accent-gold hover:bg-bg-primary transition-colors border-t border-border-subtle cursor-pointer"
                                >
                                    Notification Settings
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile search */}
                    {!isMinimal && (
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors cursor-pointer"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </header>

            {/* Search Command Palette Modal */}
            {isSearchOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setIsSearchOpen(false)}
                >
                    <div
                        className="w-full max-w-lg bg-bg-elevated border border-border-subtle rounded-xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-3 p-3 sm:p-4 border-b border-border-subtle">
                            <Search className="w-5 h-5 text-text-muted shrink-0" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search shifts, talent, messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-base sm:text-lg"
                            />
                            <button
                                onClick={() => setIsSearchOpen(false)}
                                className="p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Results */}
                        <div className="max-h-80 overflow-y-auto">
                            {filteredResults.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-text-muted">No results found for &quot;{searchQuery}&quot;</p>
                                </div>
                            ) : (
                                <div className="py-2">
                                    {filteredResults.map((result, index) => (
                                        <button
                                            key={result.id}
                                            ref={(el) => { resultRefs.current[index] = el; }}
                                            onClick={() => handleSearchSelect(result)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-3 transition-colors text-left cursor-pointer",
                                                selectedIndex === index ? "bg-accent-gold/10 border-l-2 border-accent-gold" : "hover:bg-bg-primary"
                                            )}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-bg-primary flex items-center justify-center shrink-0">
                                                {result.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-text-primary truncate">
                                                    {result.title}
                                                </p>
                                                <p className="text-xs text-text-muted truncate">
                                                    {result.subtitle}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="hidden lg:flex p-3 border-t border-border-subtle items-center justify-between text-xs text-text-muted">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-bg-primary rounded border border-border-subtle">↑↓</kbd>
                                    Navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-bg-primary rounded border border-border-subtle">↵</kbd>
                                    Select
                                </span>
                            </div>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-bg-primary rounded border border-border-subtle">Esc</kbd>
                                Close
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
