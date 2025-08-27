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
        console.log("Middleware triggered for:", pathname);
        const session = await getIronSession<SessionData>(
            request,
            response,
            sessionOptions
        );

        // Public routes - allow access
        if (isPublicRoute(pathname)) {
            // If already authenticated, redirect from login page
            if (pathname === '/auth/login' && session.isAuthenticated) {
                const redirectUrl = new URL('/dashboard', request.url);
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
        if (pathname.startsWith('/dashboard/superadmin')) {
            if (!hasRole(session.roles, 'ROLE_SUPERADMIN')) {
                const unauthorizedUrl = new URL('/unauthorized', request.url);
                return NextResponse.redirect(unauthorizedUrl);
            }
        }

        if (pathname.startsWith('/dashboard/partner')) {
            if (!hasRole(session.roles, 'ROLE_PARTNERUSER')) {
                const unauthorizedUrl = new URL('/unauthorized', request.url);
                return NextResponse.redirect(unauthorizedUrl);
            }
        }

        if (pathname.startsWith('/dashboard/traditional-backoffice')) {
            if (!hasRole(session.roles, 'ROLE_TRADITIONALBACKOFFICE') &&
                !hasRole(session.roles, 'ROLE_TRADITIONALBACKOFFICE_RESEARCH') &&
                !hasRole(session.roles, 'ROLE_TRADITIONALBACKOFFICE_REQUEST_LETTER')) {
                const unauthorizedUrl = new URL('/unauthorized', request.url);
                return NextResponse.redirect(unauthorizedUrl);
            }
        }

        // Root dashboard redirect
        if (pathname === '/dashboard' || pathname === '/') {
            const availableRoles = session.roles?.filter(role =>
                ['ROLE_SUPERADMIN', 'ROLE_PARTNERUSER', 'ROLE_TRADITIONALBACKOFFICE', 'ROLE_TRADITIONALBACKOFFICE_RESEARCH','ROLE_TRADITIONALBACKOFFICE_REQUEST_LETTER'].includes(role)
            ) || [];

            if (availableRoles.length === 0) {
                const unauthorizedUrl = new URL('/unauthorized', request.url);
                return NextResponse.redirect(unauthorizedUrl);
            }

            if (availableRoles.length === 1) {
                const role = availableRoles[0];
                let dashboardPath = '/dashboard';

                if (role === 'ROLE_SUPERADMIN') dashboardPath = '/dashboard/superadmin';
                else if (role === 'ROLE_PARTNERUSER') dashboardPath = '/dashboard/partner';
                else if (role === 'ROLE_TRADITIONALBACKOFFICE') dashboardPath = '/dashboard/traditional-backoffice';
                else if (role === 'ROLE_TRADITIONALBACKOFFICE_RESEARCH') dashboardPath = '/dashboard/traditional-backoffice';
                else if (role === 'ROLE_TRADITIONALBACKOFFICE_REQUEST_LETTER') dashboardPath = '/dashboard/traditional-backoffice';

                const dashboardUrl = new URL(dashboardPath, request.url);
                return NextResponse.redirect(dashboardUrl);
            }

            if (availableRoles.length > 1 && !session.selectedRole) {
                const roleSelectionUrl = new URL('/auth/role-selection', request.url);
                return NextResponse.redirect(roleSelectionUrl);
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

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};