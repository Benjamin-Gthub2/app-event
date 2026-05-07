import type { Pagination } from './common.types';

export interface AttendanceCreatedBy {
    id: string;
    username: string;
}

export interface Attendance {
    id: string;
    created_at: string | null;
    created_by: AttendanceCreatedBy;
}

export interface AttendancesResponse {
    data: Attendance[];
    pagination: Pagination;
    status: number;
}
