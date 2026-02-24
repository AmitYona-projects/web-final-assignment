import { Document, Types } from "mongoose";

export interface IComment {
    _id?: Types.ObjectId;
    senderId: Types.ObjectId;
    commentText: string;
    createdAt: Date;
}

export const DRINK_CATEGORIES = [
    "sweet",
    "spicy",
    "sour",
    "bitter",
    "fruity",
    "creamy",
    "refreshing",
    "strong",
    "tropical",
    "herbal",
] as const;

export type DrinkCategory = (typeof DRINK_CATEGORIES)[number];

export interface IPost {
    owner: Types.ObjectId;
    drinkName: string;
    instructions: string;
    drinkImage: string;
    categories: DrinkCategory[];
    comments: IComment[];
    likes: Types.ObjectId[];
}

export interface IMongoPost extends IPost, Document<string> {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
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
    posts: IMongoPost[];
    total: number;
    aiCategories?: DrinkCategory[];
}
