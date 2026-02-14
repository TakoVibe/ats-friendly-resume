import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ResumeProvider } from '../context/ResumeContext';

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ResumeProvider>
                    {children}
                </ResumeProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export function AuthOnlyProviders({ children }: ProvidersProps) {
    return (
        <ThemeProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </ThemeProvider>
    );
}
