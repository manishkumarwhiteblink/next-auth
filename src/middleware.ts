import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { isPublicRoute, hasRole, getReturnUrl } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // Skip middleware for static files and API routes (except auth)
    if (
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/static/') ||
        pathname.match(/\.(ico|png|svg|jpg|jpeg|gif|webp|css|js)$/) ||
        (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/'))
    ) {
        return NextResponse.next();
    }

    try {
        // Get session from request
        const response = NextResponse.next();
        console.log('Middleware triggered for:', pathname);

        const session = await getIronSession<SessionData>(
            request,
            response,
            sessionOptions
        );
        console.log("Middleware session:", session);
        // Public routes - allow access
        if (isPublicRoute(pathname)) {
            // If already authenticated, redirect from auth page
            if (pathname.startsWith('/auth/') && session.isAuthenticated) {
                const defaultRedirect = getDefaultRolePath(session.roles);
                const redirectUrl = new URL(defaultRedirect, request.url);
                return NextResponse.redirect(redirectUrl);
            }
            return response;
        }

        // Protected routes - check authentication
        if (!session.isAuthenticated) {
            const returnUrl = getReturnUrl(pathname, search);
            const loginUrl = new URL(`/auth/login?returnUrl=${returnUrl}`, request.url);
            return NextResponse.redirect(loginUrl);
        }

        // Role-based route protection
        if (pathname.startsWith('/admin')) {
            if (!hasRole(session.roles, 'ROLE_ADMIN')) {
                const unauthorizedUrl = new URL('/unauthorized', request.url);
                return NextResponse.redirect(unauthorizedUrl);
            }
        }

        if (pathname.startsWith('/partner')) {
            if (!hasRole(session.roles, 'ROLE_PARTNERUSER')) {
                const unauthorizedUrl = new URL('/unauthorized', request.url);
                return NextResponse.redirect(unauthorizedUrl);
            }
        }


        // Root route `/` redirect based on user's role
        if (pathname === '/') {
            const availableRoles =
                session.roles?.filter((role) =>
                    [
                        'ROLE_ADMIN',
                        'ROLE_PARTNERUSER',
                    ].includes(role)
                ) || [];

            if (availableRoles.length === 0) {
                const unauthorizedUrl = new URL('/unauthorized', request.url);
                return NextResponse.redirect(unauthorizedUrl);
            }

            // If only one role → go directly to its route
            if (availableRoles.length === 1) {
                const role = availableRoles[0];
                const portalPath = getDefaultRolePath([role]);
                const portalUrl = new URL(portalPath, request.url);
                return NextResponse.redirect(portalUrl);
            }

            // If multiple roles and no role selected → redirect to role selection page
            if (availableRoles.length > 1 && !session.selectedRole) {
                const roleSelectionUrl = new URL('/auth/role-selection', request.url);
                return NextResponse.redirect(roleSelectionUrl);
            }

            // If a role was already selected, redirect accordingly
            if (session.selectedRole) {
                const portalPath = getDefaultRolePath([session.selectedRole]);
                const portalUrl = new URL(portalPath, request.url);
                return NextResponse.redirect(portalUrl);
            }
        }

        return response;
    } catch (error) {
        console.error('Middleware error:', error);
        // On error, redirect to login
        const loginUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(loginUrl);
    }
}

/**
 * Helper to map roles to default portal paths
 */
function getDefaultRolePath(roles?: string[]): string {
    if (!roles || roles.length === 0) return '/unauthorized';

    if (roles.includes('ROLE_ADMIN')) return '/admin';
    if (roles.includes('ROLE_PARTNERUSER')) return '/partner';

    return '/unauthorized';
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};
