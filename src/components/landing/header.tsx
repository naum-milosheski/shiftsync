"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface LandingHeaderProps {
    isLoggedIn: boolean;
}

export function LandingHeader({ isLoggedIn }: LandingHeaderProps) {
    const [scrolled, setScrolled] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSignOut = async () => {
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.refresh();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${mobileMenuOpen
                ? "bg-black border-white/10 py-3"
                : scrolled
                    ? "bg-bg-primary/95 backdrop-blur-md border-border-subtle py-3"
                    : "bg-transparent border-transparent py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between relative">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group z-50">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-gold to-accent-gold-muted flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                        <span className="text-bg-primary font-bold text-sm">S</span>
                    </div>
                    <span className="font-serif text-xl font-bold text-gold-gradient">
                        ShiftSync
                    </span>
                </Link>

                {/* Center Nav - Absolutely Centered (Desktop) */}
                <div className="hidden lg:flex items-center gap-8 text-sm font-medium absolute left-1/2 -translate-x-1/2">
                    <a href="#how-it-works" className="text-text-secondary hover:text-text-primary transition-colors">
                        How it Works
                    </a>
                    <a href="#planners" className="text-text-secondary hover:text-text-primary transition-colors">
                        For Planners
                    </a>
                    <a href="#talent" className="text-text-secondary hover:text-text-primary transition-colors">
                        For Talent
                    </a>
                </div>

                {/* Right Auth (Desktop) */}
                <div className="hidden lg:flex items-center gap-6 z-10">
                    {isLoggedIn ? (
                        <>
                            <button
                                onClick={handleSignOut}
                                className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                            >
                                Sign Out
                            </button>
                            <Link
                                href="/business/dashboard"
                                className="btn-gold px-5 py-2 text-sm font-semibold shadow-lg shadow-accent-gold/20"
                            >
                                Dashboard
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="btn-gold px-6 py-2.5 text-sm font-semibold shadow-lg shadow-accent-gold/20 hover:scale-105 transition-transform"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className={`lg:hidden z-50 p-2 transition-colors duration-300 ${mobileMenuOpen ? "text-white" : "text-text-primary"}`}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <div className="w-6 h-5 relative flex flex-col justify-between">
                        <span className={`w-full h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
                        <span className={`w-full h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
                        <span className={`w-full h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2.5" : ""}`} />
                    </div>
                </button>

                {/* Mobile Menu Overlay */}
                <div className={`fixed inset-0 bg-black z-40 transition-transform duration-300 lg:hidden pt-24 px-6 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
                    <div className="flex flex-col gap-4 text-base font-medium">
                        <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors py-2 border-b border-white/10">
                            How it Works
                        </a>
                        <a href="#planners" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors py-2 border-b border-white/10">
                            For Planners
                        </a>
                        <a href="#talent" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors py-2 border-b border-white/10">
                            For Talent
                        </a>
                        <div className="pt-4 flex flex-col gap-4">
                            {isLoggedIn ? (
                                <>
                                    <Link
                                        href="/business/dashboard"
                                        className="btn-gold w-full py-2.5 text-center text-sm font-semibold shadow-lg"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleSignOut();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="text-gray-400 hover:text-white transition-colors py-2"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-center text-white hover:text-accent-gold transition-colors py-2"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="btn-gold w-full py-2.5 text-center text-sm font-semibold shadow-lg"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
