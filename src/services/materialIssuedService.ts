import { apiClient } from './apiClient';
import type { MaterialIssued, MaterialsIssuedResponse } from '../types/materialIssued.types';

export interface GetMaterialsIssuedParams {
    page?: number;
    size_page?: number;
    start_date?: string;
    end_date?: string;
}

export interface CreateMaterialIssuedBody {
    description?: string;
}

export interface UpdateMaterialIssuedBody {
    description?: string;
}

interface MaterialIssuedByIdResponse {
    data: MaterialIssued;
    status: number;
}

export const materialIssuedService = {
    getMaterialsIssued(params: GetMaterialsIssuedParams = {}): Promise<MaterialsIssuedResponse> {
        const query = new URLSearchParams();
        if (params.page !== undefined) query.set('page', String(params.page));
        if (params.size_page !== undefined) query.set('size_page', String(params.size_page));
        if (params.start_date) query.set('start_date', params.start_date);
        if (params.end_date) query.set('end_date', params.end_date);
        const qs = query.toString();
        return apiClient.get<MaterialsIssuedResponse>(`/event/materials-issued${qs ? `?${qs}` : ''}`);
    },

    async getMaterialIssuedById(id: string): Promise<MaterialIssued> {
        const res = await apiClient.get<MaterialIssuedByIdResponse>(`/event/materials-issued/${id}`);
        return res.data;
    },

    async createMaterialIssued(body: CreateMaterialIssuedBody): Promise<string> {
        const res = await apiClient.post<{ data: string; status: number }>('/event/materials-issued', body);
        return res.data;
    },

    async updateMaterialIssued(id: string, body: UpdateMaterialIssuedBody): Promise<string> {
        const res = await apiClient.put<{ data: string; status: number }>(`/event/materials-issued/${id}`, body);
        return res.data;
    },

    async deleteMaterialIssued(id: string): Promise<void> {
        await apiClient.delete<unknown>(`/event/materials-issued/${id}`);
    },
};
