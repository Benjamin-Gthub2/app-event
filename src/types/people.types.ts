import type { Pagination } from './common.types';

export interface PersonDocumentType {
    id: string;
    description: string;
    abbreviated_description: string;
}

export interface PersonUserRef {
    id: string | null;
    username: string | null;
    created_at: string | null;
}

export interface Person {
    id: string;
    document: string;
    names: string;
    surname: string;
    last_name: string | null;
    phone: string | null;
    email: string | null;
    gender: string | null;
    enable: boolean;
    created_at: string | null;
    document_type: PersonDocumentType;
    user?: PersonUserRef;
}

export interface PeopleResponse {
    data: Person[];
    pagination: Pagination;
    status: number;
}
