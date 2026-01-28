import { getAvailableShifts, getMyShifts } from "@/lib/actions/talent";
import { ShiftsPageClient } from "./client";

export default async function TalentShiftsPage() {
    const [availableShifts, myShifts] = await Promise.all([
        getAvailableShifts(),
        getMyShifts("all"),
    ]);

    // Separate into upcoming and past
    const today = new Date().toISOString().split("T")[0];
    const upcomingShifts = myShifts.filter((s) => s.event_date >= today);
    const pastShifts = myShifts.filter((s) => s.event_date < today);

    return (
        <ShiftsPageClient
            availableShifts={availableShifts}
            upcomingShifts={upcomingShifts}
            pastShifts={pastShifts}
        />
    );
}
