import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

interface TokenLedgerEntry {
    amount: number;
    transaction_type: string;
    product: string;
    action_type: string;
    description: string;
    created_at: string;
}

interface TokenContextType {
    tokenBalance: number;
    totalConsumed: number;
    history: TokenLedgerEntry[];
    isLoading: boolean;
    fetchTokenData: () => Promise<void>;
    useTokens: (actionType: string, tokensRequired: number, product?: string) => Promise<boolean>;
    showUpgradeModal: boolean;
    setShowUpgradeModal: (show: boolean) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    const [tokenBalance, setTokenBalance] = useState<number>(0);
    const [totalConsumed, setTotalConsumed] = useState<number>(0);
    const [history, setHistory] = useState<TokenLedgerEntry[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

    const fetchTokenData = async () => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        try {
            const response = await api.get('/api/users/tokens/');
            if (response.ok) {
                const data = await response.json();
                setTokenBalance(data.token_balance);
                setTotalConsumed(data.total_consumed);
                setHistory(data.history || []);
            }
        } catch (error) {
            console.error('Failed to fetch token data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchTokenData();
        } else {
            // Reset for unauthenticated users
            setTokenBalance(50);
            setTotalConsumed(0);
            setHistory([]);
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const useTokens = async (actionType: string, tokensRequired: number, product = 'resumevibe') => {
        if (!isAuthenticated) {
            window.dispatchEvent(new CustomEvent('show-login-modal'));
            return false;
        }

        if (tokenBalance < tokensRequired) {
            setShowUpgradeModal(true);
            return false;
        }

        try {
            const requestId = `${actionType}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            const response = await api.post('/api/users/tokens/use/', {
                action_type: actionType,
                tokens: tokensRequired,
                product,
                request_id: requestId,
            });

            if (response.ok) {
                const data = await response.json();
                setTokenBalance(data.token_balance);
                fetchTokenData();
                return true;
            } else if (response.status === 402) {
                setShowUpgradeModal(true);
                return false;
            }
            return false;
        } catch (error) {
            console.error('Failed to use tokens:', error);
            return false;
        }
    };

    return (
        <TokenContext.Provider value={{
            tokenBalance,
            totalConsumed,
            history,
            isLoading,
            fetchTokenData,
            useTokens,
            showUpgradeModal,
            setShowUpgradeModal
        }}>
            {children}
        </TokenContext.Provider>
    );
}

export function useToken() {
    const context = useContext(TokenContext);
    if (context === undefined) {
        throw new Error('useToken must be used within a TokenProvider');
    }
    return context;
}
