import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Update Supabase Auth session in middleware
 */
export async function updateSession(request: NextRequest) {
    // Skip auth if Supabase is not configured (for development/preview)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Get the current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Define route categories
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
    const isOnboardingRoute = pathname.startsWith("/onboarding");
    const isProtectedRoute = pathname.startsWith("/business") || pathname.startsWith("/talent");
    const isPublicRoute = pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/api");

    // If user is not logged in
    if (!user) {
        // Allow public routes, auth routes
        if (isPublicRoute || isAuthRoute) {
            return supabaseResponse;
        }
        // Redirect to login for protected routes
        if (isProtectedRoute || isOnboardingRoute) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    // User is logged in
    // Check if they're trying to access auth pages (redirect to dashboard)
    if (isAuthRoute) {
        // Get user's role from our users table
        const { data: userData } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

        if (userData?.role) {
            const url = request.nextUrl.clone();
            url.pathname = `/${userData.role}/dashboard`;
            return NextResponse.redirect(url);
        }
        // No role yet, allow access (they'll be redirected to onboarding after)
        return supabaseResponse;
    }

    // For protected routes, ensure user has appropriate role and profile
    if (isProtectedRoute) {
        const { data: userData } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

        // If user has no role, redirect to role selection
        if (!userData?.role) {
            const url = request.nextUrl.clone();
            url.pathname = "/onboarding/role";
            return NextResponse.redirect(url);
        }

        // Check if trying to access wrong dashboard
        const requestedRole = pathname.split("/")[1]; // 'business' or 'talent'
        if (requestedRole !== userData.role) {
            const url = request.nextUrl.clone();
            url.pathname = `/${userData.role}/dashboard`;
            return NextResponse.redirect(url);
        }

        // Check if they have a profile
        const profileTable = userData.role === "business" ? "business_profiles" : "talent_profiles";
        const { data: profile } = await supabase
            .from(profileTable)
            .select("id")
            .eq("user_id", user.id)
            .single();

        // No profile yet, redirect to onboarding
        if (!profile) {
            const url = request.nextUrl.clone();
            url.pathname = `/onboarding/${userData.role}`;
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}
