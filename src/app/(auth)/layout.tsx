import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-bg-primary flex flex-col">
            {/* Header */}
            <header className="p-6">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-gold to-accent-gold-muted flex items-center justify-center">
                        <span className="text-bg-primary font-bold text-lg">S</span>
                    </div>
                    <span className="font-serif text-2xl font-semibold text-text-primary">
                        Shift<span className="text-accent-gold">Sync</span>
                    </span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="p-6 text-center text-text-muted text-sm">
                <p>© {new Date().getFullYear()} ShiftSync. Premium Event Staffing.</p>
            </footer>
        </div>
    );
}
