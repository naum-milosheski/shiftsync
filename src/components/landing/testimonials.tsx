"use client";

import { Quote } from "lucide-react";

const testimonials = [
    {
        name: "Sarah Jenkins",
        role: "Wedding Planner, LuxeEvents",
        quote: "ShiftSync saved my event. The staff arrived 15 mins early in perfect uniform. It's the reliability I've been looking for.",
    },
    {
        name: "Events Team",
        role: "The Ritz Carlton",
        quote: "The only platform we trust for VIP galas. Zero friction, zero no-shows. The quality of talent is simply unmatched.",
    },
    {
        name: "David Martinez",
        role: "Pro Bartender",
        quote: "I doubled my income picking up high-end shifts here. Instant payouts are game-changing for my cash flow.",
    },
];

export function LandingTestimonials() {
    return (
        <section className="py-20 lg:py-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-gold/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-gold/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
                <div className="text-center mb-12">
                    <span className="tag tag-gold mb-4 inline-block">Social Proof</span>
                    <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-text-primary">
                        Trusted by the Best
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="card-luxury p-6 lg:p-8 backdrop-blur-sm bg-bg-secondary/50 hover:bg-bg-secondary/80 transition-all border-accent-gold/10 hover:border-accent-gold/30"
                        >
                            <Quote className="w-8 h-8 text-accent-gold/40 mb-4" />
                            <p className="text-text-secondary leading-relaxed mb-6">
                                "{t.quote}"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-gold to-bg-elevated flex items-center justify-center font-serif font-bold text-bg-primary">
                                    {t.name[0]}
                                </div>
                                <div>
                                    <p className="font-semibold text-text-primary text-sm">{t.name}</p>
                                    <p className="text-xs text-text-muted">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
