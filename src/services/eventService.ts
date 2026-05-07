import { apiClient } from './apiClient';
import type { EventsResponse, EventRolesResponse, EventSummaryResponse } from '../types/event.types';

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
        return apiClient.get<EventsResponse>(`/event/events${qs ? `?${qs}` : ''}`);
    },

    async getRolesByEvent(id: string): Promise<EventRolesResponse> {
        return apiClient.get<EventRolesResponse>(`/event/events/${id}/roles`);
    },

    getEventSummary(event_id?: string): Promise<EventSummaryResponse> {
        const query = new URLSearchParams();
        if (event_id) query.set('event_id', event_id);
        const qs = query.toString();
        return apiClient.get<EventSummaryResponse>(`/event/events/summary${qs ? `?${qs}` : ''}`);
    },

    async createEvent(body: CreateEventBody): Promise<string> {
        const res = await apiClient.post<{ data: string; status: number }>('/event/events', body);
        return res.data;
    },

    async updateEvent(id: string, body: UpdateEventBody): Promise<string> {
        const res = await apiClient.put<{ data: string; status: number }>(`/event/events/${id}`, body);
        return res.data;
    },

    async toggleEventEnable(id: string, enable: boolean): Promise<string> {
        const res = await apiClient.put<{ data: string; status: number }>(`/event/events/${id}/enable`, { enable });
        return res.data;
    },

    async deleteEvent(id: string): Promise<void> {
        await apiClient.delete<unknown>(`/event/events/${id}`);
    },
};
