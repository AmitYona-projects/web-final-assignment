import { useMutation } from "@tanstack/react-query";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth";
import type { LoginRequest, RegisterRequest, ResetPasswordRequest, AuthResponse } from "../services/auth";
import { config } from "../config";

const storeTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem(config.accessTokenStorageKey, accessToken);
    localStorage.setItem(config.refreshTokenStorageKey, refreshToken);
};

const clearTokens = () => {
    localStorage.removeItem(config.accessTokenStorageKey);
    localStorage.removeItem(config.refreshTokenStorageKey);
};

export const useAuth = () => {
    const navigate = useNavigate();

    const googleLogin = useMutation<AuthResponse, Error, { code: string }>({
        mutationFn: ({ code }) => authService.googleLogin({ code }),
        onSuccess: (data) => {
            storeTokens(data.accessToken, data.refreshToken);
            navigate("/");
        },
        onError: (error) => {
            console.error("Google login error:", error);
        },
    });

    const googleLoginFlow = useGoogleLogin({
        flow: "auth-code",
        scope: "profile email",
        onSuccess: (codeResponse) => {
            googleLogin.mutate({ code: codeResponse.code });
        },
        onError: (error) => {
            console.error("Google OAuth error:", error);
        },
    });

    const regularLogin = useMutation<AuthResponse, Error, LoginRequest>({
        mutationFn: authService.login,
        onSuccess: (data) => {
            storeTokens(data.accessToken, data.refreshToken);
            navigate("/");
        },
        onError: (error) => {
            console.error("Login error:", error);
        },
    });

    const register = useMutation<AuthResponse, Error, RegisterRequest>({
        mutationFn: authService.register,
        onSuccess: (data) => {
            storeTokens(data.accessToken, data.refreshToken);
            navigate("/");
        },
        onError: (error) => {
            console.error("Registration error:", error);
        },
    });

    const resetPassword = useMutation<{ message: string }, Error, ResetPasswordRequest>({
        mutationFn: authService.resetPassword,
        onSuccess: (data) => {
            console.log("Password reset email sent:", data.message);
        },
        onError: (error) => {
            console.error("Reset password error:", error);
        },
    });

    const handleGoogleLogin = () => {
        googleLoginFlow();
    };

    return {
        regularLogin: {
            mutate: regularLogin.mutate,
            mutateAsync: regularLogin.mutateAsync,
            isPending: regularLogin.isPending,
            isError: regularLogin.isError,
            isSuccess: regularLogin.isSuccess,
            error: regularLogin.error,
            data: regularLogin.data,
        },
        googleLogin: {
            triggerFlow: handleGoogleLogin,
            isPending: googleLogin.isPending,
            isError: googleLogin.isError,
            isSuccess: googleLogin.isSuccess,
            error: googleLogin.error,
            data: googleLogin.data,
        },
        register: {
            mutate: register.mutate,
            mutateAsync: register.mutateAsync,
            isPending: register.isPending,
            isError: register.isError,
            isSuccess: register.isSuccess,
            error: register.error,
            data: register.data,
        },
        resetPassword: {
            mutate: resetPassword.mutate,
            mutateAsync: resetPassword.mutateAsync,
            isPending: resetPassword.isPending,
            isError: resetPassword.isError,
            isSuccess: resetPassword.isSuccess,
            error: resetPassword.error,
            data: resetPassword.data,
        },
        logout: () => {
            clearTokens();
            navigate("/login");
        },
    };
};

export default useAuth;
