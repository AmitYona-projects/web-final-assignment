import { useMutation } from "@tanstack/react-query";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth";
import type { LoginRequest, RegisterRequest,  AuthResponse } from "../services/auth";
import { clearTokens, storeTokens } from "../utils/localStorage";
import { config } from "../config";


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
        flow: config.google.loginFlow,
        scope: config.google.loginScope,
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
        logout: () => {
            clearTokens();
            navigate("/login");
        },
    };
};

export default useAuth;
