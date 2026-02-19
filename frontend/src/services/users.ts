import api from "./api";

export interface User {
    _id: string;
    email: string;
    username: string;
    image?: string;
}

export interface UpdateUserRequest {
    username?: string;
    image?: File;
}

export const userService = {
    getMe: async (): Promise<User> => {
        const response = await api.get<User>("/users/me");
        return response.data;
    },

    updateMe: async (data: UpdateUserRequest, id: string): Promise<User> => {
        const formData = new FormData();
        if (data.username) formData.append("username", data.username);
        if (data.image) formData.append("image", data.image);

        const response = await api.put<User>(`/users/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
};
