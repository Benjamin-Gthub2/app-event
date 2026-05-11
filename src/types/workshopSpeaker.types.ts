import type { Pagination } from './common.types';

export interface WorkshopSpeakerWorkshop {
    id: string;
    name: string;
    shortname: string | null;
}

export interface WorkshopSpeakerSpeaker {
    id: string;
    names: string;
    surname: string;
    last_name: string | null;
    document: string;
}

export interface WorkshopSpeakerCreatedBy {
    id: string;
    username: string;
}

export interface WorkshopSpeaker {
    id: string;
    degree_abbreviation: string | null;
    created_at: string | null;
    workshop: WorkshopSpeakerWorkshop;
    speaker: WorkshopSpeakerSpeaker;
    created_by: WorkshopSpeakerCreatedBy;
}

export interface WorkshopSpeakersResponse {
    data: WorkshopSpeaker[];
    pagination: Pagination;
    status: number;
}

export interface WorkshopSpeakerByIdResponse {
    data: WorkshopSpeaker;
    status: number;
}

export interface CreateWorkshopSpeakerBody {
    workshop_id: string;
    speaker_id: string;
    degree_abbreviation?: string;
}
