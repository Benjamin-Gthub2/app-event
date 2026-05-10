import { apiClient } from './apiClient';
import type { Attendance, AttendancesResponse, CreateAttendanceBody } from '../types/attendance.types';

export interface GetAttendancesParams {
    page?: number;
    size_page?: number;
    event_id?: string;
    workshop_id?: string;
    beneficiary_id?: string;
    start_date?: string;
    end_date?: string;
}

interface AttendanceByIdResponse {
    data: Attendance;
    status: number;
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
};
