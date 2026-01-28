import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import TeamClient from "./team-client";

interface TalentProfile {
    id: string;
    user_id: string;
    full_name: string;
    bio: string | null;
    skills: string[];
    photo_urls: string[] | null;
    rating_avg: number;
    total_shifts: number;
    hourly_rate_min: number;
    available_now: boolean;
}

async function getTeamData() {
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
    if (!user) return { workedWith: [], topTalent: [] };

    // Get business profile
    const { data: profile } = await supabase
        .from("business_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!profile) return { workedWith: [], topTalent: [] };

    // Get talent who have worked with this business (from shift_assignments)
    const { data: assignments } = await supabase
        .from("shift_assignments")
        .select(`
            talent_id,
            shifts!inner(business_id)
        `)
        .eq("shifts.business_id", profile.id)
        .eq("status", "completed");

    const workedTalentIds = [...new Set(assignments?.map(a => a.talent_id) || [])];

    let workedWith: TalentProfile[] = [];
    if (workedTalentIds.length > 0) {
        const { data } = await supabase
            .from("talent_profiles")
            .select("*")
            .in("user_id", workedTalentIds);
        workedWith = data || [];
    }

    // Get top rated talent as fallback/additional roster
    const { data: topTalent } = await supabase
        .from("talent_profiles")
        .select("*")
        .order("rating_avg", { ascending: false })
        .limit(12);

    return {
        workedWith,
        topTalent: topTalent || [],
    };
}

export default async function TeamPage() {
    const { workedWith, topTalent } = await getTeamData();

    // Combine and deduplicate, prioritizing worked-with talent
    const workedWithIds = new Set(workedWith.map(t => t.id));
    const combinedTalent = [
        ...workedWith,
        ...topTalent.filter(t => !workedWithIds.has(t.id)),
    ];

    return <TeamClient talent={combinedTalent} workedWithCount={workedWith.length} />;
}
