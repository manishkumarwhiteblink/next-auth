import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface UserData {
    id?: number;
    name?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    team?: string;
    lastUpdated?: string;
    createdTime?: string;
    isActive?: boolean;
}

export interface SessionData {
    jwt?: string;
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