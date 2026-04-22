export interface TypeDocument {
    id: string;
    description: string;
    abbreviated_description: string;
    enable: string;
}

export interface TypeUser {
    id: string;
    description: string;
    code: string;
    created_at: string | null;
}

export interface User {
    id: string;
    username: string;
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

export interface WorkShop {
    id: string;
    name: string;
}

export interface Session {
    id: string;
    start_date: string | null;
    end_date: string | null;
    created_at: string | null;
    work_shop: WorkShop;
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
    created_at: string | null;
    session: Session;
    beneficiary: Beneficiary;
    created_by: CreatedBy;
}

export interface Pagination {
    page: number;
    size_page: number;
    total: number;
    total_pages: number;
}

export interface RegistrationsResponse {
    data: Registration[];
    pagination: Pagination;
    status: number;
}
