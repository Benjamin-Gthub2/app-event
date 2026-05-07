import type { Pagination } from './common.types';

export interface MaterialIssuedCreatedBy {
    id: string;
    username: string;
}

export interface MaterialIssued {
    id: string;
    description: string | null;
    created_at: string | null;
    created_by: MaterialIssuedCreatedBy;
}

export interface MaterialsIssuedResponse {
    data: MaterialIssued[];
    pagination: Pagination;
    status: number;
}
