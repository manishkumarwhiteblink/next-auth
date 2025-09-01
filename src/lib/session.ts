import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import {refreshAccessToken} from "@/lib/api";

export interface UserData {
    id: string;
    username: string;
    name: string;
    firstName: string;
    lastName: string;
    email?: string;
    isActive: boolean;
    roles: string[];
    createdAt: string;
    updatedAt: string;
}

export interface SessionData {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: string;
    refreshTokenExpiresAt?: string;

    user?: UserData;

    roles?: string[];
    selectedRole?: string;

    isAuthenticated: boolean;
    lastActivity?: number;
}

export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_development',
    cookieName: 'app-session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60, // 24 hours
        sameSite: 'strict',
    },
};

export async function getSession() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isAuthenticated) {
        session.isAuthenticated = false;
    }

    return session;
}

export async function destroySession() {
    const session = await getSession();
    session.destroy();
}