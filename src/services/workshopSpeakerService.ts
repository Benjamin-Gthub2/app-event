import { apiClient } from './apiClient';
import type { WorkshopSpeaker, WorkshopSpeakersResponse, WorkshopSpeakerByIdResponse, CreateWorkshopSpeakerBody } from '../types/workshopSpeaker.types';

export interface GetWorkshopSpeakersParams {
    page?: number;
    size_page?: number;
    workshop_id?: string;
    speaker_id?: string;
}

export const workshopSpeakerService = {
    getWorkshopSpeakers(params: GetWorkshopSpeakersParams = {}): Promise<WorkshopSpeakersResponse> {
        const query = new URLSearchParams();
        if (params.page !== undefined) query.set('page', String(params.page));
        if (params.size_page !== undefined) query.set('size_page', String(params.size_page));
        if (params.workshop_id) query.set('workshop_id', params.workshop_id);
        if (params.speaker_id) query.set('speaker_id', params.speaker_id);
        const qs = query.toString();
        return apiClient.get<WorkshopSpeakersResponse>(`/event/workshop-speakers${qs ? `?${qs}` : ''}`);
    },

    async getWorkshopSpeakerById(id: string): Promise<WorkshopSpeaker> {
        const res = await apiClient.get<WorkshopSpeakerByIdResponse>(`/event/workshop-speakers/${id}`);
        return res.data;
    },

    async createWorkshopSpeaker(body: CreateWorkshopSpeakerBody): Promise<string> {
        const res = await apiClient.post<{ data: string; status: number }>('/event/workshop-speakers', body);
        return res.data;
    },

    async deleteWorkshopSpeaker(id: string): Promise<void> {
        await apiClient.delete<unknown>(`/event/workshop-speakers/${id}`);
    },
};
