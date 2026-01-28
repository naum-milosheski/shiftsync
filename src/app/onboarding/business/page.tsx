"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Building2, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function BusinessOnboardingPage() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyName: "",
        billingEmail: "",
        description: "",
    });
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            const { error } = await supabase.from("business_profiles").insert({
                user_id: user.id,
                company_name: formData.companyName,
                billing_email: formData.billingEmail || user.email,
                onboarding_complete: true,
            });

            if (error) {
                console.error("Error creating profile:", error);
                return;
            }

            setStep(3); // Success step
            setTimeout(() => {
                router.push("/business/dashboard");
            }, 2000);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Success step
    if (step === 3) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center animate-scale-in">
                            <CheckCircle2 className="w-8 h-8 text-success" />
                        </div>
                        <h2 className="font-serif text-2xl font-semibold text-text-primary mb-2">
                            Welcome to ShiftSync!
                        </h2>
                        <p className="text-text-secondary">
                            Your business account is ready. Redirecting to your dashboard...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center pb-2">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        {[1, 2].map((s) => (
                            <div
                                key={s}
                                className={`w-2 h-2 rounded-full transition-colors ${s <= step ? "bg-accent-gold" : "bg-border-subtle"
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-accent-gold/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-accent-gold" />
                    </div>
                    <CardTitle className="text-2xl">
                        {step === 1 ? "Set Up Your Business" : "Almost There!"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1
                            ? "Tell us about your company"
                            : "Just a few more details"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {step === 1 && (
                        <div className="space-y-4">
                            <Input
                                label="Company Name"
                                placeholder="Sterling Events"
                                value={formData.companyName}
                                onChange={(e) =>
                                    setFormData({ ...formData, companyName: e.target.value })
                                }
                                required
                            />

                            <Input
                                type="email"
                                label="Billing Email"
                                placeholder="billing@company.com"
                                hint="We'll send invoices to this address"
                                value={formData.billingEmail}
                                onChange={(e) =>
                                    setFormData({ ...formData, billingEmail: e.target.value })
                                }
                            />

                            <Button
                                className="w-full"
                                onClick={() => setStep(2)}
                                disabled={!formData.companyName}
                            >
                                Continue
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <Textarea
                                label="About Your Business"
                                placeholder="Tell us about the types of events you host..."
                                hint="This helps us match you with the right talent"
                                rows={4}
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />

                            <div className="p-4 rounded-xl bg-accent-gold/5 border border-accent-gold/20">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-accent-gold shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-text-primary mb-1">
                                            AI-Powered Matching
                                        </p>
                                        <p className="text-xs text-text-secondary">
                                            Our AI will learn your preferences to suggest the best talent for your events.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleSubmit}
                                    isLoading={isLoading}
                                >
                                    Complete Setup
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
