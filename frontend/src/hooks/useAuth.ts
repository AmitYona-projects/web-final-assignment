import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth";
import type { LoginRequest, RegisterRequest, AuthResponse } from "../services/auth";
import { clearTokens, storeTokens } from "../utils/localStorage";
import type { CredentialResponse } from "@react-oauth/google";


export const useAuth = () => {
    const navigate = useNavigate();

    const googleLogin = useMutation<AuthResponse, Error, CredentialResponse>({
        mutationFn: (data) => authService.googleLogin({ code: data.credential! }),
        onSuccess: (data) => {
            storeTokens(data.accessToken, data.refreshToken);
            navigate("/");
        },
        onError: (error) => {
            console.error("Google login error:", error);
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
            triggerFlow: googleLogin.mutateAsync,
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
