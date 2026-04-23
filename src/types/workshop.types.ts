import type { Pagination } from './common.types';

export interface WorkshopTypeRef {
    id: string;
    code: string;
    description: string;
}

export interface WorkshopEventRef {
    id: string;
    name: string;
    code: string;
}

export interface WorkshopCreatedBy {
    id: string;
    username: string;
}

export interface Workshop {
    id: string;
    name: string;
    shortname: string | null;
    code: string | null;
    capacity: number;
    created_at: string | null;
    workshop_type?: WorkshopTypeRef;
    event?: WorkshopEventRef;
    created_by?: WorkshopCreatedBy;
}

export interface WorkshopsResponse {
    data: Workshop[];
    pagination: Pagination;
    status: number;
}

export interface WorkshopResponse {
    data: Workshop;
    status: number;
}
