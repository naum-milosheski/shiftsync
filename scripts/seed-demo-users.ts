/**
 * Demo User Seed Script
 * 
 * Creates demo users in Supabase auth.users table with password authentication.
 * Run with: npx tsx scripts/seed-demo-users.ts
 * 
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✓' : '✗');
    process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

interface DemoUser {
    email: string;
    password: string;
    role: 'business' | 'talent';
    profileData: {
        companyName?: string;
        fullName?: string;
        skills?: string[];
        bio?: string;
    };
}

const demoUsers: DemoUser[] = [
    {
        email: 'demo.business@shiftsync.com',
        password: 'demo123',
        role: 'business',
        profileData: {
            companyName: 'Demo Events Co.',
        }
    },
    {
        email: 'demo.talent@shiftsync.com',
        password: 'demo123',
        role: 'talent',
        profileData: {
            fullName: 'Demo Talent',
            skills: ['Bartender', 'Server', 'Host'],
            bio: 'Demo account for testing the ShiftSync talent experience.',
        }
    }
];

async function seedDemoUsers() {
    console.log('🌱 Starting Demo User Seed...\n');

    for (const user of demoUsers) {
        console.log(`📧 Processing: ${user.email}`);

        // Check if user already exists in auth.users
        const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
        const existingAuthUser = existingAuthUsers?.users.find(u => u.email === user.email);

        let authUserId: string;

        if (existingAuthUser) {
            console.log(`   ⚠️  Auth user already exists, updating password...`);
            authUserId = existingAuthUser.id;

            // Update password for existing user
            const { error: updateError } = await supabase.auth.admin.updateUserById(authUserId, {
                password: user.password
            });

            if (updateError) {
                console.error(`   ❌ Failed to update password:`, updateError.message);
                continue;
            }
            console.log(`   ✅ Password updated`);
        } else {
            // Create new auth user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true, // Auto-confirm email
                user_metadata: {
                    role: user.role
                }
            });

            if (authError) {
                console.error(`   ❌ Failed to create auth user:`, authError.message);
                continue;
            }

            authUserId = authData.user.id;
            console.log(`   ✅ Auth user created: ${authUserId}`);
        }

        // Check if user exists in public.users
        const { data: existingPublicUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single();

        if (!existingPublicUser) {
            // Insert into public.users
            const { error: userError } = await supabase
                .from('users')
                .insert({
                    id: authUserId,
                    email: user.email,
                    role: user.role,
                    created_at: new Date().toISOString()
                });

            if (userError) {
                console.error(`   ❌ Failed to create public.users entry:`, userError.message);
                continue;
            }
            console.log(`   ✅ public.users entry created`);
        } else {
            console.log(`   ⚠️  public.users entry already exists`);
        }

        // Create profile based on role
        if (user.role === 'business') {
            const { data: existingProfile } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', authUserId)
                .single();

            if (!existingProfile) {
                const { error: profileError } = await supabase
                    .from('business_profiles')
                    .insert({
                        user_id: authUserId,
                        company_name: user.profileData.companyName,
                        onboarding_complete: true,
                        billing_email: user.email
                    });

                if (profileError) {
                    console.error(`   ❌ Failed to create business_profile:`, profileError.message);
                } else {
                    console.log(`   ✅ business_profile created`);
                }
            } else {
                console.log(`   ⚠️  business_profile already exists`);
            }
        } else {
            const { data: existingProfile } = await supabase
                .from('talent_profiles')
                .select('id')
                .eq('user_id', authUserId)
                .single();

            if (!existingProfile) {
                const { error: profileError } = await supabase
                    .from('talent_profiles')
                    .insert({
                        user_id: authUserId,
                        full_name: user.profileData.fullName,
                        skills: user.profileData.skills,
                        bio: user.profileData.bio,
                        hourly_rate_min: 35.00,
                        available_now: true,
                        rating_avg: 4.85,
                        total_shifts: 12,
                        pending_balance: 0,
                        available_balance: 450.00
                    });

                if (profileError) {
                    console.error(`   ❌ Failed to create talent_profile:`, profileError.message);
                } else {
                    console.log(`   ✅ talent_profile created`);
                }
            } else {
                console.log(`   ⚠️  talent_profile already exists`);
            }
        }

        console.log('');
    }

    console.log('🎉 Demo User Seed Complete!\n');
    console.log('Demo Credentials:');
    console.log('─────────────────────────────────────');
    console.log('Business: demo.business@shiftsync.com / demo123');
    console.log('Talent:   demo.talent@shiftsync.com / demo123');
    console.log('─────────────────────────────────────');
}

seedDemoUsers().catch(console.error);
