import { config } from "../config";

export const storeTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem(config.accessTokenStorageKey, accessToken);
    localStorage.setItem(config.refreshTokenStorageKey, refreshToken);
};

export const clearTokens = () => {
    localStorage.removeItem(config.accessTokenStorageKey);
    localStorage.removeItem(config.refreshTokenStorageKey);
};