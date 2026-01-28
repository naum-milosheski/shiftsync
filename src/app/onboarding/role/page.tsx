"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building2, User, ArrowRight } from "lucide-react";

export default function RoleSelectionPage() {
    const router = useRouter();

    const handleRoleSelect = async (role: "business" | "talent") => {
        // Update role and redirect to onboarding
        const response = await fetch("/api/user/role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role }),
        });

        if (response.ok) {
            router.push(`/onboarding/${role}`);
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">Welcome to ShiftSync!</CardTitle>
                    <CardDescription>
                        Tell us how you&apos;ll be using the platform
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <button
                        onClick={() => handleRoleSelect("business")}
                        className="w-full p-6 rounded-xl border border-border-subtle bg-bg-primary hover:border-accent-gold/50 hover:bg-bg-elevated transition-all text-left group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0 group-hover:bg-accent-gold/20 transition-colors">
                                    <Building2 className="w-6 h-6 text-accent-gold" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-semibold text-text-primary mb-1">
                                        I&apos;m Hiring Staff
                                    </h3>
                                    <p className="text-sm text-text-secondary">
                                        Post shifts and find elite talent for your events
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-accent-gold transition-colors" />
                        </div>
                    </button>

                    <button
                        onClick={() => handleRoleSelect("talent")}
                        className="w-full p-6 rounded-xl border border-border-subtle bg-bg-primary hover:border-accent-gold/50 hover:bg-bg-elevated transition-all text-left group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0 group-hover:bg-accent-gold/20 transition-colors">
                                    <User className="w-6 h-6 text-accent-gold" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-semibold text-text-primary mb-1">
                                        I&apos;m Looking for Work
                                    </h3>
                                    <p className="text-sm text-text-secondary">
                                        Find gigs at luxury events and build your career
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-accent-gold transition-colors" />
                        </div>
                    </button>
                </CardContent>
            </Card>
        </div>
    );
}
