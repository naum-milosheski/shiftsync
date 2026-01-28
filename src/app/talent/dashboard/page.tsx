import { getActiveShift, getAvailableShifts } from "@/lib/actions/talent";
import { getEarningsSummary } from "@/lib/actions/earnings";
import { getPendingRatings } from "@/lib/actions/ratings";
import { TalentDashboardClient } from "./client";

export default async function TalentDashboardPage() {
    const [activeShift, availableShifts, earnings, pendingRatings] = await Promise.all([
        getActiveShift(),
        getAvailableShifts(),
        getEarningsSummary(),
        getPendingRatings(),
    ]);

    return (
        <TalentDashboardClient
            activeShift={activeShift}
            availableShifts={availableShifts}
            earnings={earnings}
            pendingRating={pendingRatings[0] || null}
        />
    );
}
