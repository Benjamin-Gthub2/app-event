import type { Pagination } from './common.types';

export interface EventType {
    id: string;
    code: string;
    description: string;
    enable: boolean;
    created_at: string | null;
}

export interface EventTypesResponse {
    data: EventType[];
    pagination: Pagination;
    status: number;
}

export interface EventTypeResponse {
    data: EventType;
    status: number;
}
