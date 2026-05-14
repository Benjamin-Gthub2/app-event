import { apiClient } from './apiClient';
import type { EventType, EventTypesResponse, EventTypeResponse } from '../types/eventType.types';

export interface GetEventTypesParams {
    page?: number;
    size_page?: number;
    searchvalue?: string;
}

export interface CreateEventTypeBody {
    code: string;
    description: string;
    enable?: boolean;
}

export interface UpdateEventTypeBody {
    code: string;
    description: string;
    enable?: boolean;
}

export const eventTypeService = {
    getEventTypes(params: GetEventTypesParams = {}): Promise<EventTypesResponse> {
        const query = new URLSearchParams();
        if (params.page !== undefined) query.set('page', String(params.page));
        if (params.size_page !== undefined) query.set('size_page', String(params.size_page));
        if (params.searchvalue) query.set('searchvalue', params.searchvalue);
        const qs = query.toString();
        return apiClient.get<EventTypesResponse>(`/event/event-types${qs ? `?${qs}` : ''}`);
    },

    async getEventTypeById(id: string): Promise<EventType> {
        const res = await apiClient.get<EventTypeResponse>(`/event/event-types/${id}`);
        return res.data;
    },

    async createEventType(body: CreateEventTypeBody): Promise<string> {
        const res = await apiClient.post<{ data: string; status: number }>('/event/event-types', body);
        return res.data;
    },

    async updateEventType(id: string, body: UpdateEventTypeBody): Promise<string> {
        const res = await apiClient.put<{ data: string; status: number }>(`/event/event-types/${id}`, body);
        return res.data;
    },

    async deleteEventType(id: string): Promise<void> {
        await apiClient.delete<unknown>(`/event/event-types/${id}`);
    },
};
