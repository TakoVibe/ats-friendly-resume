import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ResumeProvider } from '../context/ResumeContext';
import { TokenProvider } from '../context/TokenContext';

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <TokenProvider>
                    <ResumeProvider>
                        {children}
                    </ResumeProvider>
                </TokenProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export function AuthOnlyProviders({ children }: ProvidersProps) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <TokenProvider>
                    {children}
                </TokenProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
