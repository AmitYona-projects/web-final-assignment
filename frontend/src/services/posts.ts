import api from "./api";
import type { DrinkCategory } from "../types/posts";

export interface Post {
    _id: string;
    owner: string;
    drinkName: string;
    instructions: string;
    drinkImage: string;
    categories: DrinkCategory[];
    comments: Comment[];
    likes: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CommentSender {
    _id: string;
    username: string;
    image?: string;
}

export interface Comment {
    _id: string;
    senderId: CommentSender;
    commentText: string;
    createdAt: string;
}

export interface CreatePostRequest {
    drinkName: string;
    instructions: string;
    drinkImage?: File;
    categories?: DrinkCategory[];
}

export interface UpdatePostRequest {
    drinkName?: string;
    instructions?: string;
    drinkImage?: File;
    categories?: DrinkCategory[];
}

export interface PostSearchParams {
    skip?: number;
    limit?: number;
    search?: string;
    categories?: DrinkCategory[];
    sort?: string;
    hasLikes?: boolean;
    hasComments?: boolean;
    aiPrompt?: string;
}

export interface PostSearchResult {
    posts: Post[];
    total: number;
    aiCategories?: DrinkCategory[];
}

const buildSearchQuery = (params: PostSearchParams): string => {
    const query = new URLSearchParams();
    if (params.skip) query.set("skip", String(params.skip));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.sort) query.set("sort", params.sort);
    if (params.hasLikes) query.set("hasLikes", "true");
    if (params.hasComments) query.set("hasComments", "true");
    if (params.aiPrompt) query.set("aiPrompt", params.aiPrompt);
    params.categories?.forEach((cat) => query.append("categories", cat));
    return query.toString();
};

export const postsService = {
    getAllPosts: async (params: PostSearchParams = {}): Promise<PostSearchResult> => {
        const response = await api.get(`/posts?${buildSearchQuery(params)}`);
        return response.data;
    },

    getUserPosts: async (userId: string, params: PostSearchParams = {}): Promise<PostSearchResult> => {
        const query = buildSearchQuery(params);
        const response = await api.get(`/posts/sender?senderId=${userId}${query ? `&${query}` : ""}`);
        return response.data;
    },

    getPostById: async (id: string): Promise<Post> => {
        const response = await api.get(`/posts/${id}`);
        return response.data;
    },

    createPost: async (data: CreatePostRequest): Promise<Post> => {
        const formData = new FormData();
        formData.append("drinkName", data.drinkName);
        formData.append("instructions", data.instructions);
        if (data.drinkImage) formData.append("drinkImage", data.drinkImage);
        data.categories?.forEach((cat) => formData.append("categories", cat));

        const response = await api.post("/posts", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    updatePost: async (id: string, data: UpdatePostRequest): Promise<Post> => {
        const formData = new FormData();
        if (data.drinkName) formData.append("drinkName", data.drinkName);
        if (data.instructions) formData.append("instructions", data.instructions);
        if (data.drinkImage) formData.append("drinkImage", data.drinkImage);
        data.categories?.forEach((cat) => formData.append("categories", cat));

        const response = await api.put(`/posts/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    deletePost: async (id: string): Promise<void> => {
        await api.delete(`/posts/${id}`);
    },

    toggleLike: async (postId: string): Promise<Post> => {
        const response = await api.post(`/posts/${postId}/like`);
        return response.data;
    },

    addComment: async (postId: string, commentText: string): Promise<Post> => {
        const response = await api.post(`/posts/${postId}/comments`, { commentText });
        return response.data;
    },

    deleteComment: async (postId: string, commentId: string): Promise<Post> => {
        const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
        return response.data;
    },
};
