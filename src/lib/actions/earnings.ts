"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================
// TYPES
// ============================================

export interface EarningsSummary {
    availableBalance: number;
    pendingBalance: number;
    totalEarnings: number;
    totalShifts: number;
    rating: number;
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: "earning" | "payout";
    status: "completed" | "pending";
}

// ============================================
// QUERIES
// ============================================

/**
 * Get earnings summary for talent
 */
export async function getEarningsSummary(): Promise<EarningsSummary | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile, error } = await supabase
        .from("talent_profiles")
        .select(`
            available_balance,
            pending_balance,
            total_shifts,
            rating_avg
        `)
        .eq("user_id", user.id)
        .single();

    if (error || !profile) return null;

    // Calculate total earnings from completed time entries
    const { data: talentId } = await supabase
        .from("talent_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    let totalEarnings = 0;

    if (talentId) {
        const { data: earnings } = await supabase
            .from("time_entries")
            .select(`
                amount_earned,
                assignment:shift_assignments!assignment_id (
                    talent_id
                )
            `)
            .not("amount_earned", "is", null);

        if (earnings) {
            totalEarnings = earnings
                .filter((e) => {
                    const assignment = Array.isArray(e.assignment) ? e.assignment[0] : e.assignment;
                    return assignment?.talent_id === talentId.id;
                })
                .reduce((sum, e) => sum + (e.amount_earned || 0), 0);
        }
    }

    return {
        availableBalance: profile.available_balance || 0,
        pendingBalance: profile.pending_balance || 0,
        totalEarnings,
        totalShifts: profile.total_shifts || 0,
        rating: profile.rating_avg || 0,
    };
}

/**
 * Get recent transactions (earnings + payouts)
 */
export async function getRecentTransactions(limit = 10): Promise<Transaction[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: talentProfile } = await supabase
        .from("talent_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!talentProfile) return [];

    const transactions: Transaction[] = [];

    // Get completed time entries as earnings
    const { data: earnings } = await supabase
        .from("time_entries")
        .select(`
            id,
            clock_out,
            amount_earned,
            approved,
            assignment:shift_assignments!assignment_id (
                talent_id,
                shift:shifts!shift_id (
                    title,
                    venue_name
                )
            )
        `)
        .not("amount_earned", "is", null)
        .order("clock_out", { ascending: false })
        .limit(limit);

    if (earnings) {
        earnings
            .filter((e) => {
                const assignment = Array.isArray(e.assignment) ? e.assignment[0] : e.assignment;
                return assignment?.talent_id === talentProfile.id;
            })
            .forEach((e) => {
                const assignment = Array.isArray(e.assignment) ? e.assignment[0] : e.assignment;
                const shift = Array.isArray(assignment?.shift) ? assignment?.shift[0] : assignment?.shift;
                transactions.push({
                    id: e.id,
                    date: e.clock_out || new Date().toISOString(),
                    description: `${shift?.title || "Shift"} at ${shift?.venue_name || "Venue"}`,
                    amount: e.amount_earned || 0,
                    type: "earning",
                    status: e.approved ? "completed" : "pending",
                });
            });
    }

    // Get payouts
    const { data: payouts } = await supabase
        .from("payouts")
        .select("id, amount, status, created_at")
        .eq("talent_id", talentProfile.id)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (payouts) {
        payouts.forEach((p) => {
            transactions.push({
                id: p.id,
                date: p.created_at,
                description: "Withdrawal",
                amount: -p.amount,
                type: "payout",
                status: p.status === "completed" ? "completed" : "pending",
            });
        });
    }

    // Sort by date and limit
    return transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
}

// ============================================
// ACTIONS
// ============================================

/**
 * Request a payout
 */
export async function requestPayout(
    amount: number
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { data: profile } = await supabase
        .from("talent_profiles")
        .select("id, available_balance")
        .eq("user_id", user.id)
        .single();

    if (!profile) return { success: false, error: "Profile not found" };

    if (amount <= 0) {
        return { success: false, error: "Invalid amount" };
    }

    if (amount > (profile.available_balance || 0)) {
        return { success: false, error: "Insufficient balance" };
    }

    // Create payout record
    const { error: payoutError } = await supabase
        .from("payouts")
        .insert({
            talent_id: profile.id,
            amount,
            status: "pending",
        });

    if (payoutError) return { success: false, error: payoutError.message };

    // Deduct from available balance
    const { error: updateError } = await supabase
        .from("talent_profiles")
        .update({
            available_balance: (profile.available_balance || 0) - amount,
        })
        .eq("id", profile.id);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath("/talent/earnings");
    return { success: true };
}
