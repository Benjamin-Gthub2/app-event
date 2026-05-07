import { apiClient } from './apiClient';
import type { PeopleResponse } from '../types/people.types';

export interface GetPeopleParams {
    page?: number;
    size_page?: number;
    search_name?: string;
    document?: string;
    document_type_id?: string;
}

export interface CreatePersonBody {
    user_id?: string;
    type_document_id: string;
    document: string;
    names: string;
    surname: string;
    last_name?: string;
    phone?: string;
    email?: string;
    gender?: string;
    enable: boolean;
}

export interface UpdatePersonBody {
    user_id?: string;
    type_document_id: string;
    document: string;
    names: string;
    surname: string;
    last_name?: string;
    phone?: string;
    email?: string;
    gender?: string;
    enable: boolean;
}

export const peopleService = {
    getPeople(params: GetPeopleParams = {}): Promise<PeopleResponse> {
        const query = new URLSearchParams();
        if (params.page !== undefined) query.set('page', String(params.page));
        if (params.size_page !== undefined) query.set('size_page', String(params.size_page));
        if (params.search_name) query.set('search_name', params.search_name);
        if (params.document) query.set('document', params.document);
        if (params.document_type_id) query.set('document_type_id', params.document_type_id);
        const qs = query.toString();
        return apiClient.get<PeopleResponse>(`/event/people/${qs ? `?${qs}` : ''}`);
    },

    async createPerson(body: CreatePersonBody): Promise<string> {
        const res = await apiClient.post<{ data: string; status: number }>('/event/people/', body);
        return res.data;
    },

    async updatePerson(id: string, body: UpdatePersonBody): Promise<string> {
        const res = await apiClient.put<{ data: string; status: number }>(`/event/people/${id}`, body);
        return res.data;
    },

    async deletePerson(id: string): Promise<void> {
        await apiClient.delete<unknown>(`/event/people/${id}`);
    },
};
