import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import {isAuthenticated, refreshAccessToken} from '@/lib/api';

function isExpired(ts?: string, skewSec = 30) {
    if (!ts) return true;
    const expMs = new Date(ts).getTime();
    return Date.now() + skewSec * 1000 >= expMs; // refresh slightly early
}

export async function GET() {
    try {
        const session = await getSession();

        if (!session.isAuthenticated || !session.accessToken || !session.refreshToken) {
            return NextResponse.json({ isAuthenticated: false, user: null, roles: [] });
        }
        console.log("session found, validating...");
        // 1) If access token is (almost) expired → try refresh first
        if (isExpired(session.accessTokenExpiresAt)) {
            try {
                const refreshed = await refreshAccessToken(session.refreshToken);
                // with apiCall fixed, errors will throw; success returns typed data
                session.accessToken = (refreshed as any).accessToken;
                session.refreshToken = (refreshed as any).refreshToken;
                session.accessTokenExpiresAt = (refreshed as any).accessTokenExpiresAt;
                session.refreshTokenExpiresAt = (refreshed as any).refreshTokenExpiresAt;
                session.lastActivity = Date.now();
                await session.save();
            } catch (e) {
                console.error('Token refresh failed:', e);
                await session.destroy();
                return NextResponse.json({ isAuthenticated: false, user: null, roles: [] });
            }
        } else {
            // 2) Otherwise, verify (cheap) — if verify fails, then try refresh
            const valid = await isAuthenticated(session.accessToken);
            if (!valid) {
                try {
                    console.log("Session verify failed, trying refresh");
                    const refreshed = await refreshAccessToken(session.refreshToken);
                    session.accessToken = (refreshed as any).accessToken;
                    session.refreshToken = (refreshed as any).refreshToken;
                    session.accessTokenExpiresAt = (refreshed as any).accessTokenExpiresAt;
                    session.refreshTokenExpiresAt = (refreshed as any).refreshTokenExpiresAt;
                    session.lastActivity = Date.now();
                    await session.save();
                } catch (e) {
                    console.error('Token refresh after verify-fail:', e);
                    await session.destroy();
                    return NextResponse.json({ isAuthenticated: false, user: null, roles: [] });
                }
            }
        }

        return NextResponse.json({
            isAuthenticated: true,
            user: session.user,
            roles: session.roles,
            selectedRole: session.selectedRole,
        });
    } catch (error) {
        console.error('Session validation error:', error);
        const session = await getSession();
        await session.destroy();
        return NextResponse.json({ isAuthenticated: false, user: null, roles: [] });
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