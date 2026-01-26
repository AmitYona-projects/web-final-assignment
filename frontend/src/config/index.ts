const env = import.meta.env;

export const config = {
  backendUrl: env.VITE_BACKEND_API_URL,
  defaultPageSize: +env.VITE_DEFAULT_PAGE_SIZE,
  uploadFolderUrl: env.VITE_UPLOAD_FOLDER_URL,
  publicFolderUrl: env.VITE_PUBLIC_FOLDER_URL,
  googleClientId: env.VITE_GOOGLE_CLIENT_ID,
  accessTokenStorageKey: env.VITE_ACCESS_TOKEN_STORAGE_KEY || "accessToken",
  refreshTokenStorageKey: env.VITE_REFRESH_TOKEN_STORAGE_KEY || "refreshToken",
  geminiApiKey: env.VITE_GEMINI_API_KEY,
  google: {
    clientId: env.VITE_GOOGLE_CLIENT_ID,
    loginFlow: "auth-code" as const,
    loginScope: "profile email",
  },
};
