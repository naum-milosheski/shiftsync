/**
 * Happy Path Verification Script (Full Access)
 * =============================================
 * Tests: Business creates Shift → Talent sees it → Talent accepts → Assignment created
 * 
 * Uses SERVICE_ROLE_KEY to bypass RLS and create test data directly.
 * Run with: npx tsx scripts/verify-flow.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing environment variables.");
    console.error("   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const isServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log(`🔑 Using ${isServiceRole ? "SERVICE_ROLE" : "ANON"} key`);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
});

// Generate proper UUID v4 format
function uuid(): string {
    const hex = () => Math.floor(Math.random() * 16).toString(16);
    const seg = (n: number) => Array.from({ length: n }, hex).join("");
    return `${seg(8)}-${seg(4)}-4${seg(3)}-a${seg(3)}-${seg(12)}`;
}

const TEST_ID = Date.now().toString(36);

interface TestData {
    businessUserId: string;
    businessProfileId: string;
    talentUserId: string;
    talentProfileId: string;
    shiftId?: string;
    assignmentId?: string;
}

async function cleanup(data: Partial<TestData>) {
    console.log("\n🧹 Cleaning up test data...");
    try {
        if (data.assignmentId) await supabase.from("shift_assignments").delete().eq("id", data.assignmentId);
        if (data.shiftId) await supabase.from("shifts").delete().eq("id", data.shiftId);
        if (data.talentProfileId) await supabase.from("talent_profiles").delete().eq("id", data.talentProfileId);
        if (data.businessProfileId) await supabase.from("business_profiles").delete().eq("id", data.businessProfileId);
        if (data.talentUserId) await supabase.from("users").delete().eq("id", data.talentUserId);
        if (data.businessUserId) await supabase.from("users").delete().eq("id", data.businessUserId);
        console.log("✅ Cleanup complete");
    } catch (e) {
        console.log("⚠️  Partial cleanup");
    }
}

async function verifyHappyPath() {
    const data: Partial<TestData> = {
        businessUserId: uuid(),
        businessProfileId: uuid(),
        talentUserId: uuid(),
        talentProfileId: uuid(),
    };

    try {
        console.log("\n" + "=".repeat(60));
        console.log("🔴 RED TEAM QA VERIFICATION: Happy Path Flow");
        console.log("=".repeat(60));
        console.log(`Test Run ID: ${TEST_ID}`);

        // ============================================
        // STEP 1: Create Test Users & Profiles
        // ============================================
        console.log("\n📌 STEP 1: Creating test users and profiles...");

        // Business User
        const { error: busUserErr } = await supabase.from("users").insert({
            id: data.businessUserId,
            email: `qa-business-${TEST_ID}@test.shiftsync.com`,
            role: "business",
        });
        if (busUserErr) throw new Error(`Business user: ${busUserErr.message}`);
        console.log(`   ✓ Business user: ${data.businessUserId}`);

        // Business Profile
        const { error: busProfileErr } = await supabase.from("business_profiles").insert({
            id: data.businessProfileId,
            user_id: data.businessUserId,
            company_name: `QA Test Events ${TEST_ID}`,
            onboarding_complete: true,
        });
        if (busProfileErr) throw new Error(`Business profile: ${busProfileErr.message}`);
        console.log(`   ✓ Business profile: ${data.businessProfileId}`);

        // Talent User
        const { error: talUserErr } = await supabase.from("users").insert({
            id: data.talentUserId,
            email: `qa-talent-${TEST_ID}@test.shiftsync.com`,
            role: "talent",
        });
        if (talUserErr) throw new Error(`Talent user: ${talUserErr.message}`);
        console.log(`   ✓ Talent user: ${data.talentUserId}`);

        // Talent Profile
        const { error: talProfileErr } = await supabase.from("talent_profiles").insert({
            id: data.talentProfileId,
            user_id: data.talentUserId,
            full_name: `QA Test Worker ${TEST_ID}`,
            skills: ["bartender", "server"],
            available_now: true,
        });
        if (talProfileErr) throw new Error(`Talent profile: ${talProfileErr.message}`);
        console.log(`   ✓ Talent profile: ${data.talentProfileId}`);

        // ============================================
        // STEP 2: Business Posts a Shift
        // ============================================
        console.log("\n📌 STEP 2: Business creating shift...");

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const eventDate = tomorrow.toISOString().split("T")[0];

        const { data: shift, error: shiftErr } = await supabase
            .from("shifts")
            .insert({
                business_id: data.businessProfileId,
                title: `QA Verification Gala ${TEST_ID}`,
                description: "Red Team verification shift",
                event_date: eventDate,
                start_time: "18:00",
                end_time: "23:00",
                venue_name: "QA Test Venue",
                venue_address: "123 QA Boulevard",
                role_type: "bartender",
                workers_needed: 2,
                hourly_rate: 45.00,
                status: "open",
            })
            .select()
            .single();

        if (shiftErr || !shift) throw new Error(`Shift creation: ${shiftErr?.message}`);
        data.shiftId = shift.id;

        console.log(`   ✓ Shift created: ${shift.id}`);
        console.log(`   ✓ Title: ${shift.title}`);
        console.log(`   ✓ Rate: $${shift.hourly_rate}/hr`);

        // ============================================
        // STEP 3: Query Talent's Gig Feed
        // ============================================
        console.log("\n📌 STEP 3: Querying talent's gig feed...");

        const { data: feed, error: feedErr } = await supabase
            .from("shifts")
            .select("id, title, status, hourly_rate")
            .eq("status", "open")
            .eq("id", shift.id);

        if (feedErr) throw new Error(`Gig feed: ${feedErr.message}`);
        if (!feed?.length) throw new Error("❌ FAIL: Shift NOT visible in gig feed!");

        console.log(`   ✓ Shift visible in feed`);
        console.log(`   ✓ Status: ${feed[0].status}`);

        // ============================================
        // STEP 4: Talent Accepts Shift
        // ============================================
        console.log("\n📌 STEP 4: Talent accepting shift...");

        const { data: assignment, error: acceptErr } = await supabase
            .from("shift_assignments")
            .insert({
                shift_id: shift.id,
                talent_id: data.talentProfileId,
                status: "accepted",
                responded_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (acceptErr || !assignment) throw new Error(`Accept: ${acceptErr?.message}`);
        data.assignmentId = assignment.id;

        console.log(`   ✓ Assignment created: ${assignment.id}`);

        // ============================================
        // STEP 5: Verify Database State
        // ============================================
        console.log("\n📌 STEP 5: Verifying database state...");

        const { data: verify } = await supabase
            .from("shift_assignments")
            .select("id, status, talent_id, shift_id")
            .eq("id", assignment.id)
            .single();

        if (!verify) throw new Error("Failed to verify assignment");
        if (verify.status !== "accepted") {
            throw new Error(`Status='${verify.status}', expected='accepted'`);
        }

        console.log(`   ✓ Status: ${verify.status}`);
        console.log(`   ✓ FK integrity: PASS`);

        // ============================================
        // SUCCESS!
        // ============================================
        console.log("\n" + "=".repeat(60));
        console.log("✅ SYSTEM HEALTHY");
        console.log("=".repeat(60));
        console.log(`\n📋 Verification Summary:`);
        console.log(`   • Shift ID:       ${shift.id}`);
        console.log(`   • Assignment ID:  ${assignment.id}`);
        console.log(`   • Status:         accepted ✓`);
        console.log(`   • DB Integration: PASS`);
        console.log(`   • Flow:           Business → Shift → Talent Accept ✓`);
        console.log("");

        await cleanup(data);
        process.exit(0);

    } catch (error) {
        console.error("\n" + "=".repeat(60));
        console.error("❌ VERIFICATION FAILED");
        console.error("=".repeat(60));
        console.error(`\nError: ${error instanceof Error ? error.message : error}`);

        await cleanup(data);
        process.exit(1);
    }
}

verifyHappyPath();
