import { apiClient } from './apiClient';
import type { Attendance, AttendancesResponse } from '../types/attendance.types';

export interface GetAttendancesParams {
    page?: number;
    size_page?: number;
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
        if (params.start_date) query.set('start_date', params.start_date);
        if (params.end_date) query.set('end_date', params.end_date);
        const qs = query.toString();
        return apiClient.get<AttendancesResponse>(`/event/attendances${qs ? `?${qs}` : ''}`);
    },

    async getAttendanceById(id: string): Promise<Attendance> {
        const res = await apiClient.get<AttendanceByIdResponse>(`/event/attendances/${id}`);
        return res.data;
    },

    async createAttendance(): Promise<string> {
        const res = await apiClient.post<{ data: string; status: number }>('/event/attendances', {});
        return res.data;
    },

    async deleteAttendance(id: string): Promise<void> {
        await apiClient.delete<unknown>(`/event/attendances/${id}`);
    },
};
