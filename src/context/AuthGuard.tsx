'use client';

import { useAuth } from '@/context/AuthProvider';
import { hasRole, hasAnyRole } from '@/lib/auth';
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertCircle } from 'lucide-react';

interface AuthGuardProps {
    children: ReactNode;
    requiredRole?: string;
    requiredRoles?: string[];
    fallback?: ReactNode;
}

export function AuthGuard({
                              children,
                              requiredRole,
                              requiredRoles,
                              fallback
                          }: AuthGuardProps) {
    const { isAuthenticated, roles, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
                        <p className="text-muted-foreground">
                            Please log in to access this page.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Check role requirements
    if (requiredRole && !hasRole(roles, requiredRole)) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
                        <p className="text-muted-foreground mb-2">
                            You don&#39;t have permission to access this page.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Required role: <code className="bg-muted px-1 py-0.5 rounded">{requiredRole}</code>
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (requiredRoles && !hasAnyRole(roles, requiredRoles)) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
                        <p className="text-muted-foreground mb-2">
                            You don&#39;t have permission to access this page.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Required roles: {requiredRoles.map(role =>
                            <code key={role} className="bg-muted px-1 py-0.5 rounded mr-1">{role}</code>
                        )}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}