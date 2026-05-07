import { apiClient } from './apiClient';
import type { RegistrationStatus, RegistrationStatusesResponse } from '../types/registrationStatus.types';

export interface GetRegistrationStatusesParams {
    page?: number;
    size_page?: number;
}

export interface CreateRegistrationStatusBody {
    code: string;
    description: string;
    position: number;
    enable: boolean;
}

export interface UpdateRegistrationStatusBody {
    code: string;
    description: string;
    position: number;
    enable: boolean;
}

interface RegistrationStatusByIdResponse {
    data: RegistrationStatus;
    status: number;
}

export const registrationStatusService = {
    getRegistrationStatuses(params: GetRegistrationStatusesParams = {}): Promise<RegistrationStatusesResponse> {
        const query = new URLSearchParams();
        if (params.page !== undefined) query.set('page', String(params.page));
        if (params.size_page !== undefined) query.set('size_page', String(params.size_page));
        const qs = query.toString();
        return apiClient.get<RegistrationStatusesResponse>(`/event/registration-statuses${qs ? `?${qs}` : ''}`);
    },

    async getRegistrationStatusById(id: string): Promise<RegistrationStatus> {
        const res = await apiClient.get<RegistrationStatusByIdResponse>(`/event/registration-statuses/${id}`);
        return res.data;
    },

    async createRegistrationStatus(body: CreateRegistrationStatusBody): Promise<string> {
        const res = await apiClient.post<{ data: string; status: number }>('/event/registration-statuses', body);
        return res.data;
    },

    async updateRegistrationStatus(id: string, body: UpdateRegistrationStatusBody): Promise<string> {
        const res = await apiClient.put<{ data: string; status: number }>(`/event/registration-statuses/${id}`, body);
        return res.data;
    },

    async deleteRegistrationStatus(id: string): Promise<void> {
        await apiClient.delete<unknown>(`/event/registration-statuses/${id}`);
    },
};
