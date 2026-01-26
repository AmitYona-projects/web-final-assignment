import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsService, type CreatePostRequest, type UpdatePostRequest } from "../services/posts";

export const POSTS_QUERY_KEY = (userId: string) => ["posts", "user", userId] as const;

export const usePosts = (userId: string) => {
    const queryClient = useQueryClient();

    const { data: posts = [], isLoading, error } = useQuery({
        queryKey: POSTS_QUERY_KEY(userId),
        queryFn: () => postsService.getUserPosts(userId),
        enabled: !!userId,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreatePostRequest) => postsService.createPost(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY(userId) });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePostRequest }) =>
            postsService.updatePost(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY(userId) });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => postsService.deletePost(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY(userId) });
        },
    });

    return {
        posts,
        isLoading,
        error,
        createPost: createMutation.mutate,
        isCreating: createMutation.isPending,
        createError: createMutation.error,
        updatePost: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        updateError: updateMutation.error,
        deletePost: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        deleteError: deleteMutation.error,
    };
};
