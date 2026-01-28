"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Star,
    Briefcase,
    DollarSign,
    X,
    CheckCircle,
    Clock,
    Award,
    Send,
    MessageSquare,
} from "lucide-react";

interface TalentProfile {
    id: string;
    user_id: string;
    full_name: string;
    bio: string | null;
    skills: string[];
    photo_urls: string[] | null;
    rating_avg: number;
    total_shifts: number;
    hourly_rate_min: number;
    available_now: boolean;
}

interface TeamClientProps {
    talent: TalentProfile[];
    workedWithCount: number;
}

// Generate professional avatar URL using DiceBear
function getAvatarUrl(name: string): string {
    const seed = name.toLowerCase().replace(/\s+/g, "");
    return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=c9a962,f4a261,e76f51,2a9d8f,264653`;
}

export default function TeamClient({ talent, workedWithCount }: TeamClientProps) {
    const [selectedTalent, setSelectedTalent] = useState<TalentProfile | null>(null);
    const [filter, setFilter] = useState<"all" | "available">("all");
    const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const handleInvite = (member: TalentProfile) => {
        setInvitedIds(prev => new Set(prev).add(member.id));
        setToastMessage(`Invitation sent to ${member.full_name} for upcoming events.`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const router = useRouter();

    const handleMessage = (member: TalentProfile) => {
        // Close the modal and navigate to messages with worker context
        setSelectedTalent(null);
        const params = new URLSearchParams({
            talentId: member.id,
            talentName: member.full_name,
            talentRole: member.skills[0] || "Event Staff",
        });
        router.push(`/business/messages?${params.toString()}`);
    };

    const filteredTalent = filter === "available"
        ? talent.filter(t => t.available_now)
        : talent;

    return (
        <>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-xl sm:text-3xl font-bold text-text-primary">
                            Your Team
                        </h1>
                        <p className="text-sm sm:text-base text-text-secondary mt-1">
                            {workedWithCount > 0
                                ? `${workedWithCount} talent you've worked with • ${talent.length} total in roster`
                                : "Top-rated talent ready for your next event"
                            }
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex w-full sm:w-auto gap-2 p-1 bg-bg-elevated rounded-xl border border-border-subtle">
                        <button
                            onClick={() => setFilter("all")}
                            className={`flex-1 sm:flex-none justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${filter === "all"
                                ? "bg-accent-gold text-bg-primary"
                                : "text-text-secondary hover:text-text-primary"
                                }`}
                        >
                            All Talent
                        </button>
                        <button
                            onClick={() => setFilter("available")}
                            className={`flex-1 sm:flex-none justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${filter === "available"
                                ? "bg-accent-gold text-bg-primary"
                                : "text-text-secondary hover:text-text-primary"
                                }`}
                        >
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-success animate-pulse" />
                            Available Now
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <Card>
                        <CardContent className="p-4 sm:p-5">
                            <p className="text-xl sm:text-2xl font-bold text-text-primary">{talent.length}</p>
                            <p className="text-xs sm:text-sm text-text-muted">Total Talent</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 sm:p-5">
                            <p className="text-xl sm:text-2xl font-bold text-success">
                                {talent.filter(t => t.available_now).length}
                            </p>
                            <p className="text-xs sm:text-sm text-text-muted">Available Now</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent-gold fill-accent-gold" />
                                <span className="text-xl sm:text-2xl font-bold text-text-primary">
                                    {(talent.reduce((acc, t) => acc + t.rating_avg, 0) / talent.length || 0).toFixed(1)}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-text-muted">Avg Rating</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 sm:p-5">
                            <p className="text-xl sm:text-2xl font-bold text-accent-gold">{workedWithCount}</p>
                            <p className="text-xs sm:text-sm text-text-muted">Worked With</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Talent Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {filteredTalent.map((member) => (
                        <Card
                            key={member.id}
                            variant="interactive"
                            className="cursor-pointer hover:border-accent-gold/30 group"
                            onClick={() => setSelectedTalent(member)}
                        >
                            <CardContent className="pt-6 pb-6">
                                <div className="text-center">
                                    {/* Avatar */}
                                    <div className="relative w-20 h-20 mx-auto mb-4">
                                        <Image
                                            src={member.photo_urls?.[0] || getAvatarUrl(member.full_name)}
                                            alt={member.full_name}
                                            fill
                                            className="rounded-full object-cover ring-2 ring-border-subtle group-hover:ring-accent-gold/50 transition-all"
                                        />
                                        {member.available_now && (
                                            <span className="absolute bottom-0 right-0 w-5 h-5 bg-success rounded-full border-2 border-bg-secondary" />
                                        )}
                                    </div>

                                    {/* Name & Role */}
                                    <h3 className="font-serif font-semibold text-text-primary mb-1">
                                        {member.full_name}
                                    </h3>
                                    <p className="text-sm text-text-muted mb-3">
                                        {member.skills[0] || "Event Staff"}
                                    </p>

                                    {/* Rating & Shifts */}
                                    <div className="flex items-center justify-center gap-4 mb-4">
                                        <div className="flex items-center gap-1 text-sm">
                                            <Star className="w-4 h-4 text-accent-gold fill-accent-gold" />
                                            <span className="text-text-primary font-medium">
                                                {member.rating_avg.toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-text-muted">
                                            <Briefcase className="w-4 h-4" />
                                            <span>{member.total_shifts} shifts</span>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {member.skills.slice(0, 2).map((skill) => (
                                            <Badge key={skill} variant="neutral" className="text-xs">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {member.skills.length > 2 && (
                                            <Badge variant="neutral" className="text-xs">
                                                +{member.skills.length - 2}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredTalent.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-text-muted">No talent available with current filter.</p>
                        </CardContent>
                    </Card>
                )}

                {/* Profile Modal */}
                {selectedTalent && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                        onClick={() => setSelectedTalent(null)}
                    >
                        <Card
                            className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <CardContent className="pt-6">
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedTalent(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-bg-elevated transition-colors"
                                >
                                    <X className="w-5 h-5 text-text-muted" />
                                </button>

                                {/* Header */}
                                <div className="text-center mb-6">
                                    <div className="relative w-24 h-24 mx-auto mb-4">
                                        <Image
                                            src={selectedTalent.photo_urls?.[0] || getAvatarUrl(selectedTalent.full_name)}
                                            alt={selectedTalent.full_name}
                                            fill
                                            className="rounded-full object-cover ring-4 ring-accent-gold/20"
                                        />
                                        {selectedTalent.available_now && (
                                            <span className="absolute bottom-0 right-0 w-6 h-6 bg-success rounded-full border-2 border-bg-secondary flex items-center justify-center">
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="font-serif text-2xl font-bold text-text-primary">
                                        {selectedTalent.full_name}
                                    </h2>
                                    <p className="text-text-secondary">
                                        {selectedTalent.skills[0] || "Event Staff"}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="text-center p-3 rounded-xl bg-bg-elevated">
                                        <div className="flex items-center justify-center gap-1 text-accent-gold mb-1">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="font-bold">{selectedTalent.rating_avg.toFixed(1)}</span>
                                        </div>
                                        <p className="text-xs text-text-muted">Rating</p>
                                    </div>
                                    <div className="text-center p-3 rounded-xl bg-bg-elevated">
                                        <div className="flex items-center justify-center gap-1 text-text-primary mb-1">
                                            <Briefcase className="w-4 h-4" />
                                            <span className="font-bold">{selectedTalent.total_shifts}</span>
                                        </div>
                                        <p className="text-xs text-text-muted">Shifts</p>
                                    </div>
                                    <div className="text-center p-3 rounded-xl bg-bg-elevated">
                                        <div className="flex items-center justify-center gap-1 text-success mb-1">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="font-bold">${selectedTalent.hourly_rate_min}</span>
                                        </div>
                                        <p className="text-xs text-text-muted">/hour</p>
                                    </div>
                                </div>

                                {/* Bio */}
                                {selectedTalent.bio && (
                                    <div className="mb-6">
                                        <h3 className="font-medium text-text-primary mb-2">About</h3>
                                        <p className="text-text-secondary text-sm leading-relaxed">
                                            {selectedTalent.bio}
                                        </p>
                                    </div>
                                )}

                                {/* Skills */}
                                <div className="mb-6">
                                    <h3 className="font-medium text-text-primary mb-2">Skills & Expertise</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTalent.skills.map((skill) => (
                                            <Badge key={skill} variant="gold" className="text-sm">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Achievements */}
                                <div className="mb-6 p-4 rounded-xl bg-accent-gold/5 border border-accent-gold/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="w-5 h-5 text-accent-gold" />
                                        <h3 className="font-medium text-text-primary">Achievements</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTalent.rating_avg >= 4.9 && (
                                            <Badge variant="gold" className="text-xs">⭐ Top Rated</Badge>
                                        )}
                                        {selectedTalent.total_shifts >= 50 && (
                                            <Badge variant="gold" className="text-xs">🏆 Veteran</Badge>
                                        )}
                                        {selectedTalent.total_shifts >= 25 && selectedTalent.total_shifts < 50 && (
                                            <Badge variant="gold" className="text-xs">✨ Experienced</Badge>
                                        )}
                                        {selectedTalent.available_now && (
                                            <Badge variant="success" className="text-xs">
                                                <Clock className="w-3 h-3 mr-1" /> Available Now
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 cursor-pointer"
                                        onClick={() => handleInvite(selectedTalent)}
                                        disabled={invitedIds.has(selectedTalent.id)}
                                        variant={invitedIds.has(selectedTalent.id) ? "outline" : "gold"}
                                    >
                                        {invitedIds.has(selectedTalent.id) ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Invited
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                Invite to Shift
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="cursor-pointer"
                                        onClick={() => handleMessage(selectedTalent)}
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Message
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            {
                showToast && (
                    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
                        <div className="flex items-center gap-3 px-4 py-3 bg-success text-white rounded-xl shadow-lg">
                            <Send className="w-4 h-4" />
                            <span className="text-sm font-medium">{toastMessage}</span>
                        </div>
                    </div>
                )
            }
        </>
    );
}
