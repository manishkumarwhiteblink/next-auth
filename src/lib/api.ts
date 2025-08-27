const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    jwt: string;
    role: string;
    user: {
        name: string;
        email: string;
        [key: string]: any;
    };
}

export interface AccountDetails {
    id: number;
    email: string;
    isActive: boolean;
    roles: string[];
    firstName: string;
    lastName: string;
    phone: string;
    team: string;
    lastUpdated: string;
    createdTime: string | null;
}

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.message || 'API Error');
    }

    return response.json();
}

export async function authenticate(credentials: LoginRequest): Promise<LoginResponse> {
    return apiCall<LoginResponse>('/authenticate', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

export async function getAccountDetails(jwt: string): Promise<AccountDetails> {
    return apiCall<AccountDetails>('/account/getAccountDetails', {
        headers: {
            Authorization: `Bearer ${jwt}`,
        },
    });
}

export async function isAuthenticated(jwt: string): Promise<boolean> {
    try {
        await apiCall('/account/isAuthenticated', {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        return true;
    } catch (error) {
        if (error instanceof ApiError && error.status === 403) {
            return false;
        }
        throw error;
    }
}

export async function logout(jwt: string): Promise<void> {
    try {
        await apiCall('/account/logout', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
    } catch (error) {
        console.warn('Logout API call failed:', error);
    }
}