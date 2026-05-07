import { createContext, useContext, useState, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { AuthState } from '../types/auth.types';

interface AuthContextValue extends AuthState {
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        token: authService.getToken(),
        isAuthenticated: authService.isAuthenticated(),
    });

    const login = (token: string) => {
        authService.saveToken(token);
        setState({ token, isAuthenticated: true });
    };

    const logout = () => {
        authService.removeToken();
        setState({ token: null, isAuthenticated: false });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return ctx;
}
