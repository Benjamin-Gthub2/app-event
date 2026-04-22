import { apiClient } from './apiClient';
import type { RegistrationsResponse } from '../types/registration.types';

export interface GetRegistrationsParams {
    page?: number;
    size_page?: number;
    start_date?: string;
    end_date?: string;
    created_by?: string;
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
};
