import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { isAuthenticated, getAccountDetails } from '@/lib/api';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session.isAuthenticated || !session.jwt) {
            return NextResponse.json({
                isAuthenticated: false,
                user: null,
                roles: [],
            });
        }

        // Validate JWT with backend
        const isValidToken = await isAuthenticated(session.jwt);

        if (!isValidToken) {
            // Clear invalid session
            session.destroy();
            return NextResponse.json({
                isAuthenticated: false,
                user: null,
                roles: [],
            });
        }

        return NextResponse.json({
            isAuthenticated: true,
            user: session.user,
            roles: session.roles,
            selectedRole: session.selectedRole,
        });

    } catch (error: any) {
        console.error('Session validation error:', error);

        // Clear session on error
        const session = await getSession();
        session.destroy();

        return NextResponse.json({
            isAuthenticated: false,
            user: null,
            roles: [],
        });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();
        const body = await request.json();

        if (!session.isAuthenticated) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Update selected role
        if (body.selectedRole) {
            if (!session.roles?.includes(body.selectedRole)) {
                return NextResponse.json(
                    { error: 'Invalid role selection' },
                    { status: 400 }
                );
            }
            session.selectedRole = body.selectedRole;
            await session.save();
        }

        return NextResponse.json({
            success: true,
            selectedRole: session.selectedRole,
        });

    } catch (error: any) {
        console.error('Session update error:', error);
        return NextResponse.json(
            { error: 'Failed to update session' },
            { status: 500 }
        );
    }
}