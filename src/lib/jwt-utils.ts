import { getSession } from '@/lib/session';

// For Server Components and API Routes
export async function getServerJWT(): Promise<string | null> {
    try {
        const session = await getSession();
        return session.jwt || null;
    } catch (error) {
        console.error('Error getting server JWT:', error);
        return null;
    }
}

// For Client Components - fetch JWT from session API
export async function getClientJWT(): Promise<string | null> {
    try {
        const response = await fetch('/api/auth/jwt', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to get JWT');
        }

        const data = await response.json();
        return data.jwt || null;
    } catch (error) {
        console.error('Error getting client JWT:', error);
        return null;
    }
}

// Authenticated fetch wrapper for client components
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
    const jwt = await getClientJWT();

    if (!jwt) {
        throw new Error('No authentication token available');
    }

    return fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
}

// Authenticated fetch wrapper for server components/API routes
export async function serverAuthenticatedFetch(url: string, options: RequestInit = {}) {
    const jwt = await getServerJWT();

    if (!jwt) {
        throw new Error('No authentication token available');
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const fullUrl = url.startsWith('http') ? url : `${apiBaseUrl}${url}`;

    return fetch(fullUrl, {
        ...options,
        headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
}