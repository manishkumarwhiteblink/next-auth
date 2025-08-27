'use client';

import { useAuth } from '@/components/AuthProvider';
import { AuthGuard } from '@/components/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Users,
    TrendingUp,
    FileText,
    Calendar,
    DollarSign,
    BarChart3,
    Bell,
    Search,
    LogOut,
    Plus,
    Download
} from 'lucide-react';

export default function PartnerDashboard() {
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
            return user.name[0]?.toUpperCase() || 'P';
        }
        return 'P';
    };

    const stats = [
        {
            title: 'Active Projects',
            value: '24',
            change: '+3',
            icon: FileText,
            color: 'text-blue-500',
        },
        {
            title: 'Total Revenue',
            value: '$127,500',
            change: '+15%',
            icon: DollarSign,
            color: 'text-green-500',
        },
        {
            title: 'Team Members',
            value: '18',
            change: '+2',
            icon: Users,
            color: 'text-purple-500',
        },
        {
            title: 'Completion Rate',
            value: '94%',
            change: '+2%',
            icon: TrendingUp,
            color: 'text-orange-500',
        },
    ];

    const recentProjects = [
        { name: 'E-commerce Integration', status: 'In Progress', progress: 75, client: 'TechCorp Inc.' },
        { name: 'Mobile App Development', status: 'Review', progress: 90, client: 'StartupXYZ' },
        { name: 'Data Migration', status: 'Planning', progress: 25, client: 'Enterprise Ltd.' },
        { name: 'API Development', status: 'Completed', progress: 100, client: 'Innovation Co.' },
    ];

    const upcomingDeadlines = [
        { project: 'E-commerce Integration', deadline: 'Dec 15, 2024', priority: 'high' },
        { project: 'Mobile App Review', deadline: 'Dec 20, 2024', priority: 'medium' },
        { project: 'Data Migration Planning', deadline: 'Jan 5, 2025', priority: 'low' },
    ];

    return (
        <AuthGuard requiredRole="ROLE_PARTNERUSER">
            <div className="min-h-screen bg-slate-50/50">
                {/* Header */}
                <header className="bg-white border-b shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">Partner Portal</h1>
                                        <p className="text-sm text-gray-500">Manage your projects and team</p>
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
                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
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
            </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CardHeader className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-3">
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                <div>
                                    <p className="text-sm text-gray-500">{stat.title}</p>
                                    <h3 className="text-lg font-semibold">{stat.value}</h3>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-xs">{stat.change}</Badge>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {/* Recent Projects */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentProjects.map((project, index) => (
                        <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                            <CardHeader className="p-4">
                                <h3 className="text-lg font-semibold">{project.name}</h3>
                                <p className="text-sm text-gray-500">Client: {project.client}</p>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm ${project.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {project.status}
                                    </span>
                                    <span className="text-xs text-gray-400">{project.progress}% Complete</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Upcoming Deadlines */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingDeadlines.map((deadline, index) => (
                        <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                            <CardHeader className="p-4">
                                <h3 className="text-lg font-semibold">{deadline.project}</h3>
                                <p className={`text-sm ${deadline.priority === 'high' ? 'text-red-600' : deadline.priority === 'medium' ? 'text-yellow-600' : 'text-gray-500'}`}>
                                    {deadline.priority.charAt(0).toUpperCase() + deadline.priority.slice(1)} Priority
                                </p>
                            </CardHeader>
                            <CardContent className="p-4">
                                <p className="text-xs text-gray-400">Deadline: {deadline.deadline}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </main>
    </AuthGuard>
    );
}
