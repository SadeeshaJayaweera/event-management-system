'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light';

interface ThemeContextType {
    theme: Theme;
    actualTheme: 'light';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme] = useState<Theme>('light');
    const actualTheme = 'light';

    useEffect(() => {
        // Enforce light mode on document
        document.documentElement.classList.remove('dark');
        // Clear any saved theme from localStorage
        localStorage.removeItem('theme');
    }, []);

    const setTheme = () => {
        // Do nothing, only light mode allowed
    };

    const toggleTheme = () => {
        // Do nothing, only light mode allowed
    };

    return (
        <ThemeContext.Provider value={{ theme, actualTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
