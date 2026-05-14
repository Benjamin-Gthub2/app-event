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

export interface AppView {
    id: string;
    name: string;
    description: string;
    position: number | null;
    url: string;
    icon: string;
    created_at: string | null;
}

export interface UserPerson {
    id: string | null;
    names: string | null;
    surname: string | null;
    last_name: string | null;
    document: string | null;
    phone: string | null;
    email: string | null;
    gender: string | null;
    enable: boolean | null;
}

export interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    views: AppView[];
    person: UserPerson | null;
}

export interface LoginCredentials {
    username: string; // el backend espera "username", no "email"
    password: string;
}
