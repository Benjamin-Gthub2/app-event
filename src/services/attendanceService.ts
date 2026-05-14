import { apiClient, API_BASE } from './apiClient';
import type { Attendance, AttendancesResponse, CreateAttendanceBody } from '../types/attendance.types';

const TENANT_KEY = 'x_tenant_id';

export interface GetAttendancesParams {
    page?: number;
    size_page?: number;
    event_id?: string;
    workshop_id?: string;
    beneficiary_id?: string;
    start_date?: string;
    end_date?: string;
    searchvalue?: string;
}

interface AttendanceByIdResponse {
    data: Attendance;
    status: number;
}

function buildXlsxFilename(eventName?: string, workshopName?: string, beneficiaryName?: string): string {
    const parts = ['Reporte de Asistencias'];
    if (eventName) parts.push(eventName);
    if (workshopName) parts.push(workshopName);
    if (beneficiaryName) parts.push(beneficiaryName);
    return parts.join(' - ') + '.xlsx';
}

export const attendanceService = {
    getAttendances(params: GetAttendancesParams = {}): Promise<AttendancesResponse> {
        const query = new URLSearchParams();
        if (params.page !== undefined) query.set('page', String(params.page));
        if (params.size_page !== undefined) query.set('size_page', String(params.size_page));
        if (params.event_id) query.set('event_id', params.event_id);
        if (params.workshop_id) query.set('workshop_id', params.workshop_id);
        if (params.beneficiary_id) query.set('beneficiary_id', params.beneficiary_id);
        if (params.start_date) query.set('start_date', params.start_date);
        if (params.end_date) query.set('end_date', params.end_date);
        if (params.searchvalue) query.set('searchvalue', params.searchvalue);
        const qs = query.toString();
        return apiClient.get<AttendancesResponse>(`/event/attendances${qs ? `?${qs}` : ''}`);
    },

    async getAttendanceById(id: string): Promise<Attendance> {
        const res = await apiClient.get<AttendanceByIdResponse>(`/event/attendances/${id}`);
        return res.data;
    },

    async createAttendance(body: CreateAttendanceBody): Promise<string> {
        const res = await apiClient.post<{ data: string; status: number }>('/event/attendances', body);
        return res.data;
    },

    async deleteAttendance(id: string): Promise<void> {
        await apiClient.delete<unknown>(`/event/attendances/${id}`);
    },

    async downloadXlsxReport(params: Omit<GetAttendancesParams, 'page' | 'size_page'> & {
        event_name?: string;
        workshop_name?: string;
        beneficiary_name?: string;
    } = {}): Promise<void> {
        const query = new URLSearchParams();
        if (params.event_id) query.set('event_id', params.event_id);
        if (params.workshop_id) query.set('workshop_id', params.workshop_id);
        if (params.beneficiary_id) query.set('beneficiary_id', params.beneficiary_id);
        if (params.start_date) query.set('start_date', params.start_date);
        if (params.end_date) query.set('end_date', params.end_date);
        if (params.searchvalue) query.set('searchvalue', params.searchvalue);
        if (params.event_name) query.set('event_name', params.event_name);
        if (params.workshop_name) query.set('workshop_name', params.workshop_name);
        if (params.beneficiary_name) query.set('beneficiary_name', params.beneficiary_name);
        const qs = query.toString();

        const headers: Record<string, string> = {};
        const token = localStorage.getItem('auth_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const tenantId = localStorage.getItem(TENANT_KEY);
        if (tenantId) headers['X-Tenant-Id'] = tenantId;

        const response = await fetch(
            `${API_BASE}/event/attendances/xlsx_report${qs ? `?${qs}` : ''}`,
            { headers },
        );

        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem(TENANT_KEY);
            window.location.href = '/';
            throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
        }
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = buildXlsxFilename(params.event_name, params.workshop_name, params.beneficiary_name);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
};
