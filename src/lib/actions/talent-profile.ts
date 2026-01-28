"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface TalentProfile {
    id: string;
    user_id: string;
    full_name: string;
    bio: string | null;
    skills: string[];
    photo_urls: string[];
    phone: string | null;
    hourly_rate_min: number | null;
    available_now: boolean;
    rating_avg: number;
    total_shifts: number;
    pending_balance: number;
    available_balance: number;
}

export async function getTalentProfile(): Promise<TalentProfile | null> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from("talent_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (error || !data) {
        console.error("Error fetching talent profile:", error);
        return null;
    }

    return data as TalentProfile;
}

export interface UpdateTalentProfileData {
    full_name?: string;
    bio?: string;
    hourly_rate_min?: number;
    skills?: string[];
}

export async function updateTalentProfile(
    updates: UpdateTalentProfileData
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
        .from("talent_profiles")
        .update(updates)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error updating talent profile:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/talent/settings");
    return { success: true };
}
