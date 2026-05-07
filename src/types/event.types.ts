import type { Pagination } from './common.types';

export interface EventFile {
    id: string | null;
    name: string | null;
    weight: string | null;
    url: string | null;
    created_at: string | null;
}

export interface EventDocumentType {
    id: string | null;
    number: string | null;
    description: string | null;
    abbreviated_description: string | null;
}

export interface EventPerson {
    id: string | null;
    document: string | null;
    names: string | null;
    surname: string | null;
    last_name: string | null;
    phone: string | null;
    email: string | null;
    gender: string | null;
    enable: boolean | null;
    created_at: string | null;
    document_type: EventDocumentType | null;
}

export interface EventUser {
    id: string | null;
    user_role_id: string | null;
    person: EventPerson | null;
}

export interface EventModule {
    id: string | null;
    name: string | null;
    description: string | null;
    code: string | null;
    icon: string | null;
    position: number;
    created_at: string | null;
}

export interface EventPolicy {
    id: string;
    name: string;
    description: string;
    level: string;
    enable: boolean | null;
    created_at: string | null;
    module: EventModule;
}

export interface EventRole {
    id: string;
    name: string | null;
    description: string | null;
    enable: boolean | null;
    created_at: string | null;
    policies: EventPolicy[];
    users: EventUser[];
}

export interface Event {
    id: string;
    name: string;
    description: string;
    code: string | null;
    // phone: string | null;
    // document: string;
    // address: string;
    // industry: string;
    enable: boolean;
    created_at: string | null;
    // event_files: EventFile[];
}

export interface EventsResponse {
    data: Event[];
    pagination: Pagination;
    status: number;
}

export interface EventRolesResponse {
    data: EventRole[];
    status: number;
}

export interface EventSums {
    id: string;
    name: string;
    total_registrations: number;
    total_payments: number;
    total_presences: number;
}

export interface EventSummaryResponse {
    data: EventSums[];
    status: number;
}
