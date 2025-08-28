'use client';

import { useAuth } from '@/context/AuthProvider';

export default function ClientPage() {
    const { user, logout } = useAuth();
    const fetchPartnerData = async () => {
        try {
            const response = await fetch('/api/backend/partnerUser/getDetails');
            const data = await response.json();
            console.log("Partner User Data:", data);
        } catch (err) {
            console.log(err instanceof Error ? err.message : 'Failed to fetch partner data');
        }
    }

    return (
            <div className="min-h-screen bg-slate-50/50">
                <div className="max-w-7xl mx-auto p-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Sample Client Page</h1>
                        <p className="text-gray-700">Welcome, {user?.firstName} {user?.lastName}!</p>
                        <p className="text-gray-700 mt-2">This is your partner client page where you can manage your projects and team.</p>
                        <button
                            onClick={logout}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Logout
                        </button>
                        <button onClick={fetchPartnerData}>Fetch Parner Data</button>
                    </div>
                </div>

            </div>
    );
}
