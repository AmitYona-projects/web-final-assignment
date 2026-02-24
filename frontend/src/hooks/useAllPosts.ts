import { useInfiniteQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { postsService, type PostSearchParams } from "../services/posts";
import type { DrinkCategory } from "../types/posts";

const PAGE_SIZE = 12;

export const ALL_POSTS_QUERY_KEY = ["posts", "all"] as const;

export const useAllPosts = (searchParams: Omit<PostSearchParams, "skip" | "limit"> = {}) => {
    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        isFetching,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: [...ALL_POSTS_QUERY_KEY, searchParams],
        queryFn: ({ pageParam = 0 }) => postsService.getAllPosts({
            ...searchParams,
            skip: pageParam,
            limit: PAGE_SIZE,
        }),
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce((sum, page) => sum + page.posts.length, 0);
            return loaded < lastPage.total ? loaded : undefined;
        },
        initialPageParam: 0,
        placeholderData: keepPreviousData,
    });

    const posts = data?.pages.flatMap((page) => page.posts) ?? [];
    const total = data?.pages[0]?.total ?? 0;
    const aiCategories: DrinkCategory[] | undefined = data?.pages[0]?.aiCategories;

    const toggleLikeMutation = useMutation({
        mutationFn: (postId: string) => postsService.toggleLike(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ALL_POSTS_QUERY_KEY });
        },
    });

    const addCommentMutation = useMutation({
        mutationFn: ({ postId, commentText }: { postId: string; commentText: string }) =>
            postsService.addComment(postId, commentText),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ALL_POSTS_QUERY_KEY });
        },
    });

    const deleteCommentMutation = useMutation({
        mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
            postsService.deleteComment(postId, commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ALL_POSTS_QUERY_KEY });
        },
    });

    return {
        posts,
        total,
        aiCategories,
        isLoading,
        isFetching,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        toggleLike: toggleLikeMutation.mutate,
        addComment: addCommentMutation.mutate,
        deleteComment: deleteCommentMutation.mutate,
    };
};
