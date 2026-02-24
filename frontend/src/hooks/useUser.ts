import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, type UpdateUserRequest } from "../services/users";

export const USER_QUERY_KEY = ["user", "me"] as const;

export const useUser = () => {
    const queryClient = useQueryClient();

    const { data: user, isLoading, error } = useQuery({
        queryKey: USER_QUERY_KEY,
        queryFn: userService.getMe,
    });

    const updateMutation = useMutation({
        mutationFn: (data: UpdateUserRequest) => userService.updateMe(data, user?._id || ""),
        onSuccess: (data) => {
            queryClient.setQueryData(USER_QUERY_KEY, data);
        },

    });

    return {
        user,
        isLoading,
        error,
        updateUser: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        updateError: updateMutation.error,
        updateSuccess: updateMutation.isSuccess,
    };
};
