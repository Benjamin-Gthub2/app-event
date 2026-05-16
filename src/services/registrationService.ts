import { apiClient, API_BASE } from './apiClient';
import type { Registration, RegistrationsResponse, RegistrationsByEventResponse } from '../types/registration.types';

export interface GetRegistrationsParams {
    page?: number;
    size_page?: number;
    start_date?: string;
    end_date?: string;
    created_by?: string;
    searchvalue?: string;
}

export interface CreateRegistrationBody {
    event_id: string;
    beneficiary_id: string;
}

interface RegistrationByIdResponse {
    data: Registration;
    status: number;
}

interface CreateRegistrationResponse {
    data: string;
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
        if (params.searchvalue) query.set('searchvalue', params.searchvalue);

        const qs = query.toString();
        return apiClient.get<RegistrationsResponse>(`/event/registrations${qs ? `?${qs}` : ''}`);
    },

    async getRegistrationById(id: string): Promise<Registration> {
        const res = await apiClient.get<RegistrationByIdResponse>(`/event/registrations/${id}`);
        return res.data;
    },

    async getRegistrationsByEvent(eventId: string): Promise<RegistrationsByEventResponse> {
        return apiClient.get<RegistrationsByEventResponse>(`/event/registrations/by_event/${eventId}`);
    },

    async createRegistration(body: CreateRegistrationBody): Promise<string> {
        const res = await apiClient.post<CreateRegistrationResponse>('/event/registrations', body);
        return res.data;
    },

    async updateRegistrationStatus(registrationId: string, statusCode: string): Promise<void> {
        await apiClient.put<unknown>(`/event/registrations/${registrationId}/statuses/${statusCode}`, {});
    },

    async sendQrWhatsApp(registrationId: string, phoneNumber: string): Promise<void> {
        await apiClient.post<unknown>(`/event/registrations/${registrationId}/send_qr_whatsapp`, { phone_number: phoneNumber });
    },

    async getQrBlobUrl(id: string): Promise<string> {
        const token = localStorage.getItem('auth_token');
        const tenantId = localStorage.getItem('x_tenant_id');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (tenantId) headers['X-Tenant-Id'] = tenantId;

        const response = await fetch(`${API_BASE}/event/registrations/${id}/qr`, { headers });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    },

    async fetchCertificatePdfBlob(id: string): Promise<{ blobUrl: string; fileName: string }> {
        const token = localStorage.getItem('auth_token');
        const tenantId = localStorage.getItem('x_tenant_id');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (tenantId) headers['X-Tenant-Id'] = tenantId;

        const response = await fetch(`${API_BASE}/event/registrations/${id}/certificate`, { headers });
        if (!response.ok) throw new Error(`Error ${response.status}`);

        const disposition = response.headers.get('Content-Disposition') ?? '';
        const match = disposition.match(/filename="([^"]+)"/);
        const fileName = match?.[1] ?? `${id}_certificado.pdf`;

        const blob = await response.blob();
        return { blobUrl: URL.createObjectURL(blob), fileName };
    },

    async downloadCertificatePdf(id: string): Promise<void> {
        const { blobUrl, fileName } = await registrationService.fetchCertificatePdfBlob(id);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    },
};
