import { getBlockedDates, getBookedDates } from "@/lib/actions/availability";
import { AvailabilityPageClient } from "./client";

export default async function TalentAvailabilityPage() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const [blockedDates, bookedDates] = await Promise.all([
        getBlockedDates(year, month),
        getBookedDates(year, month),
    ]);

    return (
        <AvailabilityPageClient
            initialBlockedDates={blockedDates}
            initialBookedDates={bookedDates}
            initialYear={year}
            initialMonth={month}
        />
    );
}
