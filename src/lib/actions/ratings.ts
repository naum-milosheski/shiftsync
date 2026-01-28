"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================
// TYPES
// ============================================

export interface PendingRating {
    assignmentId: string;
    shiftTitle: string;
    shiftDate: string;
    ratingType: "business_to_talent" | "talent_to_business";
    targetName: string;
    targetPhoto?: string;
}

export interface RatingData {
    assignmentId: string;
    score: number;
    comment?: string;
    type: "business_to_talent" | "talent_to_business";
}

// ============================================
// GET PENDING RATINGS
// ============================================

/**
 * Get shifts that need to be rated by the current user
 * For businesses: rate talent after shift completion
 * For talent: rate business after shift completion
 */
export async function getPendingRatings(): Promise<PendingRating[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    // Get user role
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!userData?.role) return [];

    const pendingRatings: PendingRating[] = [];

    if (userData.role === "business") {
        // Get business profile
        const { data: businessProfile } = await supabase
            .from("business_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!businessProfile) return [];

        // Get completed assignments for this business that haven't been rated
        const { data: completedShifts } = await supabase
            .from("shift_assignments")
            .select(`
                id,
                status,
                shift:shifts!shift_id (
                    id,
                    title,
                    event_date,
                    business_id
                ),
                talent:talent_profiles!talent_id (
                    full_name,
                    photo_urls
                )
            `)
            .eq("status", "completed");

        if (!completedShifts) return [];

        // Filter for this business's shifts and check if already rated
        for (const assignment of completedShifts) {
            const shiftData = Array.isArray(assignment.shift) ? assignment.shift[0] : assignment.shift;
            const talentData = Array.isArray(assignment.talent) ? assignment.talent[0] : assignment.talent;

            if (shiftData?.business_id !== businessProfile.id) continue;

            // Check if already rated
            const { data: existingRating } = await supabase
                .from("ratings")
                .select("id")
                .eq("assignment_id", assignment.id)
                .eq("type", "business_to_talent")
                .single();

            if (!existingRating) {
                pendingRatings.push({
                    assignmentId: assignment.id,
                    shiftTitle: shiftData?.title || "Shift",
                    shiftDate: shiftData?.event_date || "",
                    ratingType: "business_to_talent",
                    targetName: talentData?.full_name || "Talent",
                    targetPhoto: talentData?.photo_urls?.[0],
                });
            }
        }
    } else if (userData.role === "talent") {
        // Get talent profile
        const { data: talentProfile } = await supabase
            .from("talent_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!talentProfile) return [];

        // Get completed assignments for this talent
        const { data: completedAssignments } = await supabase
            .from("shift_assignments")
            .select(`
                id,
                status,
                shift:shifts!shift_id (
                    id,
                    title,
                    event_date,
                    business:business_profiles!business_id (
                        company_name,
                        logo_url
                    )
                )
            `)
            .eq("talent_id", talentProfile.id)
            .eq("status", "completed");

        if (!completedAssignments) return [];

        for (const assignment of completedAssignments) {
            const shiftData = Array.isArray(assignment.shift) ? assignment.shift[0] : assignment.shift;
            const businessData = Array.isArray(shiftData?.business) ? shiftData?.business[0] : shiftData?.business;

            // Check if already rated
            const { data: existingRating } = await supabase
                .from("ratings")
                .select("id")
                .eq("assignment_id", assignment.id)
                .eq("type", "talent_to_business")
                .single();

            if (!existingRating) {
                pendingRatings.push({
                    assignmentId: assignment.id,
                    shiftTitle: shiftData?.title || "Shift",
                    shiftDate: shiftData?.event_date || "",
                    ratingType: "talent_to_business",
                    targetName: businessData?.company_name || "Business",
                    targetPhoto: businessData?.logo_url,
                });
            }
        }
    }

    // Return only the most recent pending rating (one at a time)
    return pendingRatings.slice(0, 1);
}

// ============================================
// SUBMIT RATING
// ============================================

export async function submitRating(data: RatingData): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    // Validate score
    if (data.score < 1 || data.score > 5) {
        return { success: false, error: "Score must be between 1 and 5" };
    }

    // Check if already rated
    const { data: existing } = await supabase
        .from("ratings")
        .select("id")
        .eq("assignment_id", data.assignmentId)
        .eq("type", data.type)
        .single();

    if (existing) {
        return { success: false, error: "Already rated" };
    }

    // Insert rating
    const { error } = await supabase
        .from("ratings")
        .insert({
            assignment_id: data.assignmentId,
            rater_id: user.id,
            score: data.score,
            comment: data.comment || null,
            type: data.type,
        });

    if (error) {
        return { success: false, error: error.message };
    }

    // Update rating_avg on the target profile
    // The database trigger should handle this, but we'll also update manually
    if (data.type === "business_to_talent") {
        // Get talent ID from assignment
        const { data: assignment } = await supabase
            .from("shift_assignments")
            .select("talent_id")
            .eq("id", data.assignmentId)
            .single();

        if (assignment?.talent_id) {
            await updateTalentRating(assignment.talent_id);
        }
    }
    // For talent_to_business, we'd update business rating
    // (requires adding rating_avg to business_profiles)

    revalidatePath("/talent/dashboard");
    revalidatePath("/business/dashboard");

    return { success: true };
}

// ============================================
// DISMISS RATING (Skip)
// ============================================

export async function dismissRating(assignmentId: string): Promise<{ success: boolean }> {
    // For now, dismissing just means we won't show it again this session
    // In production, you might track dismissed ratings in a separate table
    return { success: true };
}

// ============================================
// HELPER: Update talent rating average
// ============================================

async function updateTalentRating(talentId: string) {
    const supabase = await createClient();

    // Calculate new average from all ratings
    const { data: ratings } = await supabase
        .from("ratings")
        .select(`
            score,
            assignment:shift_assignments!assignment_id (
                talent_id
            )
        `)
        .eq("type", "business_to_talent");

    if (!ratings) return;

    // Filter ratings for this talent
    const talentRatings = ratings.filter((r) => {
        const assignment = Array.isArray(r.assignment) ? r.assignment[0] : r.assignment;
        return assignment?.talent_id === talentId;
    });

    if (talentRatings.length === 0) return;

    const avgScore = talentRatings.reduce((sum, r) => sum + r.score, 0) / talentRatings.length;

    // Update talent profile
    await supabase
        .from("talent_profiles")
        .update({ rating_avg: Math.round(avgScore * 100) / 100 })
        .eq("id", talentId);
}
