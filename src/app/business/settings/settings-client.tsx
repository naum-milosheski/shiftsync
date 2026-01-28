"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Building2,
    Mail,
    Save,
    LogOut,
    CheckCircle2,
    AlertCircle,
    Phone,
    Upload,
    User,
} from "lucide-react";

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

interface SettingsClientProps {
    profile: BusinessProfile | null;
    userData: UserData | null;
}

export default function SettingsClient({ profile, userData }: SettingsClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [companyName, setCompanyName] = useState(profile?.company_name || "");
    const [billingEmail, setBillingEmail] = useState(profile?.billing_email || "");
    const [phone, setPhone] = useState(""); // UI only
    const [logoPreview, setLogoPreview] = useState<string | null>(profile?.logo_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // For demo: Create local preview URL
            const previewUrl = URL.createObjectURL(file);
            setLogoPreview(previewUrl);
        }
    };

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleSave = async () => {
        if (!profile) return;

        setIsLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from("business_profiles")
                .update({
                    company_name: companyName,
                    billing_email: billingEmail,
                })
                .eq("id", profile.id);

            if (updateError) {
                setError(updateError.message);
                return;
            }

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            router.refresh();
        } catch {
            setError("Failed to save changes. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        setIsSigningOut(true);
        await supabase.auth.signOut();
        router.push("/");
    };

    const hasChanges =
        companyName !== (profile?.company_name || "") ||
        billingEmail !== (profile?.billing_email || "");

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in py-6 sm:py-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
                    Settings
                </h1>
                <p className="text-text-secondary mt-2">
                    Manage your business profile and preferences
                </p>
            </div>

            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-50 animate-slide-in">
                    <Card className="border-success/20 bg-bg-elevated shadow-xl">
                        <CardContent className="py-3 px-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-success" />
                            </div>
                            <p className="text-sm font-medium text-text-primary">Changes saved successfully</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Error Alert */}
            {error && (
                <Card className="border-error/20 bg-error/5">
                    <CardContent className="py-3 px-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-error shrink-0" />
                        <p className="text-sm text-error">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Main Settings Card */}
            <Card>
                <CardContent className="p-5 sm:p-8 space-y-6 sm:space-y-8">
                    {/* Logo Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <div
                            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-bg-elevated border-2 border-dashed border-border-subtle flex items-center justify-center overflow-hidden group cursor-pointer hover:border-accent-gold transition-colors"
                            onClick={handleLogoClick}
                        >
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-8 h-8 text-text-muted" />
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs cursor-pointer"
                            onClick={handleLogoClick}
                        >
                            Upload Logo
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="Company Name"
                            placeholder="Enter your company name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />

                        <div className="grid sm:grid-cols-2 gap-4">
                            <Input
                                label="Phone Number"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                icon={<Phone className="w-4 h-4 text-text-muted" />}
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="billing@company.com"
                                value={billingEmail}
                                onChange={(e) => setBillingEmail(e.target.value)}
                                icon={<Mail className="w-4 h-4 text-text-muted" />}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border-subtle flex justify-end">
                        <Button
                            onClick={handleSave}
                            isLoading={isLoading}
                            disabled={!hasChanges && !phone && !logoPreview}
                            className="w-full sm:w-auto cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Account Actions */}
            <div className="flex justify-center">
                <Button
                    variant="ghost"
                    className="text-text-muted hover:text-error hover:bg-error/5 transition-colors cursor-pointer"
                    onClick={handleSignOut}
                    isLoading={isSigningOut}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
