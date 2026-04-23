import { apiClient } from './apiClient';
import type { Event, EventsResponse, EventRolesResponse } from '../types/event.types';

export interface GetEventsParams {
    page?: number;
    size_page?: number;
    status?: boolean;
    name_or_document?: string;
}

export interface CreateEventBody {
    name: string;
    description: string;
    code: string;
    phone?: string;
    document: string;
    address: string;
    industry: string;
    enable: boolean;
}

export interface UpdateEventBody {
    name: string;
    description: string;
    code: string;
    phone?: string;
    document: string;
    address: string;
    industry: string;
    enable: boolean;
}

export const eventService = {
    getEvents(params: GetEventsParams = {}): Promise<EventsResponse> {
        const query = new URLSearchParams();
        if (params.page !== undefined) query.set('page', String(params.page));
        if (params.size_page !== undefined) query.set('size_page', String(params.size_page));
        if (params.status !== undefined) query.set('status', String(params.status));
        if (params.name_or_document) query.set('name_or_document', params.name_or_document);
        const qs = query.toString();
        return apiClient.get<EventsResponse>(`/core/events${qs ? `?${qs}` : ''}`);
    },

    async getRolesByEvent(id: string): Promise<EventRolesResponse> {
        return apiClient.get<EventRolesResponse>(`/core/events/${id}/roles`);
    },

    async createEvent(body: CreateEventBody): Promise<string> {
        const res = await apiClient.post<{ data: string; status: number }>('/core/events', body);
        return res.data;
    },

    async updateEvent(id: string, body: UpdateEventBody): Promise<string> {
        const res = await apiClient.put<{ data: string; status: number }>(`/core/events/${id}`, body);
        return res.data;
    },

    async toggleEventEnable(id: string, enable: boolean): Promise<string> {
        const res = await apiClient.put<{ data: string; status: number }>(`/core/events/${id}/enable`, { enable });
        return res.data;
    },

    async deleteEvent(id: string): Promise<void> {
        await apiClient.delete<unknown>(`/core/events/${id}`);
    },
};
