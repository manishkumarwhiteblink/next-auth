import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { isAuthenticated } from '@/lib/api';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session.isAuthenticated || !session.jwt) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Validate JWT with backend before returning
        const isValidToken = await isAuthenticated(session.jwt);

        if (!isValidToken) {
            // Clear invalid session
            session.destroy();
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            jwt: session.jwt,
        });

    } catch (error: any) {
        console.error('JWT API error:', error);

        // Clear session on error
        const session = await getSession();
        session.destroy();

        return NextResponse.json(
            { error: 'Failed to get JWT' },
            { status: 500 }
        );
    }
}