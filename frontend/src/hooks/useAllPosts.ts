import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsService } from "../services/posts";

export const ALL_POSTS_QUERY_KEY = ["posts", "all"] as const;

export const useAllPosts = () => {
    const queryClient = useQueryClient();

    const { data: posts = [], isLoading, error } = useQuery({
        queryKey: ALL_POSTS_QUERY_KEY,
        queryFn: postsService.getAllPosts,
    });

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
        isLoading,
        error,
        toggleLike: toggleLikeMutation.mutate,
        addComment: addCommentMutation.mutate,
        deleteComment: deleteCommentMutation.mutate,
    };
};
