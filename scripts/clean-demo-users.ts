/**
 * Clean Demo User Fix Script
 * 
 * Completely removes and recreates demo users with correct IDs
 * Run with: npx tsx scripts/clean-demo-users.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function cleanDemoUsers() {
    console.log('🧹 Cleaning Demo Users...\n');

    // Get auth user IDs
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const demoBusinessAuth = authUsers?.users.find(u => u.email === 'demo.business@shiftsync.com');
    const demoTalentAuth = authUsers?.users.find(u => u.email === 'demo.talent@shiftsync.com');

    if (!demoBusinessAuth || !demoTalentAuth) {
        console.error('❌ Auth users not found. Run seed-demo-users.ts first.');
        return;
    }

    console.log(`Business Auth ID: ${demoBusinessAuth.id}`);
    console.log(`Talent Auth ID: ${demoTalentAuth.id}\n`);

    // --- Clean Business Demo ---
    console.log('📧 Cleaning demo.business@shiftsync.com...');

    // Delete by email (not by ID) to catch mismatched entries
    await supabase.from('business_profiles').delete().match({ billing_email: 'demo.business@shiftsync.com' });
    await supabase.from('business_profiles').delete().eq('user_id', demoBusinessAuth.id);

    // Delete from users table by email
    const { error: deleteError1 } = await supabase.from('users').delete().eq('email', 'demo.business@shiftsync.com');
    console.log(`   Deleted old users entries: ${deleteError1 ? deleteError1.message : '✓'}`);

    // Also try deleting by the auth ID in case there's a conflict
    await supabase.from('users').delete().eq('id', demoBusinessAuth.id);

    // Now insert fresh
    const { error: insertError } = await supabase.from('users').insert({
        id: demoBusinessAuth.id,
        email: 'demo.business@shiftsync.com',
        role: 'business',
        created_at: new Date().toISOString()
    });

    if (insertError) {
        console.log(`   ❌ Insert failed: ${insertError.message}`);
    } else {
        console.log(`   ✅ public.users entry created`);

        // Create profile
        const { error: profileError } = await supabase.from('business_profiles').insert({
            user_id: demoBusinessAuth.id,
            company_name: 'Demo Events Co.',
            onboarding_complete: true,
            billing_email: 'demo.business@shiftsync.com'
        });
        console.log(`   ${profileError ? '❌ Profile: ' + profileError.message : '✅ business_profile created'}`);
    }

    // --- Clean Talent Demo ---
    console.log('\n📧 Cleaning demo.talent@shiftsync.com...');

    await supabase.from('talent_profiles').delete().eq('user_id', demoTalentAuth.id);
    const { error: deleteError2 } = await supabase.from('users').delete().eq('email', 'demo.talent@shiftsync.com');
    console.log(`   Deleted old entries: ${deleteError2 ? deleteError2.message : '✓'}`);

    await supabase.from('users').delete().eq('id', demoTalentAuth.id);

    const { error: insertError2 } = await supabase.from('users').insert({
        id: demoTalentAuth.id,
        email: 'demo.talent@shiftsync.com',
        role: 'talent',
        created_at: new Date().toISOString()
    });

    if (insertError2) {
        console.log(`   ❌ Insert failed: ${insertError2.message}`);
    } else {
        console.log(`   ✅ public.users entry created`);

        const { error: profileError } = await supabase.from('talent_profiles').insert({
            user_id: demoTalentAuth.id,
            full_name: 'Demo Talent',
            skills: ['Bartender', 'Server', 'Host'],
            bio: 'Demo account for testing ShiftSync.',
            hourly_rate_min: 35.00,
            available_now: true,
            rating_avg: 4.85,
            total_shifts: 12,
            pending_balance: 0,
            available_balance: 450.00
        });
        console.log(`   ${profileError ? '❌ Profile: ' + profileError.message : '✅ talent_profile created'}`);
    }

    console.log('\n🎉 Done! Demo users should work now.');
}

cleanDemoUsers().catch(console.error);
