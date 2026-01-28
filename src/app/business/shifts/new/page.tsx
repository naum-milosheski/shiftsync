"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Shirt,
  CheckCircle2,
  Sparkles,
  Wand2,
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Link from "next/link";

const ROLE_TYPES = [
  { value: "bartender", label: "Bartender" },
  { value: "server", label: "Server" },
  { value: "host", label: "Host" },
  { value: "sommelier", label: "Sommelier" },
  { value: "valet", label: "Valet" },
  { value: "security", label: "Security" },
  { value: "coat_check", label: "Coat Check" },
];

export default function NewShiftPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdShiftId, setCreatedShiftId] = useState<string | null>(null);

  // Smart-Parse state
  const [showQuickCreate, setShowQuickCreate] = useState(true);
  const [quickDescription, setQuickDescription] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseConfidence, setParseConfidence] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    venueName: "",
    venueAddress: "",
    roleType: "server",
    workersNeeded: "1",
    hourlyRate: "",
    attireCode: "",
  });
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Smart-Parse: Extract fields from natural language
  const handleSmartParse = async () => {
    if (!quickDescription.trim()) return;

    setIsParsing(true);
    setParseConfidence(null);

    try {
      const response = await fetch("/api/smart-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: quickDescription }),
      });

      const data = await response.json();

      if (data.success && data.parsed) {
        const p = data.parsed;

        // Auto-fill form fields
        setFormData((prev) => ({
          ...prev,
          title: p.title || prev.title,
          description: p.description || prev.description,
          eventDate: p.event_date || prev.eventDate,
          startTime: p.start_time || prev.startTime,
          endTime: p.end_time || prev.endTime,
          venueName: p.venue_name || prev.venueName,
          venueAddress: p.venue_address || prev.venueAddress,
          roleType: p.role_type || prev.roleType,
          workersNeeded: p.workers_needed?.toString() || prev.workersNeeded,
          hourlyRate: p.hourly_rate?.toString() || prev.hourlyRate,
          attireCode: p.attire_code || prev.attireCode,
        }));

        setParseConfidence(data.confidence);
        setShowQuickCreate(false); // Collapse after successful parse
      }
    } catch (error) {
      console.error("Smart-Parse error:", error);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async (publish: boolean = false) => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Get business profile
      const { data: profile } = await supabase
        .from("business_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        router.push("/onboarding/business");
        return;
      }

      const { data: shift, error } = await supabase
        .from("shifts")
        .insert({
          business_id: profile.id,
          title: formData.title,
          description: formData.description || null,
          event_date: formData.eventDate,
          start_time: formData.startTime,
          end_time: formData.endTime,
          venue_name: formData.venueName,
          venue_address: formData.venueAddress || null,
          role_type: formData.roleType,
          workers_needed: parseInt(formData.workersNeeded),
          hourly_rate: parseFloat(formData.hourlyRate),
          attire_code: formData.attireCode || null,
          status: publish ? "open" : "draft",
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating shift:", error);
        return;
      }

      setCreatedShiftId(shift.id);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center animate-scale-in">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-text-primary mb-2">
              Shift Created!
            </h2>
            <p className="text-text-secondary mb-6">
              Your shift has been created successfully.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/business/shifts">
                <Button variant="outline">View All Shifts</Button>
              </Link>
              <Link href={`/business/shifts/${createdShiftId}`}>
                <Button>
                  <Users className="w-4 h-4" />
                  Find Talent
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isStep1Valid = formData.title && formData.eventDate && formData.startTime && formData.endTime;
  const isStep2Valid = formData.venueName && formData.roleType && formData.workersNeeded && formData.hourlyRate;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/business/shifts"
          className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shifts
        </Link>
        <h1 className="font-serif text-3xl font-bold text-text-primary">
          Post a New Shift
        </h1>
        <p className="text-text-secondary mt-1">
          Create a shift and we&apos;ll help you find the perfect talent
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-colors ${s <= step ? "bg-accent-gold" : "bg-border-subtle"
              }`}
          />
        ))}
      </div>

      {/* Quick Create with AI */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowQuickCreate(!showQuickCreate)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-accent-gold/10 to-accent-gold/5 border border-accent-gold/20 hover:border-accent-gold/40 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-accent-gold" />
            </div>
            <div className="text-left">
              <p className="font-medium text-text-primary">Quick Create with AI</p>
              <p className="text-sm text-text-muted">Describe your shift in plain English</p>
            </div>
          </div>
          {showQuickCreate ? (
            <ChevronUp className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors" />
          )}
        </button>

        {showQuickCreate && (
          <div className="mt-4 p-4 rounded-xl bg-bg-card border border-border-subtle animate-fade-in">
            <textarea
              value={quickDescription}
              onChange={(e) => setQuickDescription(e.target.value)}
              placeholder="e.g., I need 3 bartenders for a wedding at The Plaza Hotel next Saturday from 6pm to midnight. $50/hr, black tie attire..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-bg-elevated border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/50 focus:border-accent-gold resize-none text-sm"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                {parseConfidence !== null && (
                  <span className="px-2 py-1 rounded-full bg-success/10 text-success">
                    {parseConfidence}% fields extracted
                  </span>
                )}
              </div>
              <Button
                onClick={handleSmartParse}
                disabled={!quickDescription.trim() || isParsing}
                size="sm"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Parse with AI
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Event Details"}
            {step === 2 && "Staffing Requirements"}
            {step === 3 && "Review & Post"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "When and where is your event?"}
            {step === 2 && "What kind of staff do you need?"}
            {step === 3 && "Review your shift details before posting"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Step 1: Event Details */}
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="Shift Title"
                placeholder="e.g., Annual Charity Gala - Server Staff"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="date"
                  label="Event Date"
                  value={formData.eventDate}
                  onChange={(e) => updateField("eventDate", e.target.value)}
                  required
                />
                <Input
                  type="time"
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(e) => updateField("startTime", e.target.value)}
                  required
                />
                <Input
                  type="time"
                  label="End Time"
                  value={formData.endTime}
                  onChange={(e) => updateField("endTime", e.target.value)}
                  required
                />
              </div>

              <Textarea
                label="Description"
                placeholder="Describe the event, expectations, and any special requirements..."
                rows={4}
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
              />

              <div className="flex justify-end pt-4">
                <Button onClick={() => setStep(2)} disabled={!isStep1Valid}>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Staffing Requirements */}
          {step === 2 && (
            <div className="space-y-4">
              <Input
                label="Venue Name"
                placeholder="e.g., The Metropolitan Club"
                value={formData.venueName}
                onChange={(e) => updateField("venueName", e.target.value)}
                required
              />

              <Input
                label="Venue Address"
                placeholder="Full address (optional for privacy)"
                value={formData.venueAddress}
                onChange={(e) => updateField("venueAddress", e.target.value)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Role Type"
                  value={formData.roleType}
                  onChange={(e) => updateField("roleType", e.target.value)}
                  options={ROLE_TYPES}
                  required
                />
                <Input
                  type="number"
                  label="Workers Needed"
                  placeholder="1"
                  min="1"
                  value={formData.workersNeeded}
                  onChange={(e) => updateField("workersNeeded", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Hourly Rate ($)"
                  placeholder="45.00"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => updateField("hourlyRate", e.target.value)}
                  required
                />
                <Input
                  label="Attire Code"
                  placeholder="e.g., Black tuxedo, white gloves"
                  value={formData.attireCode}
                  onChange={(e) => updateField("attireCode", e.target.value)}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!isStep2Valid}>
                  Review
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-bg-elevated border border-border-subtle">
                <h3 className="font-serif text-lg font-semibold text-text-primary mb-4">
                  {formData.title}
                </h3>

                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-3 text-text-secondary">
                    <Calendar className="w-4 h-4 text-accent-gold" />
                    <span>{new Date(formData.eventDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-text-secondary">
                    <Clock className="w-4 h-4 text-accent-gold" />
                    <span>{formData.startTime} - {formData.endTime}</span>
                  </div>
                  <div className="flex items-center gap-3 text-text-secondary">
                    <MapPin className="w-4 h-4 text-accent-gold" />
                    <span>{formData.venueName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-text-secondary">
                    <Users className="w-4 h-4 text-accent-gold" />
                    <span>{formData.workersNeeded} {ROLE_TYPES.find(r => r.value === formData.roleType)?.label}(s)</span>
                  </div>
                  <div className="flex items-center gap-3 text-text-secondary">
                    <DollarSign className="w-4 h-4 text-accent-gold" />
                    <span>${formData.hourlyRate}/hour</span>
                  </div>
                  {formData.attireCode && (
                    <div className="flex items-center gap-3 text-text-secondary">
                      <Shirt className="w-4 h-4 text-accent-gold" />
                      <span>{formData.attireCode}</span>
                    </div>
                  )}
                </div>

                {formData.description && (
                  <div className="mt-4 pt-4 border-t border-border-subtle">
                    <p className="text-sm text-text-secondary">{formData.description}</p>
                  </div>
                )}
              </div>

              {/* AI Matching Hint */}
              <div className="p-4 rounded-xl bg-accent-gold/5 border border-accent-gold/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-accent-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-primary mb-1">
                      AI-Powered Talent Matching
                    </p>
                    <p className="text-xs text-text-secondary">
                      Once published, our AI will automatically find and invite qualified talent based on skills, ratings, and availability.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit(false)}
                    isLoading={isLoading}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    onClick={() => handleSubmit(true)}
                    isLoading={isLoading}
                  >
                    Publish & Find Talent
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
