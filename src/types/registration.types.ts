import type {Pagination} from './common.types';

export type {Pagination};

export interface TypeDocument {
    id: string;
    description: string;
    abbreviated_description: string;
    enable: string;
}

export interface TypeUser {
    id: string | null;
    description: string | null;
    code: string | null;
    created_at: string | null;
}

export interface User {
    id: string | null;
    username: string | null;
    type_user: TypeUser;
}

export interface Beneficiary {
    id: string;
    user: User;
    type_document: TypeDocument;
    document: string;
    names: string;
    surname: string;
    last_name: string | null;
}

export interface RegistrationEvent {
    id: string;
    name: string;
    description: string;
    created_at: string | null;
}

export interface Status {
    id: string;
    code: string;
    description: string;
    position: number;
    enable: boolean;
    created_at: string | null;
}

export interface CreatedBy {
    id: string;
    user: User;
    type_document: TypeDocument;
    document: string;
    names: string;
    surname: string;
    last_name: string | null;
}

export interface Registration {
    id: string;
    send_qr: boolean;
    send_certificate: boolean;
    created_at: string | null;
    status: Status;
    event: RegistrationEvent;
    beneficiary: Beneficiary;
    created_by: CreatedBy;
}

export interface RegistrationsResponse {
    data: Registration[];
    pagination: Pagination;
    status: number;
}
