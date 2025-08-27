import { AuthGuard } from '@/components/AuthGuard';
import ClaimantTable from '@/components/ClaimantTable';
import { getClaimantsServer } from '@/lib/claimant';
import { getSession } from '@/lib/session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { redirect } from 'next/navigation';
import {getDefaultClaimantFilters} from "@/lib/types";

// Server Component - runs on the server
export default async function ServerExamplePage() {
    // Get session to verify authentication
    const session = await getSession();

    if (!session.isAuthenticated) {
        redirect('/auth/login');
    }

    // Pre-load data on the server
    let initialData = null;
    let error = null;

    try {
        const filters = getDefaultClaimantFilters();
        initialData = await getClaimantsServer(filters);
    } catch (err: unknown) {
        console.error('Server-side data loading error:', err);
        error = err instanceof Error ? err.message : 'Failed to load claimant data';
    }
    console.log(initialData);
    return (
        <AuthGuard requiredRole="ROLE_PARTNERUSER">
            <div className="min-h-screen bg-slate-50/50 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Server-Side Data Loading Example
                        </h1>
                        <p className="text-gray-600">
                            This page demonstrates server-side data loading with Next.js 15 App Router.
                            The data is fetched on the server and hydrated to the client with no loading states.
                        </p>
                    </div>

                    {error ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-destructive">
                                    <AlertCircle className="h-5 w-5" />
                                    <span>Error Loading Data</span>
                                </CardTitle>
                                <CardDescription>
                                    There was an error loading the claimant data from the server.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{error}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    The table below will still work but will need to fetch data client-side.
                                </p>
                            </CardContent>
                        </Card>
                    ) : null}

                    {/* Pass server-fetched data to client component */}
                    <ClaimantTable initialData={initialData || undefined} />

                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2">How this works:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>1. Server Component fetches data using JWT from iron-session</li>
                            <li>2. Data is passed as props to the Client Component</li>
                            <li>3. Client Component shows data immediately (no loading state)</li>
                            <li>4. Client Component can still fetch fresh data when needed</li>
                            <li>5. Perfect for SEO and fast initial page loads</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}

export const dynamic = 'force-dynamic';