import { SessionData } from './session';

export const ROLE_MAPPINGS = {
    ROLE_SUPERADMIN: {
        key: 'ROLE_SUPERADMIN',
        name: 'Super Admin',
        path: '/dashboard/superadmin',
        description: 'Full system administration access'
    },
    ROLE_PARTNERUSER: {
        key: 'ROLE_PARTNERUSER',
        name: 'Partner User',
        path: '/dashboard/partner',
        description: 'Partner portal access'
    },
    ROLE_TRADITIONALBACKOFFICE: {
        key: 'ROLE_TRADITIONALBACKOFFICE',
        name: 'Traditional Back Office',
        path: '/dashboard/traditional-backoffice',
        description: 'Access to traditional back office features'
    },
    ROLE_TRADITIONALBACKOFFICE_RESEARCH : {
        key: 'ROLE_TRADITIONALBACKOFFICE_RESEARCH',
        name: 'Traditional Back Office Research',
        path: '/dashboard/traditional-backoffice',
        description: 'Access to traditional back office features'
    },
    ROLE_TRADITIONALBACKOFFICE_REQUEST_LETTER:{
        key: 'ROLE_TRADITIONALBACKOFFICE_REQUEST_LETTER',
        name: 'Traditional Back Office Request Letter',
        path: '/dashboard/traditional-backoffice',
        description: 'Access to request letter features in traditional back office'
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