import { apiClient } from './apiClient';
import type { Registration, RegistrationsResponse } from '../types/registration.types';

export interface GetRegistrationsParams {
    page?: number;
    size_page?: number;
    start_date?: string;
    end_date?: string;
    created_by?: string;
}

interface RegistrationByIdResponse {
    data: Registration;
    status: number;
}

export const registrationService = {
    getRegistrations(params: GetRegistrationsParams = {}): Promise<RegistrationsResponse> {
        const query = new URLSearchParams();
        if (params.page !== undefined) query.set('page', String(params.page));
        if (params.size_page !== undefined) query.set('size_page', String(params.size_page));
        if (params.start_date) query.set('start_date', params.start_date);
        if (params.end_date) query.set('end_date', params.end_date);
        if (params.created_by) query.set('created_by', params.created_by);

        const qs = query.toString();
        return apiClient.get<RegistrationsResponse>(`/event/registrations${qs ? `?${qs}` : ''}`);
    },

    async getRegistrationById(id: string): Promise<Registration> {
        const res = await apiClient.get<RegistrationByIdResponse>(`/event/registrations/${id}`);
        return res.data;
    },

    async getQrBlobUrl(id: string): Promise<string> {
        const token = localStorage.getItem('auth_token');
        const tenantId = localStorage.getItem('x_tenant_id');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (tenantId) headers['X-Tenant-Id'] = tenantId;

        const response = await fetch(`/api/v1/event/registrations/${id}/qr`, { headers });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    },
};
