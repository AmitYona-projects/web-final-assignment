import { Document, Types } from "mongoose";

export interface IComment {
    senderId: Types.ObjectId;
    commentText: string;
    createdAt: Date;
}

export interface IPost {
    owner: Types.ObjectId;
    drinkName: string;
    instructions: string;
    drinkImage: string;
    comments: IComment[];
    likes: Types.ObjectId[];
}

export interface IMongoPost extends IPost, Document<string> {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}
