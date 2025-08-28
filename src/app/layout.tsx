import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthProvider";
import { ThemeProvider } from "@/context/ThemeProvider";
import { getSession } from "@/lib/session";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Secure Dashboard - Enterprise Portal",
    description: "Secure enterprise dashboard with role-based authentication",
};

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    const initialSession = {
        isAuthenticated: session.isAuthenticated,
        user: session.user || null,
        roles: session.roles || [],
        selectedRole: session.selectedRole,
    };

    return (
        <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
        <ThemeProvider>
            <AuthProvider initialSession={initialSession}>
                {children}
            </AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
