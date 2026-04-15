import type { LoginApiResponse, LoginCredentials } from '../types/auth.types';

const API_BASE = '/api/v1';

export const authService = {
    async login(credentials: LoginCredentials): Promise<LoginApiResponse> {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        const data: LoginApiResponse = await response.json();

        if (!response.ok) {
            throw new Error('Credenciales incorrectas. Verifica tu usuario y contraseña.');
        }

        return data;
    },

    saveToken(token: string): void {
        localStorage.setItem('auth_token', token);
    },

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    },

    removeToken(): void {
        localStorage.removeItem('auth_token');
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    },
};
