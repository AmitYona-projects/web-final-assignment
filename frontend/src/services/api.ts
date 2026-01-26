import axios from "axios";
import { config } from "../config";

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

export default api; 