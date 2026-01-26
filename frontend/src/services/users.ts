import api from "./api";

export interface User {
    _id: string;
    email: string;
    username: string;
}

export interface UpdateUserRequest {
    username?: string;
}

export const userService = {
    getMe: async (): Promise<User> => {
        const response = await api.get<User>("/users/me");
        return response.data;
    },

    updateMe: async (data: UpdateUserRequest, id: string): Promise<User> => {
        const response = await api.put<User>(`/users/${id}`, data);
        return response.data;
    },
};
