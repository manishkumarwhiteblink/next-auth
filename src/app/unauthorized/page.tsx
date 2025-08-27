'use client';

import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleGoHome = () => {
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-destructive/10 rounded-full">
                            <AlertTriangle className="h-12 w-12 text-destructive" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-destructive">
                        Access Denied
                    </CardTitle>
                    <CardDescription className="text-center">
                        You don't have permission to access this resource
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">
                            Logged in as:
                        </p>
                        <p className="font-medium">{user?.name || user?.email}</p>
                        {user?.team && (
                            <p className="text-sm text-muted-foreground">
                                Team: {user.team}
                            </p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            This area requires specific permissions that your account doesn't have.
                            Contact your administrator if you believe this is an error.
                        </p>

                        <div className="flex flex-col space-y-3">
                            <Button onClick={handleGoHome} className="w-full">
                                <Home className="mr-2 h-4 w-4" />
                                Go to Dashboard
                            </Button>

                            <Button variant="outline" onClick={logout} className="w-full">
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                            If you need access to this area, please contact your system administrator
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}