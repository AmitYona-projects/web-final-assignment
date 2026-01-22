import { Document, Types } from "mongoose";

export interface IComment {
    senderId: Types.ObjectId;
    postId: Types.ObjectId;
    commentText: string;
}

export interface IMongoComment extends IComment, Document<string> {
    _id: string;
}
