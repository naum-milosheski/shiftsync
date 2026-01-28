import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Calendar,
    Clock,
    Users,
    DollarSign,
    TrendingUp,
    ArrowRight,
    Sparkles,
    Building2
} from "lucide-react";
import { formatTime, formatDate } from "@/lib/utils";

async function getDashboardData() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll() { },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get business profile
    const { data: profile } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!profile) return null;

    // Get shifts
    const { data: shifts } = await supabase
        .from("shifts")
        .select("*")
        .eq("business_id", profile.id)
        .order("event_date", { ascending: true });

    // Calculate stats
    const now = new Date();
    const allShifts = shifts || [];
    const openShifts = allShifts.filter(s => s.status === "open");
    const upcomingShifts = allShifts.filter(s =>
        new Date(s.event_date) >= now && s.status !== "cancelled"
    ).slice(0, 3);
    const completedShifts = allShifts.filter(s => s.status === "completed");

    // Calculate total spend (completed shifts)
    const totalSpend = completedShifts.reduce((acc, s) => {
        const hours = 6; // Approximate - would need time entries for exact
        return acc + (s.hourly_rate * s.workers_confirmed * hours);
    }, 0);

    return {
        profile,
        stats: {
            totalShifts: allShifts.length,
            openShifts: openShifts.length,
            completedShifts: completedShifts.length,
            totalSpend,
        },
        upcomingShifts,
    };
}

export default async function BusinessDashboard() {
    const data = await getDashboardData();

    // Fallback for demo if not authenticated
    if (!data) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-text-primary">
                            Welcome to ShiftSync
                        </h1>
                        <p className="text-text-secondary mt-1">
                            Sign in to access your business dashboard
                        </p>
                    </div>
                </div>
                <Card>
                    <CardContent className="py-12 text-center">
                        <Building2 className="w-12 h-12 mx-auto text-accent-gold mb-4" />
                        <h2 className="font-serif text-xl font-semibold text-text-primary mb-2">
                            Complete Your Setup
                        </h2>
                        <p className="text-text-secondary mb-6">
                            Create your business profile to start posting shifts
                        </p>
                        <Link href="/login">
                            <Button>Sign In</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { profile, stats, upcomingShifts } = data;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-serif text-xl sm:text-3xl font-bold text-text-primary">
                        Welcome back, {profile.company_name}
                    </h1>
                    <p className="text-sm sm:text-base text-text-secondary mt-1">
                        Here&apos;s what&apos;s happening with your events
                    </p>
                </div>
                <Link href="/business/shifts/new">
                    <Button className="cursor-pointer w-full sm:w-auto text-sm">
                        <Plus className="w-4 h-4" />
                        Post New Shift
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card>
                    <CardContent className="p-4 sm:pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-text-muted">Total Shifts</p>
                                <p className="text-xl sm:text-3xl font-bold text-text-primary mt-1">
                                    {stats.totalShifts}
                                </p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-accent-gold/10 flex items-center justify-center">
                                <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-accent-gold" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-text-muted">Open Now</p>
                                <p className="text-xl sm:text-3xl font-bold text-warning mt-1">
                                    {stats.openShifts}
                                </p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-warning/10 flex items-center justify-center">
                                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-warning" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-text-muted">Completed</p>
                                <p className="text-xl sm:text-3xl font-bold text-success mt-1">
                                    {stats.completedShifts}
                                </p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-success/10 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-success" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-text-muted">Total Spent</p>
                                <p className="text-xl sm:text-3xl font-bold text-text-primary mt-1">
                                    ${stats.totalSpend.toLocaleString()}
                                </p>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-accent-gold/10 flex items-center justify-center">
                                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-accent-gold" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Upcoming Shifts */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Upcoming Shifts</CardTitle>
                            <Link href="/business/shifts">
                                <Button variant="ghost" size="sm" className="cursor-pointer">
                                    View All
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {upcomingShifts.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="w-10 h-10 mx-auto text-text-muted mb-3" />
                                    <p className="text-text-secondary mb-4">
                                        No upcoming shifts scheduled
                                    </p>
                                    <Link href="/business/shifts/new">
                                        <Button size="sm">
                                            <Plus className="w-4 h-4" />
                                            Post Your First Shift
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingShifts.map((shift: any) => (
                                        <Link
                                            key={shift.id}
                                            href={`/business/shifts/${shift.id}`}
                                            className="block"
                                        >
                                            <div className="p-4 rounded-lg bg-bg-elevated hover:bg-bg-elevated/80 transition-colors">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-text-primary">
                                                                {shift.title}
                                                            </h3>
                                                            <Badge variant={shift.status === "open" ? "warning" : "success"}>
                                                                {shift.workers_confirmed}/{shift.workers_needed}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3 text-sm text-text-muted">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {formatDate(shift.event_date)}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {formatTime(shift.start_time)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-semibold text-accent-gold">
                                                            ${shift.hourly_rate}
                                                        </p>
                                                        <p className="text-xs text-text-muted">/hour</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-6">
                    {/* Smart Post CTA */}
                    <Card className="border-accent-gold/30 bg-gradient-to-br from-accent-gold/5 to-transparent">
                        <CardContent className="p-4 sm:pt-6">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent-gold/20 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent-gold" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-serif text-sm sm:text-base font-semibold text-text-primary mb-1">
                                        Smart Post
                                    </h3>
                                    <p className="text-xs sm:text-sm text-text-secondary mb-3">
                                        Describe your event and let AI create the perfect job listing
                                    </p>
                                    <Link href="/business/shifts/new?smart=true">
                                        <Button size="sm" className="w-full h-8 text-xs sm:h-9 sm:text-sm cursor-pointer">
                                            Try Smart Post
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Building */}
                    <Card>
                        <CardContent className="p-4 sm:pt-6">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-bg-elevated flex items-center justify-center shrink-0">
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-accent-gold" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-serif text-sm sm:text-base font-semibold text-text-primary mb-1">
                                        Build Your Team
                                    </h3>
                                    <p className="text-xs sm:text-sm text-text-secondary mb-3">
                                        Save top performers as favorites for future events
                                    </p>
                                    <Link href="/business/team">
                                        <Button variant="outline" size="sm" className="w-full h-8 text-xs sm:h-9 sm:text-sm cursor-pointer">
                                            View Talent
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
