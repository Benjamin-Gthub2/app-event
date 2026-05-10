import type { Pagination } from './common.types';

export interface AttendanceCreatedBy {
    id: string;
    username: string;
}

export interface AttendanceWorkshopType {
    id: string;
    code: string;
    description: string;
}

export interface AttendanceEvent {
    id: string;
    name: string;
    code: string | null;
}

export interface AttendanceWorkshop {
    id: string;
    name: string;
    shortname: string | null;
    code: string | null;
    capacity: number;
    created_at: string | null;
    workshop_type: AttendanceWorkshopType;
    event: AttendanceEvent;
}

export interface AttendanceTypeDocument {
    id: string;
    description: string;
    abbreviated_description: string;
    enable: string;
}

export interface AttendanceBeneficiary {
    id: string;
    type_document: AttendanceTypeDocument;
    document: string;
    names: string;
    surname: string;
    last_name: string | null;
}

export interface Attendance {
    id: string;
    created_at: string | null;
    workshop: AttendanceWorkshop;
    beneficiary: AttendanceBeneficiary;
    created_by: AttendanceCreatedBy;
}

export interface AttendancesResponse {
    data: Attendance[];
    pagination: Pagination;
    status: number;
}

export interface CreateAttendanceBody {
    workshop_id: string;
    beneficiary_id: string;
}
