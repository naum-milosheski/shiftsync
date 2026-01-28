"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, CheckCircle2, Sparkles, Building2, User, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [demoLoading, setDemoLoading] = useState<'business' | 'talent' | null>(null);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setError(error.message);
            } else {
                setIsSuccess(true);
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async (role: 'business' | 'talent') => {
        setDemoLoading(role);
        setError(null);

        try {
            const email = role === 'business'
                ? 'demo.business@shiftsync.com'
                : 'demo.talent@shiftsync.com';
            const password = 'demo123';

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(`Demo login failed: ${error.message}`);
                setDemoLoading(null);
                return;
            }

            // Redirect based on role
            router.push(role === 'business' ? '/business/dashboard' : '/talent/dashboard');
        } catch {
            setError("Demo login failed. Please try again.");
            setDemoLoading(null);
        }
    };

    if (isSuccess) {
        return (
            <Card className="w-full max-w-md">
                <CardContent className="pt-8 pb-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                    <h2 className="font-serif text-2xl font-semibold text-text-primary mb-2">
                        Check Your Email
                    </h2>
                    <p className="text-text-secondary mb-6">
                        We&apos;ve sent a magic link to <strong className="text-text-primary">{email}</strong>
                    </p>
                    <p className="text-sm text-text-muted">
                        Click the link in your email to sign in. The link will expire in 1 hour.
                    </p>
                </CardContent>
                <CardFooter className="justify-center border-t border-border-subtle pt-6">
                    <button
                        onClick={() => setIsSuccess(false)}
                        className="text-sm text-accent-gold hover:underline"
                    >
                        Use a different email
                    </button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-accent-gold/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-accent-gold" />
                </div>
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>
                    Sign in to your ShiftSync account
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="email"
                        label="Email Address"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={error || undefined}
                        required
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isLoading}
                    >
                        <Mail className="w-4 h-4" />
                        Send Magic Link
                    </Button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border-subtle" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-bg-secondary px-2 text-text-muted">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                            await supabase.auth.signInWithOAuth({
                                provider: "google",
                                options: {
                                    redirectTo: `${window.location.origin}/auth/callback`,
                                },
                            });
                        }}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Google
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                            await supabase.auth.signInWithOAuth({
                                provider: "apple",
                                options: {
                                    redirectTo: `${window.location.origin}/auth/callback`,
                                },
                            });
                        }}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                        Apple
                    </Button>
                </div>

                {/* Demo Access Section */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border-subtle" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-bg-secondary px-2 text-text-muted">
                            🎭 Demo Access
                        </span>
                    </div>
                </div>

                <p className="text-center text-sm text-text-muted mb-4">
                    Try the full app without signing up
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-accent-gold/30 hover:border-accent-gold hover:bg-accent-gold/10"
                        onClick={() => handleDemoLogin('business')}
                        disabled={demoLoading !== null}
                    >
                        {demoLoading === 'business' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Building2 className="w-4 h-4 text-accent-gold" />
                        )}
                        <span className="text-accent-gold">Business Demo</span>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="border-green-500/30 hover:border-green-500 hover:bg-green-500/10"
                        onClick={() => handleDemoLogin('talent')}
                        disabled={demoLoading !== null}
                    >
                        {demoLoading === 'talent' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <User className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-green-500">Talent Demo</span>
                    </Button>
                </div>
            </CardContent>

            <CardFooter className="justify-center border-t border-border-subtle pt-6">
                <p className="text-sm text-text-muted">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-accent-gold hover:underline">
                        Sign up
                        <ArrowRight className="inline w-3 h-3 ml-1" />
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}

