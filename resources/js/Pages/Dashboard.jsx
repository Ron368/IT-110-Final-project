import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import LoadingScreen from '@/Components/loadingScreen'; // Imports the new component
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Dashboard() {
    // 1. Set initial state to true so it shows immediately
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 2. Set a timer to turn it off after 2.5 seconds
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            {/* 3. This renders the component we made in Step 1 */}
            <LoadingScreen isVisible={isLoading} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            You're logged in!
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}