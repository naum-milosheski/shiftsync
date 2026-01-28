"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Building2,
    CreditCard,
    CheckCircle2,
    ExternalLink,
    Shield,
    Zap,
    Camera,
    LogOut,
    UserCircle,
    DollarSign,
    Loader2,
    Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateTalentProfile, type TalentProfile } from "@/lib/actions/talent-profile";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// Skills list - shared source of truth for Business filters
const ALL_SKILLS = [
    "Bartender",
    "Server",
    "Host",
    "Security",
    "Mixologist",
    "Chef",
    "Brand Ambassador",
    "VIP Service",
    "Private Events",
    "Discrete",
    "Multi-lingual",
    "Executive Service",
    "Late Night",
    "Uniform Ready",
];

interface SettingsClientProps {
    profile: TalentProfile | null;
}

export function SettingsClient({ profile }: SettingsClientProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        profile?.photo_urls?.[0] || null
    );
    const [isPending, startTransition] = useTransition();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    // Form state
    const [fullName, setFullName] = useState(profile?.full_name || "");
    const [bio, setBio] = useState(profile?.bio || "");
    const [hourlyRate, setHourlyRate] = useState(
        profile?.hourly_rate_min?.toString() || ""
    );
    const [selectedSkills, setSelectedSkills] = useState<string[]>(
        profile?.skills || []
    );

    const toggleSkill = (skill: string) => {
        setSelectedSkills((prev) =>
            prev.includes(skill)
                ? prev.filter((s) => s !== skill)
                : [...prev, skill]
        );
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            // Simulated upload toast
            setToastMessage("Profile photo updated! (Demo)");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const handleConnect = async () => {
        setIsConnecting(true);
        // Simulate Stripe Connect OAuth flow
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsConnected(true);
        setIsConnecting(false);
    };

    const handleSaveChanges = () => {
        startTransition(async () => {
            const result = await updateTalentProfile({
                full_name: fullName,
                bio: bio,
                hourly_rate_min: hourlyRate ? parseFloat(hourlyRate) : undefined,
                skills: selectedSkills,
            });

            if (result.success) {
                setToastMessage("Profile saved successfully!");
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } else {
                setToastMessage(result.error || "Failed to save profile");
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        });
    };

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    return (
        <div className="max-w-3xl mx-auto space-y-4 lg:space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div>
                <h1 className="font-serif text-lg sm:text-2xl lg:text-3xl font-semibold text-text-primary">
                    Settings
                </h1>
                <p className="text-text-secondary mt-1 text-xs sm:text-base">
                    Manage your profile and payout preferences
                </p>
            </div>

            {/* Public Profile Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-accent-gold" />
                        Public Profile
                    </CardTitle>
                    <CardDescription>
                        This information will be visible to businesses when you apply
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="relative group cursor-pointer">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-bg-elevated border-2 border-border-subtle group-hover:border-accent-gold transition-colors">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-accent-gold/5">
                                        <UserCircle className="w-8 h-8 sm:w-12 sm:h-12 text-accent-gold/40" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-text-primary">Profile Photo</h3>
                            <p className="text-sm text-text-muted mt-1">
                                Upload a professional headshot.
                                <br />Recommended size: 400x400px.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                placeholder="e.g. Alex Morgan"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <Input
                                    id="hourlyRate"
                                    type="number"
                                    placeholder="e.g. 25"
                                    className="pl-9"
                                    value={hourlyRate}
                                    onChange={(e) => setHourlyRate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Short Bio</Label>
                        <Textarea
                            id="bio"
                            placeholder="Tell businesses about your experience..."
                            className="min-h-[100px]"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                    </div>

                    {/* Save Button Removed from here */}
                </CardContent>
            </Card>

            {/* Skills & Amenities Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent-gold" />
                        Skills & Amenities
                    </CardTitle>
                    <CardDescription>
                        Select your specialties to help businesses find you
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {ALL_SKILLS.map((skill) => {
                            const isActive = selectedSkills.includes(skill);
                            return (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => toggleSkill(skill)}
                                    className={cn(
                                        "px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all cursor-pointer",
                                        isActive
                                            ? "border-accent-gold text-accent-gold bg-accent-gold/10"
                                            : "border-border-subtle text-text-muted bg-transparent hover:border-text-muted hover:text-text-secondary"
                                    )}
                                >
                                    {skill}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-xs text-text-muted mt-4">
                        {selectedSkills.length} skill{selectedSkills.length !== 1 ? "s" : ""} selected
                    </p>
                </CardContent>
            </Card>



            {/* Unified Action Area */}
            <div className="flex sm:justify-end pt-2">
                <Button
                    className="btn-gold w-full sm:w-auto"
                    onClick={handleSaveChanges}
                    disabled={isPending}
                >
                    {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Profile
                </Button>
            </div>

            {/* Payout Method Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-accent-gold" />
                        Payout Method
                    </CardTitle>
                    <CardDescription>
                        Connect your bank account to receive instant payouts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isConnected ? (
                        <div className="space-y-4">
                            {/* Connected State */}
                            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-success/10 border border-success/20">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-success/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-text-primary">Bank Account Connected</p>
                                    <p className="text-sm text-text-muted">Chase ••••4567</p>
                                </div>
                                <Button variant="outline" size="sm">
                                    Change
                                </Button>
                            </div>

                            {/* Payout Schedule */}
                            <div className="p-3 sm:p-4 rounded-xl bg-bg-elevated border border-border-subtle">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-text-primary">Instant Payouts</p>
                                        <p className="text-sm text-text-muted">Funds available within minutes</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-success">
                                        <Zap className="w-4 h-4" />
                                        <span className="text-sm font-medium">Enabled</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Not Connected State */}
                            <div className="p-4 sm:p-6 rounded-xl bg-bg-elevated border border-border-subtle text-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-accent-gold/10 flex items-center justify-center">
                                    <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-accent-gold" />
                                </div>
                                <h3 className="font-serif text-base sm:text-lg font-semibold text-text-primary mb-2">
                                    Connect Your Bank Account
                                </h3>
                                <p className="text-text-secondary text-xs sm:text-sm mb-4 sm:mb-6 max-w-sm mx-auto">
                                    Link your bank account to receive payouts directly.
                                    Powered by Stripe for secure, instant transfers.
                                </p>
                                <Button onClick={handleConnect} isLoading={isConnecting} className="w-full sm:w-auto">
                                    <ExternalLink className="w-4 h-4" />
                                    Connect with Stripe
                                </Button>
                            </div>

                            {/* Security Note */}
                            <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-accent-gold/5 border border-accent-gold/20">
                                <Shield className="w-5 h-5 text-accent-gold shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-text-primary">
                                        Bank-Level Security
                                    </p>
                                    <p className="text-xs text-text-muted mt-1">
                                        We never store your banking credentials.
                                        Stripe handles all sensitive data with
                                        PCI-compliant encryption.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-error/20">
                <CardHeader>
                    <CardTitle className="text-error">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-xl bg-error/5 border border-error/20 gap-3 sm:gap-0">
                        <div>
                            <p className="font-medium text-text-primary">Delete Account</p>
                            <p className="text-sm text-text-muted">
                                Permanently delete your account and all data
                            </p>
                        </div>
                        <Button variant="outline" className="border-error text-error hover:bg-error/10 w-full sm:w-auto">
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Log Out */}
            <div className="flex justify-center pt-4 sm:pt-6">
                <Button
                    variant="ghost"
                    className="text-text-muted hover:text-error hover:bg-error/5 gap-2 cursor-pointer"
                    onClick={handleSignOut}
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </Button>
            </div>

            {/* Success Toast */}
            {
                showToast && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
                        <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
                            <span className="text-lg">✅</span>
                            <span className="text-sm font-medium">{toastMessage}</span>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
