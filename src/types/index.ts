/* ============================================
   ShiftSync Type Definitions
   ============================================ */

// User Roles
export type UserRole = "business" | "talent";

// Shift Status
export type ShiftStatus =
    | "draft"
    | "open"
    | "filled"
    | "in_progress"
    | "completed"
    | "cancelled";

// Assignment Status
export type AssignmentStatus =
    | "invited"
    | "pending"
    | "accepted"
    | "declined"
    | "completed"
    | "no_show";

// Role Types for Workers
export type RoleType =
    | "bartender"
    | "server"
    | "host"
    | "valet"
    | "security"
    | "coat_check"
    | "sommelier";

// Payout Status
export type PayoutStatus =
    | "pending"
    | "processing"
    | "completed"
    | "failed";

// Rating Type
export type RatingType =
    | "business_to_talent"
    | "talent_to_business";

/* ============================================
   Database Entities
   ============================================ */

export interface User {
    id: string;
    email: string;
    role: UserRole;
    created_at: string;
}

export interface BusinessProfile {
    id: string;
    user_id: string;
    company_name: string;
    logo_url?: string;
    brand_colors?: {
        primary: string;
        secondary?: string;
    };
    billing_email?: string;
    stripe_account_id?: string;
    onboarding_complete: boolean;
    created_at: string;
}

export interface TalentProfile {
    id: string;
    user_id: string;
    full_name: string;
    bio?: string;
    skills: string[];
    photo_urls: string[];
    phone?: string;
    hourly_rate_min?: number;
    available_now: boolean;
    rating_avg: number;
    total_shifts: number;
    pending_balance: number;
    available_balance: number;
    created_at: string;
}

export interface Shift {
    id: string;
    business_id: string;
    title: string;
    description?: string;
    event_date: string;
    start_time: string;
    end_time: string;
    venue_name: string;
    venue_address?: string;
    role_type: RoleType;
    workers_needed: number;
    workers_confirmed: number;
    hourly_rate: number;
    attire_code?: string;
    status: ShiftStatus;
    created_at: string;
    // Joined fields
    business?: BusinessProfile;
    assignments?: ShiftAssignment[];
}

export interface ShiftAssignment {
    id: string;
    shift_id: string;
    talent_id: string;
    status: AssignmentStatus;
    invited_at: string;
    responded_at?: string;
    // Joined fields
    talent?: TalentProfile;
    shift?: Shift;
    time_entry?: TimeEntry;
}

export interface TimeEntry {
    id: string;
    assignment_id: string;
    clock_in?: string;
    clock_out?: string;
    hours_worked?: number;
    amount_earned?: number;
    approved: boolean;
}

export interface AvailabilityBlock {
    id: string;
    talent_id: string;
    blocked_date: string;
    start_time?: string;
    end_time?: string;
    reason?: string;
}

export interface SkillTag {
    id: string;
    talent_id: string;
    skill_name: string;
    years_experience?: number;
}

export interface Rating {
    id: string;
    assignment_id: string;
    rater_id: string;
    score: number;
    comment?: string;
    type: RatingType;
    created_at: string;
}

export interface Payout {
    id: string;
    talent_id: string;
    amount: number;
    status: PayoutStatus;
    stripe_payout_id?: string;
    created_at: string;
}

/* ============================================
   UI/Component Types
   ============================================ */

export interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
}

export interface StatCard {
    label: string;
    value: string | number;
    change?: {
        value: number;
        trend: "up" | "down";
    };
    icon?: React.ComponentType<{ className?: string }>;
}

/* ============================================
   API/Form Types
   ============================================ */

export interface ParsedShiftData {
    title?: string;
    description?: string;
    role_type: RoleType;
    workers_needed: number;
    event_date: string;
    start_time: string;
    end_time: string;
    venue_name?: string;
    hourly_rate: number;
    attire_code?: string;
}

export interface CreateShiftInput {
    title: string;
    description?: string;
    event_date: string;
    start_time: string;
    end_time: string;
    venue_name: string;
    venue_address?: string;
    role_type: RoleType;
    workers_needed: number;
    hourly_rate: number;
    attire_code?: string;
}

export interface SignUpInput {
    email: string;
    password: string;
    role: UserRole;
}

export interface BusinessOnboardingInput {
    company_name: string;
    logo_url?: string;
    brand_color_primary?: string;
    billing_email?: string;
}

export interface TalentOnboardingInput {
    full_name: string;
    bio?: string;
    skills: string[];
    phone?: string;
    hourly_rate_min?: number;
}
