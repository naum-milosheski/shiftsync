"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================
// TYPES
// ============================================

export interface BlockedDate {
    id: string;
    blocked_date: string;
    reason: string | null;
}

export interface BookedDate {
    date: string;
    shiftId: string;
    title: string;
}

// ============================================
// QUERIES
// ============================================

/**
 * Get blocked dates for a month
 */
export async function getBlockedDates(
    year: number,
    month: number
): Promise<BlockedDate[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: talentProfile } = await supabase
        .from("talent_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!talentProfile) return [];

    // Get first and last day of month
    const startDate = new Date(year, month, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data: blocks, error } = await supabase
        .from("availability_blocks")
        .select("id, blocked_date, reason")
        .eq("talent_id", talentProfile.id)
        .gte("blocked_date", startDate)
        .lte("blocked_date", endDate);

    if (error) return [];
    return blocks || [];
}

/**
 * Get booked dates (shifts with assignments)
 */
export async function getBookedDates(
    year: number,
    month: number
): Promise<BookedDate[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: talentProfile } = await supabase
        .from("talent_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!talentProfile) return [];

    const startDate = new Date(year, month, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data: assignments, error } = await supabase
        .from("shift_assignments")
        .select(`
            shift:shifts!shift_id (
                id,
                title,
                event_date
            )
        `)
        .eq("talent_id", talentProfile.id)
        .eq("status", "accepted");

    if (error || !assignments) return [];

    // Handle potential array result from Supabase join
    return assignments
        .filter((a) => {
            const shift = Array.isArray(a.shift) ? a.shift[0] : a.shift;
            return shift && shift.event_date >= startDate && shift.event_date <= endDate;
        })
        .map((a) => {
            const shift = Array.isArray(a.shift) ? a.shift[0] : a.shift;
            return {
                date: shift.event_date,
                shiftId: shift.id,
                title: shift.title,
            };
        });
}

// ============================================
// ACTIONS
// ============================================

/**
 * Toggle a date as blocked/available
 */
export async function toggleBlockedDate(
    date: string
): Promise<{ success: boolean; blocked: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, blocked: false, error: "Not authenticated" };

    const { data: talentProfile } = await supabase
        .from("talent_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!talentProfile) return { success: false, blocked: false, error: "Profile not found" };

    // Check if already blocked
    const { data: existing } = await supabase
        .from("availability_blocks")
        .select("id")
        .eq("talent_id", talentProfile.id)
        .eq("blocked_date", date)
        .single();

    if (existing) {
        // Remove block
        const { error } = await supabase
            .from("availability_blocks")
            .delete()
            .eq("id", existing.id);

        if (error) return { success: false, blocked: true, error: error.message };

        revalidatePath("/talent/availability");
        return { success: true, blocked: false };
    } else {
        // Add block
        const { error } = await supabase
            .from("availability_blocks")
            .insert({
                talent_id: talentProfile.id,
                blocked_date: date,
            });

        if (error) return { success: false, blocked: false, error: error.message };

        revalidatePath("/talent/availability");
        return { success: true, blocked: true };
    }
}

/**
 * Block multiple dates at once
 */
export async function blockDateRange(
    dates: string[]
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { data: talentProfile } = await supabase
        .from("talent_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!talentProfile) return { success: false, error: "Profile not found" };

    // Get existing blocks
    const { data: existing } = await supabase
        .from("availability_blocks")
        .select("blocked_date")
        .eq("talent_id", talentProfile.id)
        .in("blocked_date", dates);

    const existingDates = new Set(existing?.map((e) => e.blocked_date) || []);
    const newDates = dates.filter((d) => !existingDates.has(d));

    if (newDates.length === 0) {
        return { success: true };
    }

    const { error } = await supabase
        .from("availability_blocks")
        .insert(
            newDates.map((date) => ({
                talent_id: talentProfile.id,
                blocked_date: date,
            }))
        );

    if (error) return { success: false, error: error.message };

    revalidatePath("/talent/availability");
    return { success: true };
}

/**
 * Clear all blocks for a month
 */
export async function clearMonth(
    year: number,
    month: number
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { data: talentProfile } = await supabase
        .from("talent_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!talentProfile) return { success: false, error: "Profile not found" };

    const startDate = new Date(year, month, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { error } = await supabase
        .from("availability_blocks")
        .delete()
        .eq("talent_id", talentProfile.id)
        .gte("blocked_date", startDate)
        .lte("blocked_date", endDate);

    if (error) return { success: false, error: error.message };

    revalidatePath("/talent/availability");
    return { success: true };
}
