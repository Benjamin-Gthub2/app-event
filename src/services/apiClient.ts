const API_BASE = '/api/v1';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

async function request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    requiresAuth = true,
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (requiresAuth) {
        const token = localStorage.getItem('auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/';
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }

    const data: T = await response.json();

    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return data;
}

export const apiClient = {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body: unknown, requiresAuth = true) =>
        request<T>('POST', path, body, requiresAuth),
    put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
    delete: <T>(path: string) => request<T>('DELETE', path),
    patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
};
