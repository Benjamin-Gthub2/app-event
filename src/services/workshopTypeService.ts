import { apiClient } from './apiClient';
import type { WorkshopType, WorkshopTypesResponse, WorkshopTypeResponse } from '../types/workshopType.types';

export interface GetWorkshopTypesParams {
    page?: number;
    size_page?: number;
    searchvalue?: string;
}

export interface CreateWorkshopTypeBody {
    code: string;
    description: string;
    enable?: boolean;
}

export interface UpdateWorkshopTypeBody {
    code: string;
    description: string;
    enable?: boolean;
}

export const workshopTypeService = {
    getWorkshopTypes(params: GetWorkshopTypesParams = {}): Promise<WorkshopTypesResponse> {
        const query = new URLSearchParams();
        if (params.page !== undefined) query.set('page', String(params.page));
        if (params.size_page !== undefined) query.set('size_page', String(params.size_page));
        if (params.searchvalue) query.set('searchvalue', params.searchvalue);
        const qs = query.toString();
        return apiClient.get<WorkshopTypesResponse>(`/event/workshop-types${qs ? `?${qs}` : ''}`);
    },

    async getWorkshopTypeById(id: string): Promise<WorkshopType> {
        const res = await apiClient.get<WorkshopTypeResponse>(`/event/workshop-types/${id}`);
        return res.data;
    },

    async createWorkshopType(body: CreateWorkshopTypeBody): Promise<string> {
        const res = await apiClient.post<{ data: string; status: number }>('/event/workshop-types', body);
        return res.data;
    },

    async updateWorkshopType(id: string, body: UpdateWorkshopTypeBody): Promise<string> {
        const res = await apiClient.put<{ data: string; status: number }>(`/event/workshop-types/${id}`, body);
        return res.data;
    },

    async deleteWorkshopType(id: string): Promise<void> {
        await apiClient.delete<unknown>(`/event/workshop-types/${id}`);
    },
};
