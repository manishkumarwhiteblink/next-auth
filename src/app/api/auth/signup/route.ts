import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { signup, authenticate, getAccountDetails } from '@/lib/api';
import { getRedirectPath } from '@/lib/auth';
import { ApiError, SignupRequest, SignupSuccessResponse, SignupErrorResponse, AccountSuccessDetails } from '@/lib/api';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, firstName, lastName, password } = body;

        if (!username || !firstName || !lastName || !password) {
            return NextResponse.json(
                { error: 'Username, First Name, Last Name, and Password are required' },
                { status: 400 }
            );
        }

        // STEP 1: Call Signup API
        const signupResponse = await signup({ username, firstName, lastName, password });

        // If signup fails, return errors
        if ('errors' in signupResponse) {
            const signupError = signupResponse as SignupErrorResponse;
            return NextResponse.json(
                {
                    success: false,
                    message: signupError.detail || 'Signup failed',
                    errors: signupError.errors,
                },
                { status: signupError.status || 400 }
            );
        }

        const createdUser = signupResponse as SignupSuccessResponse;

        // STEP 2: Authenticate user immediately after signup
        const authResponse = await authenticate({ username, password });

        if (!('accessToken' in authResponse)) {
            return NextResponse.json(
                { error: 'Authentication failed after signup' },
                { status: 401 }
            );
        }

        // STEP 3: Fetch account details using accessToken
        const accountDetails = await getAccountDetails(authResponse.accessToken);

        if ('error' in accountDetails) {
            throw new ApiError(500, 'Failed to fetch account details');
        }

        const account = accountDetails as AccountSuccessDetails;

        // STEP 4: Create Session
        const session = await getSession();
        session.accessToken = authResponse.accessToken;
        session.refreshToken = authResponse.refreshToken;
        session.accessTokenExpiresAt = authResponse.accessTokenExpiresAt;
        session.refreshTokenExpiresAt = authResponse.refreshTokenExpiresAt;

        session.user = {
            id: account.id,
            username: account.username,
            firstName: account.firstName,
            lastName: account.lastName,
            name: `${account.firstName} ${account.lastName}`,
            roles: account.roles,
            isActive : account.enabled,
            email: '',
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        };

        session.roles = account.roles;
        session.isAuthenticated = true;
        session.lastActivity = Date.now();

        await session.save();

        // STEP 5: Get redirect path after signup
        const redirectPath = getRedirectPath(session);

        return NextResponse.json({
            success: true,
            user: session.user,
            roles: session.roles,
            redirectPath,
        });

    } catch (error: unknown) {
        console.error('Signup Error:', error);

        if (error instanceof ApiError) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Unexpected server error' },
            { status: 500 }
        );
    }
}
