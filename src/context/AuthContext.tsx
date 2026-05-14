import { createContext, useContext, useState, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { AuthState, AppView, UserPerson } from '../types/auth.types';

const VIEWS_KEY = 'auth_views_data';

function loadStoredViewsData(): { views: AppView[]; person: UserPerson | null } {
    try {
        const stored = localStorage.getItem(VIEWS_KEY);
        if (stored) return JSON.parse(stored) as { views: AppView[]; person: UserPerson | null };
    } catch { /* ignore */ }
    return { views: [], person: null };
}

interface AuthContextValue extends AuthState {
    login: (token: string, views: AppView[], person: UserPerson | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(() => {
        const stored = loadStoredViewsData();
        return {
            token: authService.getToken(),
            isAuthenticated: authService.isAuthenticated(),
            views: stored.views,
            person: stored.person,
        };
    });

    const login = (token: string, views: AppView[], person: UserPerson | null) => {
        authService.saveToken(token);
        localStorage.setItem(VIEWS_KEY, JSON.stringify({ views, person }));
        setState({ token, isAuthenticated: true, views, person });
    };

    const logout = () => {
        authService.removeToken();
        localStorage.removeItem(VIEWS_KEY);
        setState({ token: null, isAuthenticated: false, views: [], person: null });
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
