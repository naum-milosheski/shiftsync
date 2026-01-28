/**
 * Fix Demo User IDs Script
 * 
 * Updates the public.users table to link demo users to their auth.users IDs
 * Run with: npx tsx scripts/fix-demo-users.ts
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

async function fixDemoUsers() {
    console.log('🔧 Fixing Demo User IDs...\n');

    // Get auth user IDs for demo users
    const { data: authUsers } = await supabase.auth.admin.listUsers();

    const demoBusinessAuth = authUsers?.users.find(u => u.email === 'demo.business@shiftsync.com');
    const demoTalentAuth = authUsers?.users.find(u => u.email === 'demo.talent@shiftsync.com');

    if (!demoBusinessAuth) {
        console.error('❌ demo.business@shiftsync.com not found in auth.users');
        return;
    }
    if (!demoTalentAuth) {
        console.error('❌ demo.talent@shiftsync.com not found in auth.users');
        return;
    }

    console.log(`Found Business auth ID: ${demoBusinessAuth.id}`);
    console.log(`Found Talent auth ID: ${demoTalentAuth.id}`);

    // Check if public.users entries exist
    const { data: existingBusiness } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'demo.business@shiftsync.com')
        .single();

    const { data: existingTalent } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'demo.talent@shiftsync.com')
        .single();

    // Fix Business Demo User
    if (existingBusiness && existingBusiness.id !== demoBusinessAuth.id) {
        console.log(`\n📧 Fixing demo.business@shiftsync.com...`);
        console.log(`   Current ID: ${existingBusiness.id}`);
        console.log(`   Should be:  ${demoBusinessAuth.id}`);

        // Delete the old entry
        await supabase.from('business_profiles').delete().eq('user_id', existingBusiness.id);
        await supabase.from('users').delete().eq('id', existingBusiness.id);

        // Create new entry with correct ID
        const { error: insertError } = await supabase.from('users').insert({
            id: demoBusinessAuth.id,
            email: 'demo.business@shiftsync.com',
            role: 'business',
            created_at: new Date().toISOString()
        });

        if (insertError) {
            console.error(`   ❌ Failed: ${insertError.message}`);
        } else {
            console.log(`   ✅ public.users entry fixed`);

            // Create business profile
            const { error: profileError } = await supabase.from('business_profiles').insert({
                user_id: demoBusinessAuth.id,
                company_name: 'Demo Events Co.',
                onboarding_complete: true,
                billing_email: 'demo.business@shiftsync.com'
            });

            if (profileError) {
                console.error(`   ❌ Profile failed: ${profileError.message}`);
            } else {
                console.log(`   ✅ business_profile created`);
            }
        }
    } else if (!existingBusiness) {
        console.log(`\n📧 Creating demo.business@shiftsync.com entry...`);
        const { error } = await supabase.from('users').insert({
            id: demoBusinessAuth.id,
            email: 'demo.business@shiftsync.com',
            role: 'business',
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error(`   ❌ Failed: ${error.message}`);
        } else {
            console.log(`   ✅ public.users entry created`);

            const { error: profileError } = await supabase.from('business_profiles').insert({
                user_id: demoBusinessAuth.id,
                company_name: 'Demo Events Co.',
                onboarding_complete: true,
                billing_email: 'demo.business@shiftsync.com'
            });

            if (profileError && !profileError.message.includes('duplicate')) {
                console.error(`   ❌ Profile failed: ${profileError.message}`);
            } else {
                console.log(`   ✅ business_profile created`);
            }
        }
    } else {
        console.log(`\n✅ demo.business@shiftsync.com already has correct ID`);
    }

    // Fix Talent Demo User (similar logic)
    if (existingTalent && existingTalent.id !== demoTalentAuth.id) {
        console.log(`\n📧 Fixing demo.talent@shiftsync.com...`);
        await supabase.from('talent_profiles').delete().eq('user_id', existingTalent.id);
        await supabase.from('users').delete().eq('id', existingTalent.id);

        await supabase.from('users').insert({
            id: demoTalentAuth.id,
            email: 'demo.talent@shiftsync.com',
            role: 'talent',
            created_at: new Date().toISOString()
        });

        await supabase.from('talent_profiles').insert({
            user_id: demoTalentAuth.id,
            full_name: 'Demo Talent',
            skills: ['Bartender', 'Server', 'Host'],
            bio: 'Demo account for testing the ShiftSync talent experience.',
            hourly_rate_min: 35.00,
            available_now: true
        });

        console.log(`   ✅ Fixed`);
    } else {
        console.log(`\n✅ demo.talent@shiftsync.com already correct`);
    }

    console.log('\n🎉 Demo Users Fixed! Try logging in again.');
}

fixDemoUsers().catch(console.error);
