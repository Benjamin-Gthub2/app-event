import type { Pagination } from './common.types';

export interface WorkshopTypeCreatedBy {
    id: string;
    username: string;
}

export interface WorkshopType {
    id: string;
    code: string;
    description: string;
    enable: boolean;
    created_at: string | null;
    created_by?: WorkshopTypeCreatedBy;
}

export interface WorkshopTypesResponse {
    data: WorkshopType[];
    pagination: Pagination;
    status: number;
}

export interface WorkshopTypeResponse {
    data: WorkshopType;
    status: number;
}
