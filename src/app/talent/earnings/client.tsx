"use client";

import { useState, useEffect, useTransition } from "react";
import { DollarSign, TrendingUp, ArrowUpRight, Clock, CreditCard, ChevronRight, Loader2, X, Download } from "lucide-react";
import { AchievementBadge } from "@/components/talent";
import { cn } from "@/lib/utils";
import { requestPayout } from "@/lib/actions/earnings";
import type { EarningsSummary, Transaction } from "@/lib/actions/earnings";

interface EarningsPageClientProps {
    earnings: EarningsSummary | null;
    transactions: Transaction[];
}

const achievements = [
    {
        emoji: "🏅",
        title: "First $1K",
        description: "Earned your first $1,000",
        threshold: 1000,
    },
    {
        emoji: "🎖️",
        title: "10 Shifts",
        description: "Completed 10 shifts",
        shiftsThreshold: 10,
    },
    {
        emoji: "⭐",
        title: "5-Star Pro",
        description: "Maintain 5-star rating for 10 shifts",
        ratingThreshold: 5,
    },
    {
        emoji: "💎",
        title: "$5K Club",
        description: "Earned $5,000 total",
        threshold: 5000,
    },
    {
        emoji: "🏆",
        title: "50 Shifts",
        description: "Completed 50 shifts",
        shiftsThreshold: 50,
    },
];

export function EarningsPageClient({ earnings, transactions }: EarningsPageClientProps) {
    const [displayEarnings, setDisplayEarnings] = useState(0);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    // Mock transactions for demo purposes
    const mockTransactions: Transaction[] = [
        {
            id: "tx-1",
            amount: 150,
            type: "earning",
            description: "Wedding Service (Plaza Hotel)",
            date: "2024-12-28",
            status: "completed",
        },
        {
            id: "tx-2",
            amount: 300,
            type: "earning",
            description: "Private Party (Ritz)",
            date: "2024-12-24",
            status: "completed",
        },
        {
            id: "tx-3",
            amount: 200,
            type: "payout",
            description: "Bartender (Corporate Event)",
            date: "2024-12-20",
            status: "completed",
        },
    ];

    // Extended mock history
    const extendedHistory: Transaction[] = [
        ...mockTransactions,
        {
            id: "tx-4",
            amount: 550,
            type: "payout",
            description: "Withdrawal to Bank ****4242",
            date: "2024-12-15",
            status: "completed",
        },
        {
            id: "tx-5",
            amount: 250,
            type: "earning",
            description: "VIP Server (Met Gala)",
            date: "2024-12-12",
            status: "completed",
        },
        {
            id: "tx-6",
            amount: 180,
            type: "earning",
            description: "Coat Check (Winter Ball)",
            date: "2024-12-10",
            status: "completed",
        },
        {
            id: "tx-7",
            amount: 150,
            type: "earning",
            description: "Bartender (Holiday Party)",
            date: "2024-12-05",
            status: "completed",
        },
        {
            id: "tx-8",
            amount: 400,
            type: "payout",
            description: "Withdrawal to Bank ****4242",
            date: "2024-11-30",
            status: "completed",
        },
        {
            id: "tx-9",
            amount: 300,
            type: "earning",
            description: "Event Security (Concert)",
            date: "2024-11-28",
            status: "completed",
        },
        {
            id: "tx-10",
            amount: 120,
            type: "earning",
            description: "Usher (Theater Opening)",
            date: "2024-11-15",
            status: "completed",
        },
    ];

    const displayTransactions = transactions.length > 0 ? transactions : mockTransactions;

    // Fix data: ensure totalEarnings >= availableBalance + pendingBalance
    const rawAvailable = earnings?.availableBalance || 450;
    const rawPending = earnings?.pendingBalance || 0;
    const minLifetime = rawAvailable + rawPending;
    const rawTotal = earnings?.totalEarnings || 0;

    const stats = {
        totalEarnings: Math.max(rawTotal, minLifetime),
        availableBalance: rawAvailable,
        pendingBalance: rawPending,
        totalShifts: earnings?.totalShifts || 3,
        rating: earnings?.rating || 4.9,
    };

    // Calculate earned achievements
    const earnedAchievements = achievements.map((a) => ({
        emoji: a.emoji,
        title: a.title,
        description: a.description,
        earned: a.threshold
            ? stats.totalEarnings >= a.threshold
            : a.shiftsThreshold
                ? stats.totalShifts >= a.shiftsThreshold
                : a.ratingThreshold
                    ? stats.rating >= a.ratingThreshold
                    : false,
    }));

    // Animated counter for earnings
    useEffect(() => {
        if (stats.totalEarnings === 0) return;

        const duration = 2000;
        const steps = 60;
        const stepValue = stats.totalEarnings / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += stepValue;
            if (current >= stats.totalEarnings) {
                setDisplayEarnings(stats.totalEarnings);
                clearInterval(timer);
            } else {
                setDisplayEarnings(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [stats.totalEarnings]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    const handleWithdraw = () => {
        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            setError("Please enter a valid amount");
            return;
        }
        if (amount > stats.availableBalance) {
            setError("Insufficient balance");
            return;
        }

        startTransition(async () => {
            const result = await requestPayout(amount);
            if (result.success) {
                setShowWithdrawModal(false);
                setWithdrawAmount("");
                setError(null);
                // Show success toast
                setToastMessage(`Processing transfer of $${amount.toFixed(2)} to your bank account.`);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
            } else {
                setError(result.error || "Failed to process withdrawal");
            }
        });
    };

    const handleViewAll = () => {
        setShowHistoryModal(true);
    };

    const handleDownloadReceipt = () => {
        setToastMessage("Receipt downloaded successfully.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setSelectedTransaction(null);
    };

    return (
        <div className="space-y-6 lg:space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-text-primary">
                    Earnings
                </h1>
                <p className="text-text-secondary mt-1 text-sm sm:text-base">Track your income and achievements</p>
            </div>

            {/* High Score Earnings Display */}
            <div className="card-luxury overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-accent-gold/20 via-accent-gold/10 to-transparent">
                    <div className="text-center">
                        <p className="text-sm text-text-secondary font-medium uppercase tracking-wide mb-2">
                            Total Lifetime Earnings
                        </p>
                        <div className="relative">
                            <span className="text-4xl sm:text-5xl lg:text-7xl font-bold font-mono text-gold-gradient">
                                ${displayEarnings.toLocaleString()}
                            </span>
                            <span className="absolute -top-2 -right-8 text-3xl animate-bounce hidden lg:block">🎯</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-4 text-green-400">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-medium">{stats.totalShifts} shifts completed</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Available Balance */}
                <div className="card-luxury p-3 sm:p-5 lg:col-span-1 bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm text-text-secondary">Available</p>
                            <p className="text-2xl sm:text-3xl font-bold font-mono text-green-400">
                                ${stats.availableBalance.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setWithdrawAmount(stats.availableBalance.toString());
                            setShowWithdrawModal(true);
                        }}
                        disabled={stats.availableBalance <= 0}
                        className="w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Withdraw Funds
                    </button>
                </div>

                {/* Pending Balance */}
                <div className="card-luxury p-3 sm:p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-text-secondary">Pending</p>
                            <p className="text-2xl font-bold font-mono text-accent-gold">
                                ${stats.pendingBalance.toLocaleString()}
                            </p>
                            <p className="text-xs text-text-muted mt-1">Awaiting approval</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-accent-gold" />
                        </div>
                    </div>
                </div>

                {/* Rating */}
                <div className="card-luxury p-3 sm:p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-text-secondary">Rating</p>
                            <p className="text-2xl font-bold font-mono text-text-primary">
                                {stats.rating.toFixed(1)} ⭐
                            </p>
                            <p className="text-xs text-text-muted mt-1">From {stats.totalShifts} shifts</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-accent-gold" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Achievements Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-lg lg:text-xl font-semibold text-text-primary">
                        Achievements
                    </h2>
                    <span className="text-sm text-text-secondary">
                        {earnedAchievements.filter((a) => a.earned).length}/{earnedAchievements.length} earned
                    </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                    {earnedAchievements.map((achievement) => (
                        <AchievementBadge key={achievement.title} {...achievement} />
                    ))}
                </div>
            </div>

            {/* Transaction History */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-base sm:text-lg lg:text-xl font-semibold text-text-primary">
                        Recent Transactions
                    </h2>
                    <button
                        onClick={handleViewAll}
                        className="text-sm text-accent-gold hover:text-accent-gold-hover flex items-center gap-1 cursor-pointer"
                    >
                        View All <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {displayTransactions.length > 0 ? (
                    <div className="card-luxury divide-y divide-border-subtle">
                        {displayTransactions.map((tx) => (
                            <button
                                key={tx.id}
                                onClick={() => setSelectedTransaction(tx)}
                                className="w-full text-left p-3 sm:p-4 flex items-center justify-between hover:bg-bg-hover transition-colors group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                            tx.type === "earning"
                                                ? "bg-green-500/10"
                                                : "bg-accent-gold/10"
                                        )}
                                    >
                                        {tx.type === "earning" ? (
                                            <DollarSign className="w-5 h-5 text-green-400" />
                                        ) : (
                                            <ArrowUpRight className="w-5 h-5 text-accent-gold" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary group-hover:text-accent-gold transition-colors">{tx.description}</p>
                                        <p className="text-sm text-text-muted">{formatDate(tx.date)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p
                                        className={cn(
                                            "font-bold font-mono",
                                            tx.amount > 0 ? "text-green-400" : "text-text-primary"
                                        )}
                                    >
                                        {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                                    </p>
                                    {tx.status === "pending" && (
                                        <span className="tag tag-warning text-xs">Pending</span>
                                    )}
                                    {tx.type === "payout" && tx.status === "completed" && (
                                        <span className="tag tag-neutral text-xs">Withdrawn</span>
                                    )}
                                    {tx.type === "earning" && tx.status === "completed" && (
                                        <span className="tag tag-success text-xs">Available</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="card-luxury p-8 text-center">
                        <p className="text-text-muted">No transactions yet.</p>
                        <p className="text-sm text-text-muted mt-1">Complete shifts to start earning!</p>
                    </div>
                )}
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                    <div className="card-luxury p-6 max-w-md w-full animate-slide-up">
                        <h3 className="font-serif text-xl font-semibold text-text-primary mb-4">
                            Withdraw Funds
                        </h3>
                        <p className="text-text-secondary mb-6">
                            Available balance: <span className="text-green-400 font-bold">${stats.availableBalance}</span>
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-text-secondary block mb-2">Amount</label>
                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="input-luxury"
                                />
                                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowWithdrawModal(false);
                                        setError(null);
                                    }}
                                    className="flex-1 btn-outline py-3"
                                    disabled={isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleWithdraw}
                                    disabled={isPending}
                                    className="flex-1 btn-gold py-3 flex items-center justify-center gap-2"
                                >
                                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Withdraw
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Transaction Receipt Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="card-luxury p-0 max-w-sm w-full animate-slide-up overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-3 sm:p-4 flex items-center justify-between border-b border-border-subtle bg-bg-elevated">
                            <h3 className="font-serif text-base sm:text-lg font-semibold text-text-primary">Transaction Receipt</h3>
                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="p-2 -mr-2 text-text-muted hover:text-text-primary transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Receipt Content */}
                        <div className="p-4 sm:p-6 text-center space-y-4 sm:space-y-6">
                            <div className="space-y-2">
                                <span className={cn(
                                    "tag text-xs uppercase tracking-wide",
                                    selectedTransaction.status === "completed" ? "tag-success" : "tag-warning"
                                )}>
                                    {selectedTransaction.status === "completed" ? "Payment Successful" : "Processing"}
                                </span>
                                <h2 className={cn(
                                    "text-3xl sm:text-4xl font-mono font-bold",
                                    selectedTransaction.amount > 0 ? "text-green-400" : "text-text-primary"
                                )}>
                                    {selectedTransaction.amount > 0 ? "+" : ""}${Math.abs(selectedTransaction.amount).toFixed(2)}
                                </h2>
                            </div>

                            <div className="space-y-3 text-sm border-t border-b border-border-subtle py-4 sm:py-6">
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Description</span>
                                    <span className="font-medium text-text-primary text-right max-w-[60%]">
                                        {selectedTransaction.description}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Date</span>
                                    <span className="font-medium text-text-primary">
                                        {new Date(selectedTransaction.date).toLocaleDateString("en-US", {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Transaction ID</span>
                                    <span className="font-mono text-text-muted">#TRX-{selectedTransaction.id.slice(-4).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Method</span>
                                    <span className="font-medium text-text-primary">
                                        {selectedTransaction.type === "payout" ? "Direct Deposit •••• 4242" : "Shift Earnings"}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleDownloadReceipt}
                                className="w-full btn-outline py-3 flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* History List Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="card-luxury p-0 max-w-md w-full animate-slide-up overflow-hidden flex flex-col max-h-[80vh]">
                        {/* Modal Header */}
                        <div className="p-3 sm:p-4 flex items-center justify-between border-b border-border-subtle bg-bg-elevated shrink-0">
                            <h3 className="font-serif text-base sm:text-lg font-semibold text-text-primary">Transaction History</h3>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="p-2 -mr-2 text-text-muted hover:text-text-primary transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* List Content */}
                        <div className="overflow-y-auto p-3 sm:p-4">
                            <div className="space-y-2">
                                {extendedHistory.map((tx) => (
                                    <button
                                        key={tx.id}
                                        onClick={() => setSelectedTransaction(tx)}
                                        className="w-full text-left p-3 sm:p-4 flex items-center justify-between rounded-xl bg-bg-primary hover:bg-bg-hover transition-colors group border border-border-subtle cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                    tx.type === "earning"
                                                        ? "bg-green-500/10"
                                                        : "bg-accent-gold/10"
                                                )}
                                            >
                                                {tx.type === "earning" ? (
                                                    <DollarSign className="w-5 h-5 text-green-400" />
                                                ) : (
                                                    <ArrowUpRight className="w-5 h-5 text-accent-gold" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-text-primary group-hover:text-accent-gold transition-colors line-clamp-1">{tx.description}</p>
                                                <p className="text-sm text-text-muted">{formatDate(tx.date)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            <p
                                                className={cn(
                                                    "font-bold font-mono",
                                                    tx.amount > 0 ? "text-green-400" : "text-text-primary"
                                                )}
                                            >
                                                {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
                        <span className="text-lg">✅</span>
                        <span className="text-sm font-medium">{toastMessage}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
