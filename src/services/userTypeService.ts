import { apiClient } from './apiClient';
import type { UserType, UserTypesResponse, UserTypeResponse } from '../types/userType.types';

export interface GetUserTypesParams {
    page?: number;
    size_page?: number;
}

export interface CreateUserTypeBody {
    description: string;
    code: string;
    enable: boolean;
}

export interface UpdateUserTypeBody {
    description: string;
    code: string;
    enable: boolean;
}

export const userTypeService = {
    getUserTypes(params: GetUserTypesParams = {}): Promise<UserTypesResponse> {
        const query = new URLSearchParams();
        if (params.page !== undefined) query.set('page', String(params.page));
        if (params.size_page !== undefined) query.set('size_page', String(params.size_page));
        const qs = query.toString();
        return apiClient.get<UserTypesResponse>(`/core/user_types${qs ? `?${qs}` : ''}`);
    },

    async getUserTypeById(id: string): Promise<UserType> {
        const res = await apiClient.get<UserTypeResponse>(`/core/user_types/${id}`);
        return res.data;
    },

    async createUserType(body: CreateUserTypeBody): Promise<string> {
        const res = await apiClient.post<{ data: string; status: number }>('/core/user_types', body);
        return res.data;
    },

    async updateUserType(id: string, body: UpdateUserTypeBody): Promise<string> {
        const res = await apiClient.put<{ data: string; status: number }>(`/core/user_types/${id}`, body);
        return res.data;
    },

    async deleteUserType(id: string): Promise<void> {
        await apiClient.delete<unknown>(`/core/user_types/${id}`);
    },
};
