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
        refreshTokens?: string[];
    };
}

export const authService = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/auth/login", data);
        return response.data;
    },

    googleLogin: async (data: GoogleLoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/auth/login-google", data);
        return response.data;
    },

    register: async (formData: FormData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/auth/register", formData);
        return response.data;
    },

    logout: async (refreshToken: string): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>("/auth/logout", { refreshToken });
        return response.data;
    },

    resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>("/auth/reset-password", data);
        return response.data;
    },
};
