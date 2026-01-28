import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Process Payouts API
 * Simulates completing pending payouts (Stripe Connect simulation)
 * 
 * In production: Would call Stripe Connect API
 * For demo: Auto-completes payouts after a short delay
 */
export async function POST(request: Request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    );

    try {
        // Find pending payouts older than 5 minutes (simulated processing time)
        const processingTime = 5 * 60 * 1000; // 5 minutes for demo
        const cutoffTime = new Date(Date.now() - processingTime);

        const { data: pendingPayouts, error: fetchError } = await supabase
            .from("payouts")
            .select("id, amount, talent_id, created_at")
            .eq("status", "pending")
            .lt("created_at", cutoffTime.toISOString());

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        let processed = 0;

        for (const payout of pendingPayouts || []) {
            // Simulate Stripe payout processing
            const simulatedStripeId = `po_sim_${payout.id.slice(0, 8)}`;

            // Update payout to completed
            const { error: updateError } = await supabase
                .from("payouts")
                .update({
                    status: "completed",
                    stripe_payout_id: simulatedStripeId,
                })
                .eq("id", payout.id);

            if (!updateError) {
                processed++;
            }
        }

        return NextResponse.json({
            success: true,
            processed,
            message: `Completed ${processed} payouts`,
        });

    } catch (error) {
        console.error("Process payouts error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
