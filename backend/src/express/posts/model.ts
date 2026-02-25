import mongoose, { Schema } from "mongoose";
import { DRINK_CATEGORIES, IMongoPost } from "./interface";
import config from "../../config";

const postSchema = new mongoose.Schema<IMongoPost>(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: config.mongo.usersCollectionName,
            required: true,
        },
        drinkName: {
            type: String,
            required: true,
        },
        instructions: {
            type: String,
            required: true,
        },
        drinkImage: {
            type: String,
            required: false,
        },
        categories: {
            type: [String],
            enum: DRINK_CATEGORIES,
            default: [],
        },
        comments: {
            type: [
                {
                    senderId: {
                        type: Schema.Types.ObjectId,
                        ref: config.mongo.usersCollectionName,
                        required: true,
                    },
                    commentText: {
                        type: String,
                        required: true,
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
            default: [],
        },
        likes: {
            type: [Schema.Types.ObjectId],
            ref: config.mongo.usersCollectionName,
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

postSchema.index({ owner: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ likes: 1 });
postSchema.index({ categories: 1 });
postSchema.index({ drinkName: 1 });
postSchema.index({ instructions: 1 });

export const PostModel = mongoose.model<IMongoPost>(config.mongo.postsCollectionName, postSchema);
