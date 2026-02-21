import api from "./api";

export interface Post {
    _id: string;
    owner: string;
    drinkName: string;
    instructions: string;
    drinkImage: string;
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
}

export interface UpdatePostRequest {
    drinkName?: string;
    instructions?: string;
    drinkImage?: File;
}

export interface PaginatedPosts {
    posts: Post[];
    total: number;
}

export const postsService = {
    getAllPosts: async (skip = 0, limit = 10): Promise<PaginatedPosts> => {
        const response = await api.get(`/posts?skip=${skip}&limit=${limit}`);
        return response.data;
    },

    getUserPosts: async (userId: string): Promise<Post[]> => {
        const response = await api.get(`/posts/sender?senderId=${userId}`);
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
