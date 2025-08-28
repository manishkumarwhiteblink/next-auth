'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { getAvailableRoles, ROLE_MAPPINGS } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronRight, Shield, Users, Settings, LogOut } from 'lucide-react';

export default function RoleSelectionPage() {
    const { user, roles, selectRole, logout, isAuthenticated } = useAuth();
    const router = useRouter();
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedRoleKey, setSelectedRoleKey] = useState<string | null>(null);

    const availableRoles = getAvailableRoles(roles);

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/auth/login');
            return;
        }
        if (availableRoles.length === 0) {
            router.replace('/unauthorized');
            return;
        }

        if (availableRoles.length === 1) {
            handleRoleSelect(availableRoles[0].key);
        }
    }, [isAuthenticated, availableRoles, router]);

    const handleRoleSelect = async (roleKey: string) => {
        setIsSelecting(true);
        setSelectedRoleKey(roleKey);

        try {
            await selectRole(roleKey);
            const roleMapping = ROLE_MAPPINGS[roleKey as keyof typeof ROLE_MAPPINGS];
            if (roleMapping) {
                router.replace(roleMapping.path);
            }
        } catch (error) {
            console.error('Failed to select role:', error);
            setIsSelecting(false);
            setSelectedRoleKey(null);
        }
    };

    const getRoleIcon = (roleKey: string) => {
        switch (roleKey) {
            case 'ROLE_SUPERADMIN':
                return <Shield className="h-6 w-6 text-red-500" />;
            case 'ROLE_PARTNERUSER':
                return <Users className="h-6 w-6 text-blue-500" />;
            case 'ROLE_TRADITIONALBACKOFFICE':
                return <Settings className="h-6 w-6 text-green-500" />;
            case 'ROLE_TRADITIONALBACKOFFICE_RESEARCH':
                return <Settings className="h-6 w-6 text-yellow-500" />;
            case 'ROLE_TRADITIONALBACKOFFICE_REQUEST_LETTER':
                return <Settings className="h-6 w-6 text-purple-500" />;
            default:
                return <Shield className="h-6 w-6 text-gray-500" />;
        }
    };

    const getUserInitials = (user: any) => {
        if (user?.firstName && user?.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        }
        if (user?.name) {
            const nameParts = user.name.split(' ');
            if (nameParts.length >= 2) {
                return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
            }
            return user.name[0]?.toUpperCase() || 'U';
        }
        return 'U';
    };

    if (availableRoles.length === 0) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="w-full max-w-2xl">
                {/* User Info Header */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-6">
                    <CardHeader className="pb-4">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                                    {getUserInitials(user)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-foreground">
                                    Welcome, {user?.firstName || user?.name || 'User'}!
                                </h1>
                                <p className="text-muted-foreground">
                                    {user?.email}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                        {user?.team && `Team: ${user.team}`}
                                    </Badge>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={logout}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                {/* Role Selection */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-8">
                        <CardTitle className="text-2xl font-bold">
                            Choose Your Role
                        </CardTitle>
                        <CardDescription>
                            You have access to multiple dashboards. Please select the role you'd like to use.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {availableRoles.map((role) => (
                            <Card
                                key={role.key}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                                    selectedRoleKey === role.key
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                }`}
                                onClick={() => !isSelecting && handleRoleSelect(role.key)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                {getRoleIcon(role.key)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground">
                                                    {role.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {role.description}
                                                </p>
                                                <Badge variant="secondary" className="mt-2 text-xs">
                                                    {role.key}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {selectedRoleKey === role.key && isSelecting ? (
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                            ) : (
                                                <ChevronRight className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <div className="pt-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                Your role determines which features and data you can access.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-6 text-center text-xs text-muted-foreground">
                    <p>You can switch roles anytime from your dashboard settings</p>
                </div>
            </div>
        </div>
    );
}