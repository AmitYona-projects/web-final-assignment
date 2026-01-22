import mongoose from "mongoose";
import { IMongoUser } from "./interface";
import config from "../../config";

const userSchema = new mongoose.Schema<IMongoUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        username: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        refreshTokens: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

export const UserModel = mongoose.model<IMongoUser>(config.mongo.usersCollectionName, userSchema);
