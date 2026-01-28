"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, ArrowRight, CheckCircle2, X } from "lucide-react";

const SKILL_OPTIONS = [
    "Bartender",
    "Server",
    "Host",
    "Sommelier",
    "Barista",
    "Valet",
    "Coat Check",
    "Security",
    "Event Setup",
    "Mixology",
    "Fine Dining",
    "Corporate Events",
    "Weddings",
    "Galas",
];

export default function TalentOnboardingPage() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        bio: "",
        skills: [] as string[],
        hourlyRateMin: "",
    });
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const toggleSkill = (skill: string) => {
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter((s) => s !== skill)
                : [...prev.skills, skill],
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            const { error } = await supabase.from("talent_profiles").insert({
                user_id: user.id,
                full_name: formData.fullName,
                phone: formData.phone || null,
                bio: formData.bio || null,
                skills: formData.skills,
                hourly_rate_min: formData.hourlyRateMin
                    ? parseFloat(formData.hourlyRateMin)
                    : null,
            });

            if (error) {
                console.error("Error creating profile:", error);
                return;
            }

            setStep(4); // Success step
            setTimeout(() => {
                router.push("/talent/dashboard");
            }, 2000);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Success step
    if (step === 4) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center animate-scale-in">
                            <CheckCircle2 className="w-8 h-8 text-success" />
                        </div>
                        <h2 className="font-serif text-2xl font-semibold text-text-primary mb-2">
                            You&apos;re All Set!
                        </h2>
                        <p className="text-text-secondary">
                            Your profile is ready. Redirecting to your dashboard...
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
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`w-2 h-2 rounded-full transition-colors ${s <= step ? "bg-accent-gold" : "bg-border-subtle"
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-accent-gold/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-accent-gold" />
                    </div>
                    <CardTitle className="text-2xl">
                        {step === 1 && "Create Your Profile"}
                        {step === 2 && "Your Skills"}
                        {step === 3 && "Set Your Rate"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Tell us about yourself"}
                        {step === 2 && "What roles are you experienced in?"}
                        {step === 3 && "What's your minimum hourly rate?"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {step === 1 && (
                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                placeholder="Marcus Beaumont"
                                value={formData.fullName}
                                onChange={(e) =>
                                    setFormData({ ...formData, fullName: e.target.value })
                                }
                                required
                            />

                            <Input
                                type="tel"
                                label="Phone Number"
                                placeholder="+1 (555) 123-4567"
                                hint="Optional - for shift notifications"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                            />

                            <Button
                                className="w-full"
                                onClick={() => setStep(2)}
                                disabled={!formData.fullName}
                            >
                                Continue
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {SKILL_OPTIONS.map((skill) => (
                                    <button
                                        key={skill}
                                        onClick={() => toggleSkill(skill)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${formData.skills.includes(skill)
                                                ? "bg-accent-gold text-bg-primary"
                                                : "bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-elevated/80"
                                            }`}
                                    >
                                        {skill}
                                        {formData.skills.includes(skill) && (
                                            <X className="inline w-3 h-3 ml-1" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {formData.skills.length > 0 && (
                                <p className="text-sm text-text-muted">
                                    Selected: {formData.skills.length} skills
                                </p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={() => setStep(3)}
                                    disabled={formData.skills.length === 0}
                                >
                                    Continue
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <Input
                                type="number"
                                label="Minimum Hourly Rate"
                                placeholder="45"
                                hint="Your minimum acceptable rate ($/hr)"
                                value={formData.hourlyRateMin}
                                onChange={(e) =>
                                    setFormData({ ...formData, hourlyRateMin: e.target.value })
                                }
                            />

                            <Textarea
                                label="Bio"
                                placeholder="Tell clients about your experience and what makes you stand out..."
                                hint="A great bio helps you get more bookings"
                                rows={4}
                                value={formData.bio}
                                onChange={(e) =>
                                    setFormData({ ...formData, bio: e.target.value })
                                }
                            />

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setStep(2)}
                                >
                                    Back
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleSubmit}
                                    isLoading={isLoading}
                                >
                                    Complete Profile
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
