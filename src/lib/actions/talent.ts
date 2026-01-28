"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================
// TYPES
// ============================================

export interface TalentShift {
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    start_time: string;
    end_time: string;
    venue_name: string;
    venue_address: string | null;
    role_type: string;
    hourly_rate: number;
    attire_code: string | null;
    status: string;
    workers_needed: number;
    workers_confirmed: number;
    business: {
        company_name: string;
        logo_url: string | null;
    };
    assignment?: {
        id: string;
        status: string;
    } | null;
    time_entry?: {
        id: string;
        clock_in: string | null;
        clock_out: string | null;
    } | null;
}

export interface ActiveShift extends TalentShift {
    assignment: {
        id: string;
        status: string;
    };
    time_entry: {
        id: string;
        clock_in: string;
        clock_out: string | null;
    } | null;
}

// ============================================
// SHIFT QUERIES
// ============================================

/**
 * Get open shifts that talent can apply to
 */
export async function getAvailableShifts(): Promise<TalentShift[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    // Get talent profile ID
    const { data: talentProfile } = await supabase
        .from("talent_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!talentProfile) return [];

    // Get open shifts that talent hasn't applied to
    const { data: shifts, error } = await supabase
        .from("shifts")
        .select(`
            *,
            business:business_profiles!business_id (
                company_name,
                logo_url
            ),
            assignments:shift_assignments!shift_id (
                id,
                status,
                talent_id
            )
        `)
        .eq("status", "open")
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date", { ascending: true });

    if (error || !shifts) return [];

    // Filter out shifts where talent already has an assignment
    return shifts
        .filter((shift) => {
            const myAssignment = shift.assignments?.find(
                (a: { talent_id: string }) => a.talent_id === talentProfile.id
            );
            return !myAssignment;
        })
        .map((shift) => ({
            ...shift,
            business: shift.business,
            assignment: null,
            time_entry: null,
        }));
}

/**
 * Get shifts where talent is assigned (upcoming + past)
 */
export async function getMyShifts(filter?: "upcoming" | "past" | "all"): Promise<TalentShift[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: talentProfile } = await supabase
        .from("talent_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!talentProfile) return [];

    const today = new Date().toISOString().split("T")[0];

    let query = supabase
        .from("shift_assignments")
        .select(`
            id,
            status,
            shift:shifts!shift_id (
                *,
                business:business_profiles!business_id (
                    company_name,
                    logo_url
                )
            ),
            time_entry:time_entries!assignment_id (
                id,
                clock_in,
                clock_out
            )
        `)
        .eq("talent_id", talentProfile.id)
        .in("status", ["accepted", "completed", "invited", "pending"]);

    const { data: assignments, error } = await query;

    if (error || !assignments) return [];

    // Transform and filter based on date
    // Note: Supabase may return nested relations as arrays
    const shifts: TalentShift[] = assignments
        .filter((a) => a.shift)
        .map((a) => {
            const shiftData = Array.isArray(a.shift) ? a.shift[0] : a.shift;
            const businessData = Array.isArray(shiftData?.business) ? shiftData?.business[0] : shiftData?.business;
            const timeEntryData = Array.isArray(a.time_entry) ? a.time_entry[0] : a.time_entry;

            return {
                id: shiftData.id,
                title: shiftData.title,
                description: shiftData.description,
                event_date: shiftData.event_date,
                start_time: shiftData.start_time,
                end_time: shiftData.end_time,
                venue_name: shiftData.venue_name,
                venue_address: shiftData.venue_address,
                role_type: shiftData.role_type,
                hourly_rate: shiftData.hourly_rate,
                attire_code: shiftData.attire_code,
                status: shiftData.status,
                workers_needed: shiftData.workers_needed,
                workers_confirmed: shiftData.workers_confirmed,
                business: businessData || { company_name: "Unknown", logo_url: null },
                assignment: {
                    id: a.id,
                    status: a.status,
                },
                time_entry: timeEntryData || null,
            } as TalentShift;
        });

    if (filter === "upcoming") {
        return shifts.filter((s) => s.event_date >= today);
    } else if (filter === "past") {
        return shifts.filter((s) => s.event_date < today);
    }

    return shifts;
}

/**
 * Get a single shift by ID with assignment info
 */
export async function getShiftById(shiftId: string): Promise<TalentShift | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: talentProfile } = await supabase
        .from("talent_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const { data: shift, error } = await supabase
        .from("shifts")
        .select(`
            *,
            business:business_profiles!business_id (
                company_name,
                logo_url
            )
        `)
        .eq("id", shiftId)
        .single();

    if (error || !shift) return null;

    // Get assignment if talent has one
    let assignment = null;
    let timeEntry = null;

    if (talentProfile) {
        const { data: assignmentData } = await supabase
            .from("shift_assignments")
            .select(`
                id,
                status,
                time_entry:time_entries!assignment_id (
                    id,
                    clock_in,
                    clock_out
                )
            `)
            .eq("shift_id", shiftId)
            .eq("talent_id", talentProfile.id)
            .single();

        if (assignmentData) {
            assignment = {
                id: assignmentData.id,
                status: assignmentData.status,
            };
            timeEntry = assignmentData.time_entry?.[0] || null;
        }
    }

    return {
        ...shift,
        business: shift.business,
        assignment,
        time_entry: timeEntry,
    };
}

/**
 * Get active shift (clocked in but not out)
 */
export async function getActiveShift(): Promise<ActiveShift | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: talentProfile } = await supabase
        .from("talent_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!talentProfile) return null;

    // Find time entry where clocked in but not out
    const { data: activeEntry } = await supabase
        .from("time_entries")
        .select(`
            id,
            clock_in,
            clock_out,
            assignment:shift_assignments!assignment_id (
                id,
                status,
                shift:shifts!shift_id (
                    *,
                    business:business_profiles!business_id (
                        company_name,
                        logo_url
                    )
                )
            )
        `)
        .not("clock_in", "is", null)
        .is("clock_out", null)
        .limit(1)
        .single();

    if (!activeEntry) return null;

    // Handle potential array results from Supabase joins
    const assignmentData = Array.isArray(activeEntry.assignment)
        ? activeEntry.assignment[0]
        : activeEntry.assignment;

    if (!assignmentData) return null;

    const shiftData = Array.isArray(assignmentData.shift)
        ? assignmentData.shift[0]
        : assignmentData.shift;

    if (!shiftData) return null;

    const businessData = Array.isArray(shiftData.business)
        ? shiftData.business[0]
        : shiftData.business;

    return {
        id: shiftData.id,
        title: shiftData.title,
        description: shiftData.description,
        event_date: shiftData.event_date,
        start_time: shiftData.start_time,
        end_time: shiftData.end_time,
        venue_name: shiftData.venue_name,
        venue_address: shiftData.venue_address,
        role_type: shiftData.role_type,
        hourly_rate: shiftData.hourly_rate,
        attire_code: shiftData.attire_code,
        status: shiftData.status,
        workers_needed: shiftData.workers_needed,
        workers_confirmed: shiftData.workers_confirmed,
        business: businessData || { company_name: "Unknown", logo_url: null },
        assignment: {
            id: assignmentData.id,
            status: assignmentData.status,
        },
        time_entry: {
            id: activeEntry.id,
            clock_in: activeEntry.clock_in,
            clock_out: activeEntry.clock_out,
        },
    };
}

// ============================================
// SHIFT ACTIONS
// ============================================

/**
 * Accept a shift invitation or apply to an open shift
 */
export async function acceptShift(shiftId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { data: talentProfile } = await supabase
        .from("talent_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!talentProfile) return { success: false, error: "Talent profile not found" };

    // Check if already assigned
    const { data: existing } = await supabase
        .from("shift_assignments")
        .select("id, status")
        .eq("shift_id", shiftId)
        .eq("talent_id", talentProfile.id)
        .single();

    if (existing) {
        // Update existing assignment to accepted
        const { error } = await supabase
            .from("shift_assignments")
            .update({ status: "accepted", responded_at: new Date().toISOString() })
            .eq("id", existing.id);

        if (error) return { success: false, error: error.message };
    } else {
        // Create new assignment
        const { error } = await supabase
            .from("shift_assignments")
            .insert({
                shift_id: shiftId,
                talent_id: talentProfile.id,
                status: "pending", // Pending until business confirms
            });

        if (error) return { success: false, error: error.message };
    }

    revalidatePath("/talent/shifts");
    revalidatePath("/talent/dashboard");
    return { success: true };
}

// ============================================
// CLOCK IN/OUT
// ============================================

/**
 * Clock in to a shift
 */
export async function clockIn(assignmentId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    // Verify assignment belongs to user
    const { data: assignment } = await supabase
        .from("shift_assignments")
        .select(`
            id,
            status,
            talent:talent_profiles!talent_id (
                user_id
            )
        `)
        .eq("id", assignmentId)
        .single();

    if (!assignment) return { success: false, error: "Assignment not found" };

    // Handle potential array from Supabase join
    const talentData = Array.isArray(assignment.talent) ? assignment.talent[0] : assignment.talent;

    if (talentData?.user_id !== user.id) {
        return { success: false, error: "Unauthorized" };
    }
    if (assignment.status !== "accepted") {
        return { success: false, error: "Shift not confirmed" };
    }

    // Check if already clocked in
    const { data: existingEntry } = await supabase
        .from("time_entries")
        .select("id")
        .eq("assignment_id", assignmentId)
        .single();

    if (existingEntry) {
        return { success: false, error: "Already clocked in" };
    }

    // Create time entry
    const { error } = await supabase
        .from("time_entries")
        .insert({
            assignment_id: assignmentId,
            clock_in: new Date().toISOString(),
        });

    if (error) return { success: false, error: error.message };

    revalidatePath("/talent/shifts");
    revalidatePath("/talent/dashboard");
    return { success: true };
}

/**
 * Clock out of a shift
 */
export async function clockOut(assignmentId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    // Get time entry
    const { data: timeEntry } = await supabase
        .from("time_entries")
        .select(`
            id,
            clock_in,
            assignment:shift_assignments!assignment_id (
                id,
                talent:talent_profiles!talent_id (
                    user_id,
                    id
                ),
                shift:shifts!shift_id (
                    hourly_rate
                )
            )
        `)
        .eq("assignment_id", assignmentId)
        .single();

    if (!timeEntry) return { success: false, error: "Not clocked in" };

    // Handle potential arrays from Supabase joins
    const assignmentData = Array.isArray(timeEntry.assignment) ? timeEntry.assignment[0] : timeEntry.assignment;
    const talentData = Array.isArray(assignmentData?.talent) ? assignmentData?.talent[0] : assignmentData?.talent;
    const shiftData = Array.isArray(assignmentData?.shift) ? assignmentData?.shift[0] : assignmentData?.shift;

    if (talentData?.user_id !== user.id) {
        return { success: false, error: "Unauthorized" };
    }

    const clockOutTime = new Date();
    const clockIn = new Date(timeEntry.clock_in);
    const hoursWorked = (clockOutTime.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
    const hourlyRate = shiftData?.hourly_rate || 0;
    const amountEarned = hoursWorked * hourlyRate;

    // Update time entry
    const { error: updateError } = await supabase
        .from("time_entries")
        .update({
            clock_out: clockOutTime.toISOString(),
            hours_worked: Math.round(hoursWorked * 100) / 100,
            amount_earned: Math.round(amountEarned * 100) / 100,
        })
        .eq("id", timeEntry.id);

    if (updateError) return { success: false, error: updateError.message };

    // Update assignment status to completed
    await supabase
        .from("shift_assignments")
        .update({ status: "completed" })
        .eq("id", assignmentId);

    // Update talent pending balance (direct update instead of RPC)
    const talentId = talentData?.id;
    if (talentId) {
        // Get current pending balance
        const { data: talentProfile } = await supabase
            .from("talent_profiles")
            .select("pending_balance")
            .eq("id", talentId)
            .single();

        const currentPending = talentProfile?.pending_balance || 0;
        const newPending = currentPending + Math.round(amountEarned * 100) / 100;

        await supabase
            .from("talent_profiles")
            .update({ pending_balance: newPending })
            .eq("id", talentId);
    }

    revalidatePath("/talent/shifts");
    revalidatePath("/talent/dashboard");
    revalidatePath("/talent/earnings");
    return { success: true };
}
