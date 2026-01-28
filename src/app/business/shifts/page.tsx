import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ShiftsList from "./shifts-list";

async function getShifts() {
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
    if (!user) return [];

    const { data: profile } = await supabase
        .from("business_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!profile) return [];

    const { data: shifts } = await supabase
        .from("shifts")
        .select("*")
        .eq("business_id", profile.id)
        .order("event_date", { ascending: true });

    return shifts || [];
}

export default async function ShiftsPage() {
    const shifts = await getShifts();

    return (
        <div className="space-y-6">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-serif text-xl sm:text-3xl font-bold text-text-primary">
                        Your Shifts
                    </h1>
                    <p className="text-sm sm:text-base text-text-secondary mt-1">
                        Manage and track all your staffing needs
                    </p>
                </div>
                <Link href="/business/shifts/new">
                    <Button className="cursor-pointer w-full sm:w-auto text-sm">
                        <Plus className="w-4 h-4" />
                        Post New Shift
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <Card>
                    <CardContent className="p-4 sm:p-5">
                        <p className="text-xl sm:text-2xl font-bold text-text-primary">{shifts.length}</p>
                        <p className="text-xs sm:text-sm text-text-muted">Total Shifts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 sm:p-5">
                        <p className="text-xl sm:text-2xl font-bold text-accent-gold">
                            {shifts.filter(s => s.status === "open" || s.status === "draft").length}
                        </p>
                        <p className="text-xs sm:text-sm text-text-muted">Open</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 sm:p-5">
                        <p className="text-xl sm:text-2xl font-bold text-success">
                            {shifts.filter(s => s.status === "filled" || s.status === "in_progress").length}
                        </p>
                        <p className="text-xs sm:text-sm text-text-muted">Filled</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 sm:p-5">
                        <p className="text-xl sm:text-2xl font-bold text-text-primary">
                            {shifts.filter(s => s.status === "completed").length}
                        </p>
                        <p className="text-xs sm:text-sm text-text-muted">Completed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Shifts List with Filter - Client Component */}
            <ShiftsList shifts={shifts} />
        </div>
    );
}

