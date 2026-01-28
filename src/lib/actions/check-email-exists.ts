'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Check if an email already exists in the public.users table.
 * Used to prevent duplicate signups.
 */
export async function checkEmailExists(email: string): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

    if (error && error.code !== 'PGRST116') {
        // PGRST116 = "JSON object requested, multiple (or no) rows returned"
        // This means no user found, which is expected for new signups
        console.error('Error checking email:', error);
    }

    return !!data;
}
