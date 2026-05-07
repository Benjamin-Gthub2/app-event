export interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
}

// Respuesta real del backend: POST /api/v1/auth/login
export interface LoginApiResponse {
    data: string; // JWT token
    status: number;
}

export interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
}

export interface LoginCredentials {
    username: string; // el backend espera "username", no "email"
    password: string;
}
