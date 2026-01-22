import mongoose, { Schema } from "mongoose";
import { IMongoComment } from "./interface";
import config from "../../config";

const commentSchema = new mongoose.Schema<IMongoComment>(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        postId: {
            type: Schema.Types.ObjectId,
            ref: config.mongo.postsCollectionName,
            required: true,
        },
        commentText: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const CommentModel = mongoose.model<IMongoComment>(config.mongo.commentsCollectionName, commentSchema);
