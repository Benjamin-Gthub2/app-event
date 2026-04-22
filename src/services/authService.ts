import { apiClient } from './apiClient';
import type { LoginApiResponse, LoginCredentials } from '../types/auth.types';

export const authService = {
    async login(credentials: LoginCredentials): Promise<LoginApiResponse> {
        try {
            return await apiClient.post<LoginApiResponse>('/auth/login', credentials, false);
        } catch {
            throw new Error('Credenciales incorrectas. Verifica tu usuario y contraseña.');
        }
    },

    saveToken(token: string): void {
        localStorage.setItem('auth_token', token);
    },

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    },

    removeToken(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('x_tenant_id');
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    },
};
