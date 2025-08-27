'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ThemeContextType = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system');

    const getSystemTheme = () =>
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    const applyTheme = useCallback((t: Theme) => {
        const applied = t === 'system' ? getSystemTheme() : t;
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(applied);
        localStorage.setItem('theme', t);
    }, []);

    useEffect(() => {
        const saved = (localStorage.getItem('theme') as Theme) || 'system';
        setThemeState(saved);
        applyTheme(saved);
    }, [applyTheme]);

    useEffect(() => {
        if (theme !== 'system') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyTheme('system');
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme, applyTheme]);

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
        applyTheme(t);
    }, [applyTheme]);

    const toggleTheme = useCallback(() => {
        const currentApplied = theme === 'system' ? getSystemTheme() : theme;
        const next = currentApplied === 'light' ? 'dark' : 'light';
        setTheme(next);
    }, [theme, setTheme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
