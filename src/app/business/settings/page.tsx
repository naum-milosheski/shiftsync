import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import SettingsClient from "./settings-client";

interface BusinessProfile {
    id: string;
    company_name: string;
    billing_email: string | null;
    logo_url: string | null;
    brand_colors: { primary: string; secondary: string } | null;
}

interface UserData {
    email: string;
    created_at: string;
}

async function getProfileData() {
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
    if (!user) return { profile: null, userData: null };

    const { data: profile } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    const { data: userData } = await supabase
        .from("users")
        .select("email, created_at")
        .eq("id", user.id)
        .single();

    return {
        profile: profile as BusinessProfile | null,
        userData: userData as UserData | null,
    };
}

export default async function SettingsPage() {
    const { profile, userData } = await getProfileData();

    return <SettingsClient profile={profile} userData={userData} />;
}
