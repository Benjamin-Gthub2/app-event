import type { Pagination } from './common.types';

export interface UserType {
    id: string;
    description: string;
    code: string;
    enable: boolean;
    created_at: string | null;
}

export interface UserTypesResponse {
    data: UserType[];
    pagination: Pagination;
    status: number;
}

export interface UserTypeResponse {
    data: UserType;
    status: number;
}
