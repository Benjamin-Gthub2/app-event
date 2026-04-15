const API_URL = import.meta.env.VITE_API_URL;

export async function fetchAPI<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`);

    if (!res.ok) {
        throw new Error("API error");
    }

    return res.json();
}