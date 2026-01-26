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

export interface Comment {
    senderId: string;
    commentText: string;
    createdAt: string;
}

export interface CreatePostRequest {
    drinkName: string;
    instructions: string;
    drinkImage: string;
}

export interface UpdatePostRequest {
    drinkName?: string;
    instructions?: string;
    drinkImage?: string;
}

export const postsService = {
    getAllPosts: async (): Promise<Post[]> => {
        const response = await api.get("/posts");
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
        const response = await api.post("/posts", data);
        return response.data;
    },

    updatePost: async (id: string, data: UpdatePostRequest): Promise<Post> => {
        const response = await api.put(`/posts/${id}`, data);
        return response.data;
    },

    deletePost: async (id: string): Promise<void> => {
        await api.delete(`/posts/${id}`);
    },
};
