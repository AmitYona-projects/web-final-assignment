import axios from "axios";
import { config } from "../config";
import { clearTokens } from "../utils/localStorage";
import { authService } from "./auth";

const api = axios.create({
    baseURL: config.backendUrl,
});

api.interceptors.request.use((req) => {
    const token = localStorage.getItem(config.accessTokenStorageKey);
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

api.interceptors.response.use((res) => {
    return res;
}, async (error) => {
    const refreshToken = localStorage.getItem(config.refreshTokenStorageKey);
    if (error.response.status === 401) {
        clearTokens();
        const refreshUser = await authService.refreshToken(refreshToken || "");
        if (refreshUser) {
            localStorage.setItem(config.accessTokenStorageKey, refreshUser.accessToken);
            localStorage.setItem(config.refreshTokenStorageKey, refreshUser.refreshToken);
        }
        window.location.href = "/auth/login";
    }
    return Promise.reject(error);
});

export default api; 