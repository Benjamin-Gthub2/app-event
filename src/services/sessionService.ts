import { apiClient } from './apiClient';
import type { Session, SessionsResponse, SessionResponse } from '../types/session.types';

export interface GetSessionsParams {
    page?: number;
    size_page?: number;
    workshop_id?: string;
    start_date?: string;
    end_date?: string;
}

export interface CreateSessionBody {
    workshop_id: string;
    start_date: string;
    end_date: string;
}

export interface UpdateSessionBody {
    start_date: string;
    end_date: string;
}

export const sessionService = {
    getSessions(params: GetSessionsParams = {}): Promise<SessionsResponse> {
        const query = new URLSearchParams();
        if (params.page !== undefined) query.set('page', String(params.page));
        if (params.size_page !== undefined) query.set('size_page', String(params.size_page));
        if (params.workshop_id) query.set('workshop_id', params.workshop_id);
        if (params.start_date) query.set('start_date', params.start_date);
        if (params.end_date) query.set('end_date', params.end_date);
        const qs = query.toString();
        return apiClient.get<SessionsResponse>(`/event/sessions${qs ? `?${qs}` : ''}`);
    },

    async getSessionById(id: string): Promise<Session> {
        const res = await apiClient.get<SessionResponse>(`/event/sessions/${id}`);
        return res.data;
    },

    async createSession(body: CreateSessionBody): Promise<string> {
        const res = await apiClient.post<{ data: string; status: number }>('/event/sessions', body);
        return res.data;
    },

    async updateSession(id: string, body: UpdateSessionBody): Promise<string> {
        const res = await apiClient.put<{ data: string; status: number }>(`/event/sessions/${id}`, body);
        return res.data;
    },

    async deleteSession(id: string): Promise<void> {
        await apiClient.delete<unknown>(`/event/sessions/${id}`);
    },
};
