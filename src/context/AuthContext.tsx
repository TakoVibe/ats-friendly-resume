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

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse user data", error);
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user");
            }
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
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
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
