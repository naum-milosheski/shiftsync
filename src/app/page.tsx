import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import {
    Sparkles,
    Users,
    Calendar,
    Clock,
    DollarSign,
    Shield,
    Zap,
    MapPin,
    ArrowRight,
    Check,
    Star,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/header";
import { LandingTestimonials } from "@/components/landing/testimonials";
import { LandingFooter } from "@/components/landing/footer";

export default async function LandingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isLoggedIn = !!user;

    return (
        <div className="min-h-screen bg-bg-primary">
            {/* 1. Upgrade Navigation Bar */}
            <LandingHeader isLoggedIn={isLoggedIn} />

            {/* Section 1: Hero */}
            <section className="relative pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-48 lg:pb-32 px-6 lg:px-8 overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-accent-gold/5 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="relative max-w-5xl mx-auto text-center z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-gold/30 bg-accent-gold/10 mb-8 animate-fade-in-up">
                        <Sparkles className="w-4 h-4 text-accent-gold" />
                        <span className="text-sm font-medium text-accent-gold">
                            AI-Powered Event Staffing
                        </span>
                    </div>

                    {/* Headline */}
                    {/* Headline */}
                    <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-tight mb-6 sm:mb-8 tracking-tight max-w-4xl mx-auto">
                        Where <span className="text-gold-gradient">Exceptional Events</span>
                        <br />
                        Meet Elite Talent
                    </h1>

                    {/* Subheadline */}
                    {/* Subheadline */}
                    <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
                        The premium marketplace connecting luxury event planners with world-class
                        hospitality professionals. Staff your events in minutes, not days.
                    </p>

                    {/* CTA Buttons - Session Aware */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 px-4">
                        {isLoggedIn ? (
                            <Link
                                href="/business/dashboard"
                                className="btn-gold px-8 py-3.5 text-base font-semibold flex items-center justify-center gap-2 w-full sm:w-auto min-w-[180px] shadow-xl shadow-accent-gold/10 hover:shadow-accent-gold/20 transition-all hover:-translate-y-1"
                            >
                                Go to Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/signup?role=business"
                                    className="btn-gold px-8 py-3.5 text-base font-semibold flex items-center justify-center gap-2 w-full sm:w-auto min-w-[180px] shadow-xl shadow-accent-gold/10 hover:shadow-accent-gold/20 transition-all hover:-translate-y-1"
                                >
                                    I'm Hiring Staff
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/signup?role=talent"
                                    className="px-8 py-3.5 text-base font-medium text-text-primary border border-text-muted/30 rounded-xl hover:bg-bg-secondary hover:border-text-primary transition-all w-full sm:w-auto min-w-[180px] text-center"
                                >
                                    I'm Looking for Work
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-8 lg:gap-12 text-text-secondary/80">
                        <div className="flex items-center gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-500" />
                            </div>
                            <span className="text-sm font-medium">2,500+ Vetted Professionals</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-500" />
                            </div>
                            <span className="text-sm font-medium">10,000+ Events Staffed</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-500" />
                            </div>
                            <span className="text-sm font-medium">4.9 Average Rating</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Trusted By */}
            <section className="py-8 sm:py-12 border-y border-border-subtle/50 bg-bg-secondary/30 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <p className="text-center text-xs font-semibold text-text-muted uppercase tracking-[0.2em] mb-8">
                        Preferred Staffing Partner For
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-6 sm:gap-y-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="font-serif text-xl sm:text-2xl lg:text-3xl text-text-primary hover:text-accent-gold transition-colors cursor-default">The Ritz-Carlton</span>
                        <span className="font-serif text-xl sm:text-2xl lg:text-3xl text-text-primary hover:text-accent-gold transition-colors cursor-default">Four Seasons</span>
                        <span className="font-serif text-xl sm:text-2xl lg:text-3xl text-text-primary hover:text-accent-gold transition-colors cursor-default">Soho House</span>
                        <span className="font-serif text-xl sm:text-2xl lg:text-3xl text-text-primary hover:text-accent-gold transition-colors cursor-default">VOGUE</span>
                        <span className="font-serif text-xl sm:text-2xl lg:text-3xl text-text-primary hover:text-accent-gold transition-colors cursor-default">NOBU</span>
                    </div>
                </div>
            </section>

            {/* Section 3: For Planners */}
            <section id="planners" className="py-12 sm:py-24 lg:py-32 px-4 lg:px-8 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        {/* High-End Visual */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-accent-gold to-accent-gold-muted rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-border-subtle shadow-2xl">
                                <Image
                                    src="/images/landing/wedding.png"
                                    alt="Luxury wedding reception"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent opacity-60" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-primary/90 backdrop-blur border border-border-subtle mb-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-medium text-text-primary">Live Matching Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <span className="text-accent-gold font-semibold tracking-wider text-sm uppercase mb-2 block">For Event Planners</span>
                            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-semibold text-text-primary mb-4 sm:mb-6 leading-tight">
                                Staffing, Solved in <span className="text-gold-gradient">Seconds</span>.
                            </h2>
                            <p className="text-text-secondary text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed">
                                Forget the agency markups and endless phone calls. Access a pre-vetted pool of premium talent ready to elevate your event immediately.
                            </p>

                            <div className="space-y-8">
                                <div className="flex gap-5 group">
                                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-accent-gold/10 flex items-center justify-center shrink-0 group-hover:bg-accent-gold/20 transition-colors">
                                        <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-accent-gold" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-xl text-text-primary mb-2 group-hover:text-accent-gold transition-colors">
                                            AI-Powered Matching
                                        </h3>
                                        <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                                            Our algorithm analyzes your event style and matches you with tuxedo-ready staff who fit your specific vibe.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-5 group">
                                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-accent-gold/10 flex items-center justify-center shrink-0 group-hover:bg-accent-gold/20 transition-colors">
                                        <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-accent-gold" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-xl text-text-primary mb-2 group-hover:text-accent-gold transition-colors">
                                            Zero No-Shows Guaranteed
                                        </h3>
                                        <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                                            We track reputation relentlessly. Only reliable professionals with verified history can book your shifts.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-5 group">
                                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-accent-gold/10 flex items-center justify-center shrink-0 group-hover:bg-accent-gold/20 transition-colors">
                                        <DollarSign className="w-5 h-5 sm:w-7 sm:h-7 text-accent-gold" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-xl text-text-primary mb-2 group-hover:text-accent-gold transition-colors">
                                            Automated Payroll
                                        </h3>
                                        <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                                            One click to pay your entire crew. We handle tax forms and payments so you can focus on the party.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: For Talent */}
            <section id="talent" className="py-12 sm:py-24 lg:py-32 px-4 lg:px-8 bg-bg-secondary/20 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        {/* Content (Left on Desktop) */}
                        <div className="order-2 lg:order-1">
                            <span className="text-green-500 font-semibold tracking-wider text-sm uppercase mb-2 block">For Professionals</span>
                            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-semibold text-text-primary mb-4 sm:mb-6 leading-tight">
                                Earn Your <span className="text-green-500">Worth</span>.
                            </h2>
                            <p className="text-text-secondary text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed">
                                You are a professional. You deserve professional pay, instant access to funds, and the freedom to choose your own schedule.
                            </p>

                            <div className="space-y-8">
                                <div className="flex gap-5 group">
                                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                                        <Star className="w-5 h-5 sm:w-7 sm:h-7 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-xl text-text-primary mb-2 group-hover:text-green-400 transition-colors">
                                            Premium Rates
                                        </h3>
                                        <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                                            Access exclusive shifts at top-tier venues paying significantly above market average.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-5 group">
                                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                                        <Zap className="w-5 h-5 sm:w-7 sm:h-7 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-xl text-text-primary mb-2 group-hover:text-green-400 transition-colors">
                                            Instant Payouts
                                        </h3>
                                        <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                                            Clock out and cash out. Funds land in your account immediately after shift verification.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-5 group">
                                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                                        <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-xl text-text-primary mb-2 group-hover:text-green-400 transition-colors">
                                            Total Control
                                        </h3>
                                        <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                                            Block out black dates instantly. Accept only the gigs you want. Builds your career on your terms.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* High-End Visual (Right on Desktop) */}
                        <div className="order-1 lg:order-2 relative group">
                            <div className="absolute -inset-1 bg-gradient-to-l from-green-500 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-border-subtle shadow-2xl">
                                <Image
                                    src="/images/landing/bartender.png"
                                    alt="Professional bartender"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent opacity-60" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="inline-flex items-center gap-2 sm:gap-3 bg-bg-primary/90 backdrop-blur border border-border-subtle p-2 sm:p-3 rounded-lg sm:rounded-xl">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-sm sm:text-lg">💰</div>
                                        <div>
                                            <p className="text-[10px] sm:text-xs text-text-muted">Just Earned</p>
                                            <p className="text-xs sm:text-sm font-bold text-green-500">+$450.00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 5: How It Works */}
            <section id="how-it-works" className="py-12 sm:py-24 lg:py-32 px-4 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <span className="tag tag-gold mb-4 inline-block">Simple Workflow</span>
                    <h2 className="font-serif text-4xl lg:text-5xl font-semibold text-text-primary mb-6">
                        Three Steps to Perfect Staffing
                    </h2>
                    <p className="text-text-secondary max-w-2xl mx-auto mb-20 text-lg">
                        We've stripped away the complexity. Connect, book, and perform.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-accent-gold/30 to-transparent border-t border-dashed border-accent-gold/30" />

                        {/* Step 1 */}
                        <div className="relative group p-6 rounded-2xl hover:bg-bg-secondary/30 transition-all duration-300">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-bg-primary border-4 border-bg-secondary group-hover:border-accent-gold/30 flex items-center justify-center mx-auto mb-6 sm:mb-8 relative z-10 shadow-xl transition-all">
                                <span className="font-serif text-2xl sm:text-4xl font-bold text-text-muted group-hover:text-accent-gold transition-colors">1</span>
                            </div>
                            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-text-primary mb-4">
                                Post
                            </h3>
                            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                                Describe your event in plain English. Our AI parses your needs and instantly creates the perfectly targeted job posting.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative group p-6 rounded-2xl hover:bg-bg-secondary/30 transition-all duration-300">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-bg-primary border-4 border-bg-secondary group-hover:border-accent-gold/30 flex items-center justify-center mx-auto mb-6 sm:mb-8 relative z-10 shadow-xl transition-all">
                                <span className="font-serif text-2xl sm:text-4xl font-bold text-text-muted group-hover:text-accent-gold transition-colors">2</span>
                            </div>
                            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-text-primary mb-4">
                                Match
                            </h3>
                            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                                Review top-rated applicants instantly. See verified ratings, past experience, and photos before you confirm the booking.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative group p-6 rounded-2xl hover:bg-bg-secondary/30 transition-all duration-300">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-bg-primary border-4 border-bg-secondary group-hover:border-accent-gold/30 flex items-center justify-center mx-auto mb-6 sm:mb-8 relative z-10 shadow-xl transition-all">
                                <span className="font-serif text-2xl sm:text-4xl font-bold text-text-muted group-hover:text-green-500 transition-colors">3</span>
                            </div>
                            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-text-primary mb-4">
                                Party
                            </h3>
                            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                                Staff arrives, clocks in via GPS geolocation, and you relax. We handle the payments and the rest.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Add Testimonials Section */}
            <LandingTestimonials />

            {/* Section 6: Final CTA */}
            <section className="py-12 sm:py-16 lg:py-24 px-4 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-12 text-center border border-accent-gold/30 shadow-2xl">
                        {/* Background Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-br from-bg-secondary to-bg-primary z-0" />
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-gold/5 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-gold/5 rounded-full blur-[100px]" />

                        <div className="relative z-10">
                            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-text-primary mb-4">
                                Ready to elevate your next event?
                            </h2>
                            <p className="text-text-secondary max-w-xl mx-auto mb-8 text-base lg:text-lg">
                                Join thousands of event planners and hospitality professionals
                                already using ShiftSync to redefine the industry.
                            </p>
                            <Link
                                href="/signup"
                                className="inline-flex items-center gap-2 btn-gold px-6 py-2.5 sm:px-8 sm:py-3 text-base sm:text-lg font-semibold shadow-xl shadow-accent-gold/10 hover:scale-105 transition-transform"
                            >
                                Get Started Now
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Fat Footer */}
            <LandingFooter />
        </div>
    );
}
