import { Document, Types } from "mongoose";

export interface IPost {
    senderId: Types.ObjectId;
    title: string;
    description: string;
}

export interface IMongoPost extends IPost, Document<string> {
    _id: string;
}
