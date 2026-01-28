"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Send,
    Search,
    ArrowLeft,
    CheckCheck,
    MoreHorizontal,
    Building2,
} from "lucide-react";

interface Message {
    id: string;
    content: string;
    timestamp: Date;
    isOwn: boolean;
    read: boolean;
}

interface Conversation {
    id: string;
    businessName: string;
    businessType: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
    messages: Message[];
}

// Demo conversations from the Talent perspective
const demoConversations: Conversation[] = [
    {
        id: "1",
        businessName: "Sterling Events",
        businessType: "Event Planning",
        lastMessage: "We'd love your signature menu! The client specifically requested your craft cocktails.",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 20), // 20 min ago
        unreadCount: 1,
        messages: [
            { id: "1a", content: "Hi! We have a corporate gala this Friday at The Grand Ballroom. Are you available from 6 PM to midnight?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), isOwn: false, read: true },
            { id: "1b", content: "Good afternoon! Yes, I'm available. Is this the tech company event you mentioned last week?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), isOwn: true, read: true },
            { id: "1c", content: "That's the one! We're expecting around 200 guests. We'll need you on the main cocktail bar.", timestamp: new Date(Date.now() - 1000 * 60 * 60), isOwn: false, read: true },
            { id: "1d", content: "Sounds excellent. Should I prepare my signature cocktail menu or will you be providing recipes?", timestamp: new Date(Date.now() - 1000 * 60 * 30), isOwn: true, read: true },
            { id: "1e", content: "We'd love your signature menu! The client specifically requested your craft cocktails.", timestamp: new Date(Date.now() - 1000 * 60 * 20), isOwn: false, read: false },
        ],
    },
    {
        id: "2",
        businessName: "Luxe Catering Co.",
        businessType: "Catering",
        lastMessage: "Premium Bordeaux and Burgundy selections. Client is a collector.",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3.5), // 3.5 hours ago
        unreadCount: 0,
        messages: [
            { id: "2a", content: "We need a sommelier for a private wine tasting next Tuesday. Interested?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), isOwn: false, read: true },
            { id: "2b", content: "Absolutely! What's the wine selection?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), isOwn: true, read: true },
            { id: "2c", content: "Premium Bordeaux and Burgundy selections. Client is a collector.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5), isOwn: false, read: true },
        ],
    },
    {
        id: "3",
        businessName: "Apex Hospitality Group",
        businessType: "Hotels & Venues",
        lastMessage: "Your performance at last night's event was exceptional. The client specifically thanked us!",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 25), // 25 hours ago
        unreadCount: 1,
        messages: [
            { id: "3a", content: "Your performance at last night's event was exceptional. The client specifically thanked us!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25), isOwn: false, read: false },
        ],
    },
    {
        id: "4",
        businessName: "Midnight Mixology",
        businessType: "Bar Services",
        lastMessage: "I can bring my Japanese whisky collection for the tasting portion.",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        unreadCount: 0,
        messages: [
            { id: "4a", content: "We have a Japanese-themed corporate reception. Your expertise would be perfect!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50), isOwn: false, read: true },
            { id: "4b", content: "That sounds wonderful! What's the headcount and venue?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 49), isOwn: true, read: true },
            { id: "4c", content: "150 guests at the Skyline Terrace. We want sake service and Japanese-inspired cocktails.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48.5), isOwn: false, read: true },
            { id: "4d", content: "I can bring my Japanese whisky collection for the tasting portion.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), isOwn: true, read: true },
        ],
    },
];

function formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString();
}

function formatMessageTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MessagesPageContent() {
    const [conversations, setConversations] = useState(demoConversations);
    const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showToast, setShowToast] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const [hasHandledHandoff] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (selectedConvo) {
            scrollToBottom();
        }
    }, [selectedConvo?.messages.length, selectedConvo]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConvo) return;

        const message: Message = {
            id: `msg-${Date.now()}`,
            content: newMessage,
            timestamp: new Date(),
            isOwn: true,
            read: false,
        };

        setConversations(prev => prev.map(c =>
            c.id === selectedConvo.id
                ? { ...c, messages: [...c.messages, message], lastMessage: newMessage, lastMessageTime: new Date() }
                : c
        ));

        setSelectedConvo(prev => prev ? { ...prev, messages: [...prev.messages, message], lastMessage: newMessage, lastMessageTime: new Date() } : null);
        setNewMessage("");

        // Show toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const filteredConversations = conversations.filter(c =>
        c.businessName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

    return (
        <div className="mt-12 h-[calc(100vh-180px-48px)] lg:h-[calc(100vh-140px-48px)] animate-fade-in">
            <div className="flex h-full rounded-xl border border-border-subtle overflow-hidden bg-bg-secondary">
                {/* Sidebar - Conversation List */}
                <div className={`${selectedConvo ? 'hidden lg:flex' : 'flex'} w-full lg:w-96 flex-col border-r border-border-subtle bg-bg-primary`}>
                    {/* Sidebar Header */}
                    <div className="p-3 sm:p-4 border-b border-border-subtle">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="font-serif text-lg sm:text-xl font-bold text-text-primary">
                                Messages
                            </h1>
                            {totalUnread > 0 && (
                                <span className="px-2 py-1 text-xs font-semibold bg-accent-gold text-bg-primary rounded-full">
                                    {totalUnread} new
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search businesses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-bg-elevated border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/50 text-sm"
                            />
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.map((convo) => (
                            <button
                                key={convo.id}
                                onClick={() => setSelectedConvo(convo)}
                                className={`w-full p-3 sm:p-4 flex items-start gap-3 hover:bg-bg-elevated transition-colors border-b border-border-subtle text-left ${selectedConvo?.id === convo.id ? 'bg-bg-elevated' : ''
                                    }`}
                            >
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent-gold/10 flex items-center justify-center shrink-0">
                                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-accent-gold" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm sm:text-base font-semibold text-text-primary truncate">
                                            {convo.businessName}
                                        </span>
                                        <span className="text-xs text-text-muted shrink-0">
                                            {formatTime(convo.lastMessageTime)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-muted mb-1">{convo.businessType}</p>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={`text-xs sm:text-sm truncate ${convo.unreadCount > 0 ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
                                            {convo.lastMessage}
                                        </p>
                                        {convo.unreadCount > 0 && (
                                            <span className="w-5 h-5 bg-accent-gold text-bg-primary text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                                                {convo.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className={`${selectedConvo ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-bg-secondary`}>
                    {selectedConvo ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-3 sm:p-4 border-b border-border-subtle flex items-center gap-3 bg-bg-primary">
                                <button
                                    onClick={() => setSelectedConvo(null)}
                                    className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-bg-elevated"
                                >
                                    <ArrowLeft className="w-5 h-5 text-text-primary" />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-accent-gold" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-sm sm:text-base font-semibold text-text-primary">
                                        {selectedConvo.businessName}
                                    </h2>
                                    <p className="text-[10px] sm:text-xs text-text-muted">{selectedConvo.businessType}</p>
                                </div>
                                <button className="p-2 rounded-lg hover:bg-bg-elevated transition-colors">
                                    <MoreHorizontal className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {selectedConvo.messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[75%] ${message.isOwn ? 'order-2' : ''}`}>
                                            <div
                                                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl ${message.isOwn
                                                    ? 'bg-accent-gold text-bg-primary rounded-br-md'
                                                    : 'bg-bg-elevated text-text-primary rounded-bl-md'
                                                    }`}
                                            >
                                                <p className="text-xs sm:text-sm">{message.content}</p>
                                            </div>
                                            <div className={`flex items-center gap-1 mt-1 ${message.isOwn ? 'justify-end' : ''}`}>
                                                <span className="text-xs text-text-muted">
                                                    {formatMessageTime(message.timestamp)}
                                                </span>
                                                {message.isOwn && (
                                                    <CheckCheck className={`w-3 h-3 ${message.read ? 'text-accent-gold' : 'text-text-muted'}`} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-3 sm:p-4 border-t border-border-subtle bg-bg-primary">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-bg-elevated border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/50 text-sm"
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="shrink-0"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-gold/10 flex items-center justify-center">
                                    <Send className="w-8 h-8 text-accent-gold" />
                                </div>
                                <h3 className="font-serif text-lg font-semibold text-text-primary mb-2">
                                    Select a Conversation
                                </h3>
                                <p className="text-text-muted text-sm max-w-xs">
                                    Choose a conversation from the list to view messages from businesses
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-50 animate-slide-in">
                    <Card className="border-success/20 bg-bg-elevated shadow-xl">
                        <CardContent className="py-3 px-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                                <CheckCheck className="w-4 h-4 text-success" />
                            </div>
                            <p className="text-sm font-medium text-text-primary">Message sent</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

// Loading fallback for Suspense
function MessagesLoading() {
    return (
        <div className="h-[calc(100vh-180px)] lg:h-[calc(100vh-140px)] animate-fade-in">
            <div className="flex h-full rounded-xl border border-border-subtle overflow-hidden bg-bg-secondary">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-4 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
                        <p className="text-text-muted text-sm">Loading messages...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TalentMessagesPage() {
    return (
        <Suspense fallback={<MessagesLoading />}>
            <MessagesPageContent />
        </Suspense>
    );
}
