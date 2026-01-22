import mongoose, { Schema } from "mongoose";
import { IMongoPost } from "./interface";
import config from "../../config";

const postSchema = new mongoose.Schema<IMongoPost>(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const PostModel = mongoose.model<IMongoPost>(config.mongo.postsCollectionName, postSchema);
