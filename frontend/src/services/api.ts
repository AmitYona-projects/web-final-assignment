import axios from "axios";
import { config } from "../config";
import { clearTokens } from "../utils/localStorage";

const api = axios.create({
    baseURL: config.backendUrl,
});

const refreshApi = axios.create({
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
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem(config.refreshTokenStorageKey);
        if (!refreshToken) {
            clearTokens();
            window.location.href = "/auth/login";
            return Promise.reject(error);
        }

        try {
            const { data } = await refreshApi.post("/auth/refresh-token", { refreshToken });
            localStorage.setItem(config.accessTokenStorageKey, data.accessToken);
            localStorage.setItem(config.refreshTokenStorageKey, data.refreshToken);

            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(originalRequest);
        } catch {
            clearTokens();
            window.location.href = "/auth/login";
            return Promise.reject(error);
        }
    }

    return Promise.reject(error);
});

export default api; 