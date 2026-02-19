import api from "./api";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface GoogleLoginRequest {
    code: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    username: string;
    image?: File;
}

export interface ResetPasswordRequest {
    email: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        _id: string;
        email: string;
        username: string;
        image?: string;
        refreshTokens?: string[];
    };
}

export const authService = {
    refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/auth/refresh-token", { refreshToken });
        return response.data;
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/auth/login", data);
        return response.data;
    },

    googleLogin: async (data: GoogleLoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/auth/login-google", data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("username", data.username);
        if (data.image) formData.append("image", data.image);

        const response = await api.post<AuthResponse>("/auth/register", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>("/auth/reset-password", data);
        return response.data;
    },
};
