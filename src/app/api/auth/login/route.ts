import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { authenticate, getAccountDetails } from '@/lib/api';
import { getRedirectPath } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // STEP 1: Authenticate user credentials
        // This will return a JWT if successful
        const authResponse = await authenticate({ username, password });

        // STEP 2: Get detailed account information
        const accountDetails = await getAccountDetails(authResponse.jwt);
        console.log('accountDetails', accountDetails);
        // Create session
        const session = await getSession();
        console.log("session", session);
        session.jwt = authResponse.jwt;
        session.user = {
            id: accountDetails.id,
            name: accountDetails.firstName + ' ' + accountDetails.lastName,
            email: accountDetails.email,
            isActive: accountDetails.isActive,
            firstName: accountDetails.firstName,
            lastName: accountDetails.lastName,
            phone: accountDetails.phone,
            team: accountDetails.team,
            lastUpdated: accountDetails.lastUpdated,
            createdTime: accountDetails.createdTime ?? undefined,
        };
        session.roles = accountDetails.roles;
        session.isAuthenticated = true;
        session.lastActivity = Date.now();

        await session.save();

        // Determine redirect path
        const redirectPath = getRedirectPath(session);

        return NextResponse.json({
            success: true,
            user: session.user,
            roles: session.roles,
            redirectPath,
        });

    } catch (error: unknown) {
        console.error('Login error:', error);

        return NextResponse.json(
            { error: (error instanceof Error ? error.message : 'Authentication failed') },
            { status: (typeof error === 'object' && error !== null && 'status' in error && true) ? (error as { status: number }).status : 500 }
        );
    }
}