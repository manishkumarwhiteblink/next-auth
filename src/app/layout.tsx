import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import { getSession } from '@/lib/session';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Secure Dashboard - Enterprise Portal',
    description: 'Secure enterprise dashboard with role-based authentication',
};

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    // Get initial session state for hydration
    const session = await getSession();

    const initialSession = {
        isAuthenticated: session.isAuthenticated,
        user: session.user || null,
        roles: session.roles || [],
        selectedRole: session.selectedRole,
    };

    return (
        <html lang="en">
        <body className={inter.className}>
        <AuthProvider initialSession={initialSession}>
            {children}
        </AuthProvider>
        </body>
        </html>
    );
}