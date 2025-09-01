import { SessionData } from './session';

export const ROLE_MAPPINGS = {
    ROLE_ADMIN: {
        key: 'ROLE_ADMIN',
        name: 'Admin',
        path: '/admin',
        description: 'Full system administration access'
    },
    ROLE_PARTNERUSER: {
        key: 'ROLE_PARTNERUSER',
        name: 'Partner User',
        path: '/partner',
        description: 'Partner portal access'
    }
} as const;

export type RoleKey = keyof typeof ROLE_MAPPINGS;

export function hasRole(userRoles: string[] = [], requiredRole: string): boolean {
    return userRoles.includes(requiredRole);
}

export function hasAnyRole(userRoles: string[] = [], requiredRoles: string[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role));
}

export function getAvailableRoles(userRoles: string[] = []) {
    return userRoles
        .filter(role => role in ROLE_MAPPINGS)
        .map(role => ROLE_MAPPINGS[role as RoleKey]);
}

export function getRedirectPath(session: SessionData): string {
    if (!session.isAuthenticated || !session.roles) {
        return '/auth/login';
    }

    const availableRoles = getAvailableRoles(session.roles);

    // No valid roles
    if (availableRoles.length === 0) {
        return '/unauthorized';
    }
    console.log('availableRoles', availableRoles);
    // Single role - direct redirect
    if (availableRoles.length === 1) {
        return availableRoles[0].path;
    }

    // Multiple roles - check if user has selected one
    if (session.selectedRole) {
        const selectedRoleMapping = ROLE_MAPPINGS[session.selectedRole as RoleKey];
        if (selectedRoleMapping && hasRole(session.roles, session.selectedRole)) {
            return selectedRoleMapping.path;
        }
    }

    // Multiple roles without selection
    return '/auth/role-selection';
}

export function isPublicRoute(pathname: string): boolean {
    const publicRoutes = [
        '/auth/login',
        '/auth/signup',
        '/auth/role-selection',
        '/unauthorized',
        '/api/auth'
    ];

    return publicRoutes.some(route => pathname.startsWith(route));
}

export function getReturnUrl(pathname: string, searchParams?: string): string {
    if (isPublicRoute(pathname)) return '/';

    const returnUrl = searchParams ? `${pathname}?${searchParams}` : pathname;
    return encodeURIComponent(returnUrl);
}