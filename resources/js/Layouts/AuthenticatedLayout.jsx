import Navbar from '@/Components/Navbar';

export default function AuthenticatedLayout({ header, children }) {
    return (
        <div className="auth-shell min-h-screen bg-[#FFF8F0]">
            {/* We now just use the component! */}
            <Navbar />

            {/* Header section */}
            {header && (
                <header className="bg-gradient-to-r from-[#FFF8F0] to-[#FFFBF5] border-b border-orange-200 shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-1 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* Main content */}
            <main className="py-2 lg:py-1">{children}</main>
        </div>
    );
}