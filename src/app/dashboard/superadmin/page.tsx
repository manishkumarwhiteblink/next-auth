'use client';

import { useAuth } from '@/components/AuthProvider';
import { AuthGuard } from '@/components/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Shield,
    Users,
    Settings,
    Database,
    Activity,
    AlertTriangle,
    TrendingUp,
    Server,
    LogOut,
    Bell,
    Search
} from 'lucide-react';

export default function SuperAdminDashboard() {
    const { user, logout } = useAuth();
    const getUserInitials = (user: any) => {
        if (user?.firstName && user?.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        }
        if (user?.name) {
            const nameParts = user.name.split(' ');
            if (nameParts.length >= 2) {
                return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
            }
            return user.name[0]?.toUpperCase() || 'SA';
        }
        return 'SA';
    };

    const stats = [
        {
            title: 'Total Users',
            value: '2,847',
            change: '+12%',
            icon: Users,
            color: 'text-blue-500',
        },
        {
            title: 'Active Systems',
            value: '98.5%',
            change: '+0.2%',
            icon: Server,
            color: 'text-green-500',
        },
        {
            title: 'Security Alerts',
            value: '3',
            change: '-2',
            icon: AlertTriangle,
            color: 'text-orange-500',
        },
        {
            title: 'Performance',
            value: '99.9%',
            change: '+0.1%',
            icon: TrendingUp,
            color: 'text-purple-500',
        },
    ];

    const recentActivities = [
        { action: 'User john.doe@company.com logged in', time: '2 min ago', type: 'info' },
        { action: 'System backup completed', time: '15 min ago', type: 'success' },
        { action: 'Failed login attempt detected', time: '23 min ago', type: 'warning' },
        { action: 'New user registered: jane.smith@company.com', time: '1 hour ago', type: 'info' },
        { action: 'Database optimization completed', time: '2 hours ago', type: 'success' },
    ];

    return (
        <AuthGuard requiredRole="ROLE_SUPERADMIN">
            <div className="min-h-screen bg-slate-50/50">
                {/* Header */}
                <header className="bg-white border-b shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <Shield className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                                        <p className="text-sm text-gray-500">Complete system administration</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Button variant="ghost" size="sm">
                                    <Search className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <Bell className="h-4 w-4" />
                                </Button>

                                <div className="flex items-center space-x-3 pl-4 border-l">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-red-100 text-red-600 text-sm font-semibold">
                                            {getUserInitials(user)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:block">
                                        <p className="text-sm font-medium">{user?.firstName || user?.name}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={logout}>
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome back, {user?.firstName || 'Admin'}!
                        </h2>
                        <p className="text-gray-600">
                            Here's what's happening with your system today.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <Card key={index} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                                <p className={`text-sm mt-1 ${
                                                    stat.change.startsWith('+') ? 'text-green-600' :
                                                        stat.change.startsWith('-') && stat.title !== 'Security Alerts' ? 'text-red-600' :
                                                            'text-green-600'
                                                }`}>
                                                    {stat.change} from last week
                                                </p>
                                            </div>
                                            <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                                                <IconComponent className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Quick Actions */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5" />
                                    <span>Quick Actions</span>
                                </CardTitle>
                                <CardDescription>Common administrative tasks</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-start">
                                    <Users className="mr-2 h-4 w-4" />
                                    Manage Users
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Database className="mr-2 h-4 w-4" />
                                    System Backup
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Activity className="mr-2 h-4 w-4" />
                                    View Logs
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Settings className="mr-2 h-4 w-4" />
                                    System Settings
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5" />
                                    <span>Recent Activity</span>
                                </CardTitle>
                                <CardDescription>Latest system events and user actions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentActivities.map((activity, index) => (
                                        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50/50">
                                            <div className={`p-1 rounded-full ${
                                                activity.type === 'success' ? 'bg-green-100' :
                                                    activity.type === 'warning' ? 'bg-orange-100' :
                                                        'bg-blue-100'
                                            }`}>
                                                <div className={`h-2 w-2 rounded-full ${
                                                    activity.type === 'success' ? 'bg-green-500' :
                                                        activity.type === 'warning' ? 'bg-orange-500' :
                                                            'bg-blue-500'
                                                }`}></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900">{activity.action}</p>
                                                <p className="text-xs text-gray-500">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Role Badge */}
                    <div className="mt-8 flex justify-center">
                        <Badge variant="secondary" className="px-4 py-2">
                            <Shield className="mr-2 h-4 w-4" />
                            Super Administrator Access
                        </Badge>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}