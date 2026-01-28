import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Process Earnings API
 * Moves pending balance to available balance after "hold period"
 * 
 * In production: Would be triggered by a cron job
 * For demo: Can be called manually or triggered after clock-out
 */
export async function POST(request: Request) {
    // Verify API key for cron jobs (optional security)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // In production, validate the secret
    // if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    );

    try {
        // Find completed time entries from more than 1 hour ago (simulated hold period)
        // In production, this would be 24-48 hours
        const holdPeriodHours = 1; // 1 hour for demo, 24+ for production
        const cutoffTime = new Date(Date.now() - holdPeriodHours * 60 * 60 * 1000);

        const { data: entries, error: fetchError } = await supabase
            .from("time_entries")
            .select(`
                id,
                amount_earned,
                clock_out,
                assignment:shift_assignments!assignment_id (
                    talent_id
                )
            `)
            .not("clock_out", "is", null)
            .not("amount_earned", "is", null)
            .eq("approved", false) // Only unapproved entries
            .lt("clock_out", cutoffTime.toISOString());

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        let processed = 0;
        const updates: { talentId: string; amount: number }[] = [];

        // Group earnings by talent
        for (const entry of entries || []) {
            const assignment = Array.isArray(entry.assignment)
                ? entry.assignment[0]
                : entry.assignment;

            if (!assignment?.talent_id || !entry.amount_earned) continue;

            const existing = updates.find(u => u.talentId === assignment.talent_id);
            if (existing) {
                existing.amount += entry.amount_earned;
            } else {
                updates.push({
                    talentId: assignment.talent_id,
                    amount: entry.amount_earned,
                });
            }

            // Mark entry as approved
            await supabase
                .from("time_entries")
                .update({ approved: true })
                .eq("id", entry.id);

            processed++;
        }

        // Transfer from pending to available for each talent
        for (const update of updates) {
            const { data: profile } = await supabase
                .from("talent_profiles")
                .select("pending_balance, available_balance")
                .eq("id", update.talentId)
                .single();

            if (profile) {
                const newPending = Math.max(0, (profile.pending_balance || 0) - update.amount);
                const newAvailable = (profile.available_balance || 0) + update.amount;

                await supabase
                    .from("talent_profiles")
                    .update({
                        pending_balance: Math.round(newPending * 100) / 100,
                        available_balance: Math.round(newAvailable * 100) / 100,
                    })
                    .eq("id", update.talentId);
            }
        }

        return NextResponse.json({
            success: true,
            processed,
            message: `Processed ${processed} time entries, updated ${updates.length} talent profiles`,
        });

    } catch (error) {
        console.error("Process earnings error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
