import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { authService } from "../services/auth";
import type { LoginRequest, RegisterRequest, AuthResponse } from "../services/auth";
import { clearTokens, storeTokens } from "../utils/localStorage";
import type { CredentialResponse } from "@react-oauth/google";
import { config } from "../config";

export const AUTH_QUERY_KEY = ["auth", "status"] as const;

const checkAuthStatus = (): boolean => {
    const accessToken = localStorage.getItem(config.accessTokenStorageKey);
    return !!accessToken;
};

export const useAuth = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const initialAuthStatus = useMemo(() => checkAuthStatus(), []);

    const { data: isAuthenticated = false, isLoading } = useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: checkAuthStatus,
        initialData: initialAuthStatus,
    });

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === config.accessTokenStorageKey || e.key === null) {
                const newAuthStatus = checkAuthStatus();
                queryClient.setQueryData(AUTH_QUERY_KEY, (oldData: boolean | undefined) => {
                    if (oldData !== newAuthStatus) {
                        return newAuthStatus;
                    }
                    return oldData;
                });
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [queryClient]);

    const googleLogin = useMutation<AuthResponse, Error, CredentialResponse>({
        mutationFn: (data) => authService.googleLogin({ code: data.credential! }),
        onSuccess: (data) => {
            storeTokens(data.accessToken, data.refreshToken);
            queryClient.setQueryData(AUTH_QUERY_KEY, true);
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
            queryClient.setQueryData(AUTH_QUERY_KEY, true);
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
            queryClient.setQueryData(AUTH_QUERY_KEY, true);
            navigate("/");
        },
        onError: (error) => {
            console.error("Registration error:", error);
        },
    });


    return {
        isAuthenticated,
        isLoading,
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
            queryClient.setQueryData(AUTH_QUERY_KEY, false);
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
            navigate("/auth/login");
        },
    };
};

export default useAuth;
