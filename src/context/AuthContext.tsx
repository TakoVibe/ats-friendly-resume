import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "../lib/api";

interface User {
    email: string;
    first_name: string;
    last_name: string;
    profile_image?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("user");
        const loginTime = localStorage.getItem("login_time");

        if (token && storedUser && loginTime) {
            const now = new Date().getTime();
            const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
            const isExpired = now - parseInt(loginTime) > threeDaysInMs;

            if (isExpired) {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user");
                localStorage.removeItem("login_time");
                setUser(null);
            } else {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error("Failed to parse user data", error);
                    localStorage.removeItem("auth_token");
                    localStorage.removeItem("user");
                    localStorage.removeItem("login_time");
                }
            }
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, userData: User) => {
        const now = new Date().getTime();
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("login_time", now.toString());
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        localStorage.removeItem("login_time");
        setUser(null);
        window.location.reload();
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        // Return safe default for SSR to prevent crashes
        if (typeof window === "undefined") {
            return { user: null, isAuthenticated: false, login: () => { }, logout: () => { }, isLoading: false };
        }
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
