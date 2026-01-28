"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    emoji: string;
    label: string;
    value: string | number;
    subtext?: string;
    variant?: "gold" | "fire" | "trophy" | "success";
    animate?: boolean;
}

export function StatCard({
    emoji,
    label,
    value,
    subtext,
    variant = "gold",
    animate = true,
}: StatCardProps) {
    const [displayValue, setDisplayValue] = useState(animate ? 0 : value);
    const numericValue = typeof value === "number" ? value : parseFloat(value.replace(/[^0-9.-]/g, ""));

    useEffect(() => {
        if (!animate || typeof value !== "number") {
            setDisplayValue(value);
            return;
        }

        const duration = 1500;
        const steps = 30;
        const stepValue = numericValue / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += stepValue;
            if (current >= numericValue) {
                setDisplayValue(numericValue);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [animate, numericValue, value]);

    const variantStyles = {
        gold: "from-accent-gold/20 to-accent-gold/5 border-accent-gold/30",
        fire: "from-orange-500/20 to-red-500/5 border-orange-500/30",
        trophy: "from-yellow-500/20 to-amber-500/5 border-yellow-500/30",
        success: "from-green-500/20 to-emerald-500/5 border-green-500/30",
    };

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border p-3 sm:p-4 lg:p-6",
                "bg-gradient-to-br",
                variantStyles[variant],
                "transition-all duration-300 hover:scale-[1.02]"
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-text-secondary font-medium">{label}</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary font-mono">
                        {typeof displayValue === "number"
                            ? displayValue.toLocaleString()
                            : displayValue}
                    </p>
                    {subtext && (
                        <p className="text-xs text-text-muted">{subtext}</p>
                    )}
                </div>
                <span className="text-2xl sm:text-4xl lg:text-5xl">{emoji}</span>
            </div>
        </div>
    );
}
