import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Users,
    DollarSign,
    Shirt,
    Star,
    Sparkles,
    Send,
    CheckCircle2,
    XCircle,
    Clock3,
    Edit
} from "lucide-react";
import { TalentInviteButton } from "./talent-invite-button";
import { formatTimeRange } from "@/lib/utils";

interface ShiftDetailPageProps {
    params: Promise<{ id: string }>;
}

async function getShiftDetails(shiftId: string) {
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

    // Get shift with assignments
    const { data: shift } = await supabase
        .from("shifts")
        .select(`
      *,
      shift_assignments (
        id,
        status,
        invited_at,
        responded_at,
        talent_profiles (
          id,
          full_name,
          photo_urls,
          rating_avg,
          total_shifts,
          skills
        )
      )
    `)
        .eq("id", shiftId)
        .single();

    return shift;
}

async function getAvailableTalent(roleType: string, shiftId: string) {
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

    // Get talent not already assigned to this shift
    const { data: assignedTalent } = await supabase
        .from("shift_assignments")
        .select("talent_id")
        .eq("shift_id", shiftId);

    const assignedIds = assignedTalent?.map(a => a.talent_id) || [];

    // Map role types to skill terms
    const roleMap: Record<string, string> = {
        bartender: "Bartender",
        server: "Server",
        host: "Host",
        sommelier: "Sommelier",
        valet: "Valet",
        security: "Security",
        coat_check: "Coat Check",
    };

    const skillTerm = roleMap[roleType] || roleType;

    // Get available talent with matching skills
    let query = supabase
        .from("talent_profiles")
        .select("*")
        .eq("available_now", true)
        .order("rating_avg", { ascending: false })
        .limit(10);

    if (assignedIds.length > 0) {
        query = query.not("id", "in", `(${assignedIds.join(",")})`);
    }

    const { data: talent } = await query;

    // Filter by skills (since Supabase array contains is tricky)
    const matchedTalent = talent?.filter(t =>
        t.skills?.some((s: string) =>
            s.toLowerCase().includes(skillTerm.toLowerCase()) ||
            skillTerm.toLowerCase().includes(s.toLowerCase())
        )
    ) || [];

    return matchedTalent;
}

const statusColors: Record<string, string> = {
    invited: "warning",
    pending: "warning",
    accepted: "success",
    declined: "danger",
    completed: "success",
    no_show: "danger",
};

const statusLabels: Record<string, string> = {
    invited: "Invited",
    pending: "Pending",
    accepted: "Accepted",
    declined: "Declined",
    completed: "Completed",
    no_show: "No Show",
};

const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
        case "accepted":
        case "completed":
            return <CheckCircle2 className="w-4 h-4 text-success" />;
        case "declined":
        case "no_show":
            return <XCircle className="w-4 h-4 text-danger" />;
        default:
            return <Clock3 className="w-4 h-4 text-warning" />;
    }
};

export default async function ShiftDetailPage({ params }: ShiftDetailPageProps) {
    const { id } = await params;
    const shift = await getShiftDetails(id);

    if (!shift) {
        notFound();
    }

    const availableTalent = await getAvailableTalent(shift.role_type, id);
    const acceptedCount = shift.shift_assignments?.filter((a: any) => a.status === "accepted").length || 0;
    const needsMore = shift.workers_needed > acceptedCount;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <Link
                        href="/business/shifts"
                        className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Shifts
                    </Link>
                    <h1 className="font-serif text-3xl font-bold text-text-primary">
                        {shift.title}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <Badge variant={shift.status === "open" ? "warning" : "success"}>
                            {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                        </Badge>
                        <span className="text-text-muted">
                            {acceptedCount}/{shift.workers_needed} confirmed
                        </span>
                    </div>
                </div>
                <Button variant="outline">
                    <Edit className="w-4 h-4" />
                    Edit Shift
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Shift Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Shift Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-accent-gold" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-muted">Date</p>
                                        <p className="font-medium text-text-primary">
                                            {new Date(shift.event_date).toLocaleDateString("en-US", {
                                                weekday: "long",
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-accent-gold" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-muted">Time</p>
                                        <p className="font-medium text-text-primary">
                                            {formatTimeRange(shift.start_time, shift.end_time)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-accent-gold" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-muted">Venue</p>
                                        <p className="font-medium text-text-primary">{shift.venue_name}</p>
                                        {shift.venue_address && (
                                            <p className="text-sm text-text-secondary">{shift.venue_address}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-accent-gold" />
                                        <div>
                                            <p className="text-sm text-text-muted">Role</p>
                                            <p className="font-medium text-text-primary capitalize">{shift.role_type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="w-5 h-5 text-accent-gold" />
                                        <div>
                                            <p className="text-sm text-text-muted">Rate</p>
                                            <p className="font-medium text-text-primary">${shift.hourly_rate}/hr</p>
                                        </div>
                                    </div>
                                </div>

                                {shift.attire_code && (
                                    <div className="flex items-center gap-3 pt-4 border-t border-border-subtle">
                                        <Shirt className="w-5 h-5 text-accent-gold" />
                                        <div>
                                            <p className="text-sm text-text-muted">Attire</p>
                                            <p className="font-medium text-text-primary">{shift.attire_code}</p>
                                        </div>
                                    </div>
                                )}

                                {shift.description && (
                                    <div className="pt-4 border-t border-border-subtle">
                                        <p className="text-sm text-text-muted mb-2">Description</p>
                                        <p className="text-text-secondary">{shift.description}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assigned Staff */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Staff ({acceptedCount}/{shift.workers_needed})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {shift.shift_assignments?.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="w-12 h-12 mx-auto text-text-muted mb-4" />
                                    <p className="text-text-secondary">
                                        No staff assigned yet. Use AI Auto-Fill or invite talent below.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {shift.shift_assignments?.map((assignment: any) => (
                                        <div
                                            key={assignment.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    src={assignment.talent_profiles?.photo_urls?.[0]}
                                                    name={assignment.talent_profiles?.full_name}
                                                    size="md"
                                                />
                                                <div>
                                                    <p className="font-medium text-text-primary">
                                                        {assignment.talent_profiles?.full_name}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm text-text-muted">
                                                        <Star className="w-3 h-3 text-accent-gold fill-accent-gold" />
                                                        <span>{assignment.talent_profiles?.rating_avg}</span>
                                                        <span>•</span>
                                                        <span>{assignment.talent_profiles?.total_shifts} shifts</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <StatusIcon status={assignment.status} />
                                                <Badge variant={statusColors[assignment.status] as any}>
                                                    {statusLabels[assignment.status]}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Auto-Fill CTA */}
                    {needsMore && (
                        <Card className="border-accent-gold/30 bg-accent-gold/5">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-accent-gold/20 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-accent-gold" />
                                    </div>
                                    <h3 className="font-serif text-lg font-semibold text-text-primary mb-2">
                                        AI Auto-Fill
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-4">
                                        Let our AI find and invite the best-matched talent for this shift.
                                    </p>
                                    <Button className="w-full">
                                        <Sparkles className="w-4 h-4" />
                                        Auto-Fill ({shift.workers_needed - acceptedCount} spots)
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Available Talent */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Recommended Talent</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {availableTalent.length === 0 ? (
                                <p className="text-sm text-text-muted text-center py-4">
                                    No available talent matching this role.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {availableTalent.slice(0, 5).map((talent: any) => (
                                        <div
                                            key={talent.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    src={talent.photo_urls?.[0]}
                                                    name={talent.full_name}
                                                    size="sm"
                                                />
                                                <div>
                                                    <p className="font-medium text-text-primary text-sm">
                                                        {talent.full_name}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-xs text-text-muted">
                                                        <Star className="w-3 h-3 text-accent-gold fill-accent-gold" />
                                                        <span>{talent.rating_avg}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <TalentInviteButton
                                                shiftId={id}
                                                talentId={talent.id}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
