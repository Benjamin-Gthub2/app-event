import type {Pagination} from './common.types';

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

export interface WorkshopSums {
    id: string | null;
    name: string | null;
    capacity: number | null;
    total_registrations: number | null;
    total_payments: number | null;
    total_presences: number | null;
}

export interface WorkshopSummaryResponse {
    data: WorkshopSums[];
    status: number;
}
