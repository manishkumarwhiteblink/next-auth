import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function SuperAdminDashboard() {
    const session = await getSession();
    const userData = session.user;
    if (!session.isAuthenticated) {
        redirect('/auth/login');
    }
    return (
        <div className="min-h-screen bg-slate-50/50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Super Admin Dashboard</h1>
                    <p className="text-gray-700">Welcome, {userData?.firstName} {userData?.lastName}!</p>
                </div>
            </div>
        </div>
    );
}

export const dynamic = 'force-dynamic';