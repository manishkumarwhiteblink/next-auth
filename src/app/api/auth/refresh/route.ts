import { NextRequest, NextResponse } from "next/server";
import {getSession} from "@/lib/session";
import {type LoginErrorResponse, LoginResponse, type LoginSuccessResponse, refreshAccessToken} from "@/lib/api";


export async function GET(req: NextRequest) {
    try {
        const session = await getSession();

        // If session or token is missing → user not authenticated
        if (!session || !session.accessToken || !session.refreshToken ) {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
        }

        // Fetch the latest user data from your backend API
        const refreshResponse:LoginResponse = await refreshAccessToken(session.refreshToken);

        if ('type' in refreshResponse) {
            const error = refreshResponse as LoginErrorResponse;
            return NextResponse.json(
                { error: error.detail || 'Invalid credentials' },
                { status: error.status || 401 }
            );
        }

        const { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt } = refreshResponse as LoginSuccessResponse;

        session.accessToken = accessToken;
        session.refreshToken = refreshToken;
        session.accessTokenExpiresAt = accessTokenExpiresAt;
        session.refreshTokenExpiresAt = refreshTokenExpiresAt;

        // Save updated session
        await session.save();

        return NextResponse.json(
            { success: true, message: "Session refreshed", session },
            { status: 200 }
        );
    } catch (error) {
        console.error("Session refresh error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to refresh session" },
            { status: 500 }
        );
    }
}
