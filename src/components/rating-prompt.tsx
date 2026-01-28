"use client";

import { useState, useTransition } from "react";
import { Star, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitRating, dismissRating, type PendingRating } from "@/lib/actions/ratings";

interface RatingPromptProps {
    rating: PendingRating;
    onClose: () => void;
}

export function RatingPrompt({ rating, onClose }: RatingPromptProps) {
    const [selectedScore, setSelectedScore] = useState<number>(0);
    const [hoveredScore, setHoveredScore] = useState<number>(0);
    const [comment, setComment] = useState("");
    const [isPending, startTransition] = useTransition();
    const [isSuccess, setIsSuccess] = useState(false);

    const displayScore = hoveredScore || selectedScore;

    const handleSubmit = () => {
        if (selectedScore === 0) return;

        startTransition(async () => {
            const result = await submitRating({
                assignmentId: rating.assignmentId,
                score: selectedScore,
                comment: comment.trim() || undefined,
                type: rating.ratingType,
            });

            if (result.success) {
                setIsSuccess(true);
                setTimeout(onClose, 1500);
            }
        });
    };

    const handleDismiss = () => {
        startTransition(async () => {
            await dismissRating(rating.assignmentId);
            onClose();
        });
    };

    const ratingLabels: Record<number, string> = {
        1: "Poor",
        2: "Fair",
        3: "Good",
        4: "Very Good",
        5: "Excellent",
    };

    const isTalentRating = rating.ratingType === "business_to_talent";
    const title = isTalentRating ? "Rate your worker" : "Rate this business";
    const subtitle = isTalentRating
        ? "How was your experience working with this talent?"
        : "How was your experience with this client?";

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-bg-card border border-border-subtle rounded-2xl p-8 max-w-md w-full mx-4 text-center animate-scale-in">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-text-primary mb-2">
                        Thank you for your feedback!
                    </h3>
                    <p className="text-text-muted text-sm">
                        Your rating helps maintain quality on the platform.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 max-w-md w-full mx-4 animate-scale-in">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="font-serif text-xl font-semibold text-text-primary">
                            {title}
                        </h3>
                        <p className="text-text-muted text-sm mt-1">{subtitle}</p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-2 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Target Info */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-elevated mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-gold/20 to-accent-gold/5 flex items-center justify-center overflow-hidden">
                        {rating.targetPhoto ? (
                            <img
                                src={rating.targetPhoto}
                                alt={rating.targetName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xl font-serif font-bold text-accent-gold">
                                {rating.targetName.charAt(0)}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-text-primary">{rating.targetName}</p>
                        <p className="text-sm text-text-muted">
                            {rating.shiftTitle} •{" "}
                            {new Date(rating.shiftDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                </div>

                {/* Star Rating */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((score) => (
                            <button
                                key={score}
                                onClick={() => setSelectedScore(score)}
                                onMouseEnter={() => setHoveredScore(score)}
                                onMouseLeave={() => setHoveredScore(0)}
                                className="p-1 transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-10 h-10 transition-colors ${score <= displayScore
                                            ? "fill-accent-gold text-accent-gold"
                                            : "text-border-subtle"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-sm font-medium text-text-secondary h-5">
                        {displayScore > 0 ? ratingLabels[displayScore] : "Select a rating"}
                    </p>
                </div>

                {/* Comment */}
                <div className="mb-6">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience (optional)"
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg bg-bg-elevated border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/50 focus:border-accent-gold resize-none text-sm"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleDismiss}
                        disabled={isPending}
                        className="flex-1"
                    >
                        Skip
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={selectedScore === 0 || isPending}
                        className="flex-1"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Rating"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
