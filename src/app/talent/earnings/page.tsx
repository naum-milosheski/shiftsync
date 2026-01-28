import { getEarningsSummary, getRecentTransactions } from "@/lib/actions/earnings";
import { EarningsPageClient } from "./client";

export default async function TalentEarningsPage() {
    const [earnings, transactions] = await Promise.all([
        getEarningsSummary(),
        getRecentTransactions(10),
    ]);

    return (
        <EarningsPageClient
            earnings={earnings}
            transactions={transactions}
        />
    );
}
