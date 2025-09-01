'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { signup, isAuthenticated } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams?.get('returnUrl');

    useEffect(() => {
        if (isAuthenticated) {
            const destination = returnUrl ? decodeURIComponent(returnUrl) : '';
            router.replace(destination);
        }
    }, [isAuthenticated, router, returnUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Basic validation
        if (!username.trim() || !firstName.trim() || !lastName.trim() || !password.trim()) {
            setError('All fields are required');
            setIsLoading(false);
            return;
        }

        try {
            const result = await signup({
                username: username.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                password,
            });

            if (result.success && result.redirectPath) {
                const destination = returnUrl
                    ? decodeURIComponent(returnUrl)
                    : result.redirectPath;
                router.replace(destination);
            } else if (result.error) {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-8">
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <UserPlus className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">
                            Create an Account
                        </CardTitle>
                        <CardDescription className="text-center text-muted-foreground">
                            Sign up to get started
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm font-medium">
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isLoading}
                                    className="h-11"
                                    autoComplete="username"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-medium">
                                    First Name
                                </Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    placeholder="Enter your first name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    disabled={isLoading}
                                    className="h-11"
                                    autoComplete="given-name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-medium">
                                    Last Name
                                </Label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    placeholder="Enter your last name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    disabled={isLoading}
                                    className="h-11"
                                    autoComplete="family-name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        className="h-11 pr-10"
                                        autoComplete="new-password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-medium"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Sign Up
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="text-center text-sm text-muted-foreground">
                            <p>Already have an account? <a href="/auth/login" className="text-primary hover:underline">Log in</a></p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
