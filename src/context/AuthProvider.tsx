'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { UserData } from '@/lib/session';

export interface AuthState {
    isAuthenticated: boolean;
    user: UserData | null;
    roles: string[];
    selectedRole?: string;
    isLoading: boolean;
    error?: string;
}

interface AuthAction {
    type:
        | 'SET_LOADING'
        | 'SET_AUTHENTICATED'
        | 'SET_UNAUTHENTICATED'
        | 'SET_ERROR'
        | 'CLEAR_ERROR'
        | 'SET_SELECTED_ROLE';
    payload?: any;
}

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    roles: [],
    isLoading: true,
    error: undefined,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };

        case 'SET_AUTHENTICATED':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                roles: action.payload.roles || [],
                selectedRole: action.payload.selectedRole,
                isLoading: false,
                error: undefined,
            };

        case 'SET_UNAUTHENTICATED':
            return {
                ...initialState,
                isLoading: false,
            };

        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                isLoading: false,
            };

        case 'CLEAR_ERROR':
            return {
                ...state,
                error: undefined,
            };

        case 'SET_SELECTED_ROLE':
            return {
                ...state,
                selectedRole: action.payload,
            };

        default:
            return state;
    }
}

interface AuthContextValue extends AuthState {
    login: (
        username: string,
        password: string
    ) => Promise<{ success: boolean; redirectPath?: string; error?: string }>;
    signup: (
        data: {
            username: string;
            firstName: string;
            lastName: string;
            password: string;
        }
    ) => Promise<{ success: boolean; redirectPath?: string; error?: string }>;
    logout: () => Promise<void>;
    selectRole: (role: string) => Promise<void>;
    refreshSession: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
    initialSession?: {
        isAuthenticated: boolean;
        user: UserData | null;
        roles: string[];
        selectedRole?: string;
    };
}

export function AuthProvider({ children, initialSession }: AuthProviderProps) {
    const [state, dispatch] = useReducer(authReducer, {
        ...initialState,
        isAuthenticated: initialSession?.isAuthenticated || false,
        user: initialSession?.user || null,
        roles: initialSession?.roles || [],
        selectedRole: initialSession?.selectedRole,
        isLoading: false,
    });

    const login = async (username: string, password: string) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            dispatch({
                type: 'SET_AUTHENTICATED',
                payload: {
                    user: data.user,
                    roles: data.roles,
                },
            });

            return { success: true, redirectPath: data.redirectPath };
        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            return { success: false, error: error.message };
        }
    };

    const signup = async ({
                              username,
                              firstName,
                              lastName,
                              password,
                          }: {
        username: string;
        firstName: string;
        lastName: string;
        password: string;
    }) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    firstName,
                    lastName,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            dispatch({
                type: 'SET_AUTHENTICATED',
                payload: {
                    user: data.user,
                    roles: data.roles,
                },
            });

            return { success: true, redirectPath: data.redirectPath };
        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            dispatch({ type: 'SET_UNAUTHENTICATED' });
            window.location.href = '/auth/login';
        }
    };

    const selectRole = async (role: string) => {
        try {
            const response = await fetch('/api/auth/session', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ selectedRole: role }),
            });

            if (response.ok) {
                dispatch({ type: 'SET_SELECTED_ROLE', payload: role });
            }
        } catch (error) {
            console.error('Role selection error:', error);
        }
    };

    const refreshSession = async () => {
        try {
            const response = await fetch('/api/auth/session');
            const data = await response.json();

            if (data.isAuthenticated) {
                dispatch({
                    type: 'SET_AUTHENTICATED',
                    payload: {
                        user: data.user,
                        roles: data.roles,
                        selectedRole: data.selectedRole,
                    },
                });
            } else {
                dispatch({ type: 'SET_UNAUTHENTICATED' });
            }
        } catch (error) {
            console.error('Session refresh error:', error);
            dispatch({ type: 'SET_UNAUTHENTICATED' });
        }
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const contextValue: AuthContextValue = {
        ...state,
        login,
        signup, // ✅ Added signup here
        logout,
        selectRole,
        refreshSession,
        clearError,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}