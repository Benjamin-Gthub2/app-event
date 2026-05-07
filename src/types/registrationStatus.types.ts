import type { Pagination } from './common.types';

export interface RegistrationStatus {
    id: string;
    code: string;
    description: string;
    position: number;
    enable: boolean;
    created_at: string | null;
}

export interface RegistrationStatusesResponse {
    data: RegistrationStatus[];
    pagination: Pagination;
    status: number;
}
