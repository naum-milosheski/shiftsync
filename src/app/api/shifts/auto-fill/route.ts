import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * AI Auto-Fill API
 * Matches and invites best-fit talent for a shift
 */
export async function POST(request: Request) {
    try {
        const { shiftId, count } = await request.json();

        if (!shiftId || !count) {
            return NextResponse.json(
                { error: "Missing shiftId or count" },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // Handle server context
                        }
                    },
                },
            }
        );

        // Get the shift details
        const { data: shift, error: shiftError } = await supabase
            .from("shifts")
            .select("*")
            .eq("id", shiftId)
            .single();

        if (shiftError || !shift) {
            return NextResponse.json(
                { error: "Shift not found" },
                { status: 404 }
            );
        }

        // Get already assigned talent
        const { data: assigned } = await supabase
            .from("shift_assignments")
            .select("talent_id")
            .eq("shift_id", shiftId);

        const assignedIds = assigned?.map(a => a.talent_id) || [];

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

        const skillTerm = roleMap[shift.role_type] || shift.role_type;

        // Get available talent matching the role
        // Scoring algorithm:
        // - Rating: Higher is better (0-5)
        // - Total shifts: More experience is better
        // - Available: Must be available
        // - Rate: Within range of shift hourly rate

        let query = supabase
            .from("talent_profiles")
            .select("*")
            .eq("available_now", true)
            .lte("hourly_rate_min", shift.hourly_rate) // Rate within budget
            .order("rating_avg", { ascending: false })
            .order("total_shifts", { ascending: false })
            .limit(count * 2); // Get more than needed to filter

        if (assignedIds.length > 0) {
            query = query.not("id", "in", `(${assignedIds.join(",")})`);
        }

        const { data: allTalent } = await query;

        // Filter by skills
        const matchedTalent = allTalent?.filter(t =>
            t.skills?.some((s: string) =>
                s.toLowerCase().includes(skillTerm.toLowerCase()) ||
                skillTerm.toLowerCase().includes(s.toLowerCase())
            )
        ) || [];

        // Score and rank talent
        const scoredTalent = matchedTalent.map(t => ({
            ...t,
            score:
                (t.rating_avg || 0) * 20 + // Rating weight: 20 points per star
                Math.min(t.total_shifts || 0, 50) * 0.5 + // Experience: up to 25 points
                (t.skills?.length || 0) * 2 // Skills diversity: 2 points per skill
        })).sort((a, b) => b.score - a.score);

        // Take top N talent
        const selectedTalent = scoredTalent.slice(0, count);

        if (selectedTalent.length === 0) {
            return NextResponse.json({
                success: true,
                invited: 0,
                message: "No matching talent available",
            });
        }

        // Create invitations for selected talent
        const invitations = selectedTalent.map(t => ({
            shift_id: shiftId,
            talent_id: t.id,
            status: "invited",
        }));

        const { error: inviteError } = await supabase
            .from("shift_assignments")
            .insert(invitations);

        if (inviteError) {
            return NextResponse.json(
                { error: "Failed to create invitations" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            invited: selectedTalent.length,
            talent: selectedTalent.map(t => ({
                id: t.id,
                name: t.full_name,
                rating: t.rating_avg,
                score: t.score,
            })),
        });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
