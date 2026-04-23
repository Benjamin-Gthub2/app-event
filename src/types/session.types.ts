import type { Pagination } from './common.types';

export interface SessionWorkshopRef {
    id: string;
    name: string;
    shortname: string | null;
    code: string | null;
    capacity: number;
}

export interface SessionCreatedBy {
    id: string;
    username: string;
}

export interface Session {
    id: string;
    start_date: string | null;
    end_date: string | null;
    created_at: string | null;
    workshop?: SessionWorkshopRef;
    created_by?: SessionCreatedBy;
}

export interface SessionsResponse {
    data: Session[];
    pagination: Pagination;
    status: number;
}

export interface SessionResponse {
    data: Session;
    status: number;
}
