import { apiClient } from './apiClient';
import type { Workshop, WorkshopsResponse, WorkshopResponse } from '../types/workshop.types';

export interface GetWorkshopsParams {
    page?: number;
    size_page?: number;
    event_id?: string;
    type_id?: string;
}

export interface CreateWorkshopBody {
    type_id: string;
    name: string;
    shortname?: string;
    code?: string;
    capacity: number;
    event_id: string;
}

export interface UpdateWorkshopBody {
    type_id: string;
    name: string;
    shortname?: string;
    code?: string;
    capacity: number;
}

export const workshopService = {
    getWorkshops(params: GetWorkshopsParams = {}): Promise<WorkshopsResponse> {
        const query = new URLSearchParams();
        if (params.page !== undefined) query.set('page', String(params.page));
        if (params.size_page !== undefined) query.set('size_page', String(params.size_page));
        if (params.event_id) query.set('event_id', params.event_id);
        if (params.type_id) query.set('type_id', params.type_id);
        const qs = query.toString();
        return apiClient.get<WorkshopsResponse>(`/event/workshops${qs ? `?${qs}` : ''}`);
    },

    async getWorkshopById(id: string): Promise<Workshop> {
        const res = await apiClient.get<WorkshopResponse>(`/event/workshops/${id}`);
        return res.data;
    },

    async createWorkshop(body: CreateWorkshopBody): Promise<string> {
        const res = await apiClient.post<{ data: string; status: number }>('/event/workshops', body);
        return res.data;
    },

    async updateWorkshop(id: string, body: UpdateWorkshopBody): Promise<string> {
        const res = await apiClient.put<{ data: string; status: number }>(`/event/workshops/${id}`, body);
        return res.data;
    },

    async deleteWorkshop(id: string): Promise<void> {
        await apiClient.delete<unknown>(`/event/workshops/${id}`);
    },
};
