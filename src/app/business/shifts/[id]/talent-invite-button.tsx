"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Send, Check } from "lucide-react";

interface TalentInviteButtonProps {
    shiftId: string;
    talentId: string;
}

export function TalentInviteButton({ shiftId, talentId }: TalentInviteButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isInvited, setIsInvited] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleInvite = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.from("shift_assignments").insert({
                shift_id: shiftId,
                talent_id: talentId,
                status: "invited",
            });

            if (!error) {
                setIsInvited(true);
            }
        } catch (e) {
            console.error("Failed to invite:", e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isInvited) {
        return (
            <Button variant="ghost" size="sm" disabled>
                <Check className="w-4 h-4 text-success" />
                Invited
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleInvite}
            isLoading={isLoading}
        >
            <Send className="w-3 h-3" />
            Invite
        </Button>
    );
}
