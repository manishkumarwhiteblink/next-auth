import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { authenticate, getAccountDetails } from '@/lib/api';
import { getRedirectPath } from '@/lib/auth';
import type { LoginSuccessResponse, LoginErrorResponse, AccountSuccessDetails, AccountErrorDetails } from '@/lib/api';

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
        const authResponse = await authenticate({ username, password });

        // Handle authentication errors
        if ('type' in authResponse) {
            const error = authResponse as LoginErrorResponse;
            return NextResponse.json(error);
        }

        const { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt } = authResponse as LoginSuccessResponse;

        // STEP 2: Get detailed account information using accessToken
        const accountResponse = await getAccountDetails(accessToken);

        // Handle account retrieval errors
        if ('type' in accountResponse) {
            const accountError = accountResponse as AccountErrorDetails;
            return NextResponse.json(accountError);
        }

        const accountDetails = accountResponse as AccountSuccessDetails;

        // STEP 3: Create session
        const session = await getSession();
        session.accessToken = accessToken;
        session.refreshToken = refreshToken;
        session.accessTokenExpiresAt = accessTokenExpiresAt;
        session.refreshTokenExpiresAt = refreshTokenExpiresAt;

        session.user = {
            id: accountDetails.id,
            name: `${accountDetails.firstName} ${accountDetails.lastName}`,
            username: accountDetails.username,
            firstName: accountDetails.firstName,
            lastName: accountDetails.lastName,
            email: '',
            isActive: accountDetails.enabled,
            roles: accountDetails.roles,
            createdAt: accountDetails.createdAt,
            updatedAt: accountDetails.updatedAt,
        };

        session.roles = accountDetails.roles;
        session.isAuthenticated = true;
        session.lastActivity = Date.now();

        await session.save();

        // STEP 4: Determine redirect path
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