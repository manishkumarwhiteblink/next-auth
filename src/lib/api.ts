const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface SignupRequest{
    username: string,
    firstName: string,
    lastName: string,
    password: string,
}

export interface SignupSuccessResponse {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    enabled: boolean;
    roles: string[];
    createdAt: string;
    updatedAt: string;
}

export interface SignupErrorDetail {
    object: string;
    field: string;
    rejectedValue: string | null;
    message: string;
    code: string;
}

export interface SignupErrorResponse {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance: string;
    timestamp: string;
    method: string;
    path: string;
    traceId: string;
    errorCount: number;
    errors: SignupErrorDetail[];
}

export type SignupResponse = SignupSuccessResponse | SignupErrorResponse;

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginSuccessResponse {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt : string;
    refreshTokenExpiresAt : string;
}
export interface LoginErrorResponse {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance: string;
    timestamp: string;
    method: string;
    path: string;
    traceId: string;
}
export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

export interface AccountSuccessDetails {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    enabled: boolean;
    roles: string[];
    createdAt: string;
    updatedAt: string;
}
export interface AccountErrorDetails {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance: string;
    error: string;
    error_description: string;
    realm: string;
}
export type AccountDetails = AccountSuccessDetails | AccountErrorDetails;
export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const resp = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
    });

    // Enforce status handling
    const text = await resp.text(); // read once
    let data: any;
    try { data = text ? JSON.parse(text) : undefined; } catch { data = text; }

    if (!resp.ok) {
        const message =
            (data && (data.message || data.detail || data.error_description)) ||
            `API Error ${resp.status}`;
        throw new ApiError(resp.status, message);
    }
    return data as T;
}

export async function signup(credentials:SignupRequest): Promise<SignupResponse> {
    return apiCall<SignupResponse>('/account/signup', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}
export async function authenticate(credentials: LoginRequest): Promise<LoginResponse> {
    return apiCall<LoginResponse>('/auth/authenticate', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

export async function getAccountDetails(accessToken: string): Promise<AccountDetails> {
    return apiCall<AccountDetails>('/account/getLoggedInAccountDetails', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

export async function isAuthenticated(accessToken: string): Promise<boolean> {
    try {
        await apiCall('/auth/verify', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
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
export async function refreshAccessToken(refreshToken: string): Promise<LoginResponse> {
    return apiCall<LoginResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
    });
}
export async function logout(accessToken: string,refreshToken:string): Promise<void> {
    try {
        await apiCall('/auth/revoke', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body:JSON.stringify(refreshToken),
        });
    } catch (error) {
        console.warn('Logout API call failed:', error);
    }
}