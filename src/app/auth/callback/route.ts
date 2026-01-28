import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const roleFromUrl = searchParams.get("role");

    if (code) {
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
                            // Handle cookie errors in server context
                        }
                    },
                },
            }
        );

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // Get role from URL param OR user metadata (set during signup)
            const roleFromMetadata = data.user.user_metadata?.role as string | undefined;
            const roleFromSignup = roleFromUrl || roleFromMetadata;

            // Check if user exists in our users table
            const { data: existingUser } = await supabase
                .from("users")
                .select("role")
                .eq("id", data.user.id)
                .single();

            // Priority 1: If we have a role from the signup process (URL or metadata),
            // this is a fresh signup - always use this role
            if (roleFromSignup && (roleFromSignup === "business" || roleFromSignup === "talent")) {
                // Update or insert the role
                if (existingUser) {
                    await supabase
                        .from("users")
                        .update({ role: roleFromSignup })
                        .eq("id", data.user.id);
                } else {
                    await supabase
                        .from("users")
                        .insert({
                            id: data.user.id,
                            email: data.user.email!,
                            role: roleFromSignup
                        });
                }

                // Redirect to onboarding
                return NextResponse.redirect(`${origin}/onboarding/${roleFromSignup}`);
            }

            // Priority 2: No signup role - check if user already has a role in DB
            if (existingUser?.role) {
                return NextResponse.redirect(
                    `${origin}/${existingUser.role}/dashboard`
                );
            }

            // Priority 3: No role anywhere - redirect to role selection
            return NextResponse.redirect(`${origin}/onboarding/role`);
        }
    }

    // If there's an error or no code, redirect to login
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
