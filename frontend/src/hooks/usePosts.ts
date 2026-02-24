import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { postsService, type CreatePostRequest, type UpdatePostRequest, type PostSearchParams } from "../services/posts";
import type { DrinkCategory } from "../types/posts";

export const POSTS_QUERY_KEY = (userId: string) => ["posts", "user", userId] as const;

export const usePosts = (userId: string, searchParams: PostSearchParams = {}) => {
    const queryClient = useQueryClient();

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: [...POSTS_QUERY_KEY(userId), searchParams],
        queryFn: () => postsService.getUserPosts(userId, searchParams),
        enabled: !!userId,
        placeholderData: keepPreviousData,
    });

    const posts = data?.posts ?? [];
    const total = data?.total ?? 0;
    const aiCategories: DrinkCategory[] | undefined = data?.aiCategories;

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
        total,
        aiCategories,
        isLoading,
        isFetching,
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
