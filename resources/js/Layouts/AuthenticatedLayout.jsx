import Navbar from '@/Components/Navbar';

export default function AuthenticatedLayout({ header, children }) {
    return (
        <div className="min-h-screen bg-[#FFF8F0]">
            {/* We now just use the component! */}
            <Navbar />

            {/* Header section */}
            {header && (
                <header className="bg-gradient-to-r from-[#FFF8F0] to-[#FFFBF5] border-b border-orange-200 shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold text-gray-800">{header}</h1>
                    </div>
                </header>
            )}

            {/* Main content */}
            <main className="py-12">{children}</main>
        </div>
    );
}