import { apiClient } from './apiClient';
import type { AppView, UserPerson } from '../types/auth.types';

interface ViewsByUserResponse {
    data: {
        views: AppView[];
        person: UserPerson | null;
    } | null;
    status: number;
}

export const userService = {
    getViews(): Promise<ViewsByUserResponse> {
        return apiClient.get<ViewsByUserResponse>('/event/users/views');
    },
};
