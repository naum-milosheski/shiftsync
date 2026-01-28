"use client";

import Link from "next/link";
import { ArrowRight, Twitter, Instagram, Linkedin } from "lucide-react";

export function LandingFooter() {
    return (
        <footer className="bg-bg-secondary border-t border-border-subtle pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-gold to-accent-gold-muted flex items-center justify-center">
                                <span className="text-bg-primary font-bold text-sm">S</span>
                            </div>
                            <span className="font-serif text-xl font-bold text-text-primary">
                                ShiftSync
                            </span>
                        </Link>
                        <p className="text-text-secondary max-w-xs leading-relaxed">
                            The premium marketplace connecting luxury event planners with world-class hospitality professionals.
                        </p>
                        <div className="flex items-center gap-4 text-text-muted">
                            <a href="#" className="hover:text-accent-gold transition-colors">
                                {/* X Logo */}
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"></path>
                                </svg>
                            </a>
                            <a href="#" className="hover:text-accent-gold transition-colors"><Instagram className="w-5 h-5" /></a>
                            <a href="#" className="hover:text-accent-gold transition-colors"><Linkedin className="w-5 h-5" /></a>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-bold text-text-primary mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-text-secondary">
                            <li><a href="#" className="hover:text-accent-gold">For Planners</a></li>
                            <li><a href="#" className="hover:text-accent-gold">For Talent</a></li>
                            <li><a href="#" className="hover:text-accent-gold">Pricing</a></li>
                            <li><a href="#" className="hover:text-accent-gold">Enterprise</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-text-primary mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-text-secondary">
                            <li><a href="#" className="hover:text-accent-gold">About Us</a></li>
                            <li><a href="#" className="hover:text-accent-gold">Careers</a></li>
                            <li><a href="#" className="hover:text-accent-gold">Blog</a></li>
                            <li><a href="#" className="hover:text-accent-gold">Contact</a></li>
                        </ul>
                    </div>

                    {/* Newsletter - Wider Column */}
                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-text-primary mb-6">Stay Updated</h4>
                        <div className="space-y-4">
                            <p className="text-sm text-text-secondary">
                                Get the latest trends in event staffing.
                            </p>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Enter your email address..."
                                    className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl pl-4 sm:pl-6 pr-14 h-12 sm:h-14 text-base text-text-primary placeholder:text-white/30 focus:border-accent-gold/50 focus:bg-white/10 outline-none transition-all shadow-lg"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-lg bg-accent-gold text-bg-primary hover:bg-accent-gold-hover transition-colors shadow-md hover:shadow-lg hover:scale-105 transform duration-200">
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-border-subtle pt-8 flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 text-sm text-text-muted text-center lg:text-left">
                    <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-1">
                        <p>© {new Date().getFullYear()} ShiftSync Inc. All rights reserved.</p>
                        <span className="hidden lg:inline mx-2 text-border-subtle">|</span>
                        <p className="text-accent-gold font-medium">Designed & Developed by Naum Milosheski</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-text-primary">Privacy Policy</a>
                        <a href="#" className="hover:text-text-primary">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
