import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import {logout} from "@/lib/api";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        // Call backend logout if we have a JWT
        if (session.accessToken && session.refreshToken) {
            await logout(session.accessToken,session.refreshToken);
        }

        // Destroy the session
        session.destroy();

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Logout error:', error);

        // Even if backend logout fails, destroy local session
        const session = await getSession();
        session.destroy();

        return NextResponse.json({ success: true });
    }
}