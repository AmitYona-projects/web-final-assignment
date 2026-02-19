import { Document } from "mongoose";

export interface IUser {
    email: string;
    username: string;
    password: string;
    image?: string;
    refreshTokens: string[];
}

export interface IMongoUser extends IUser, Document<string> {
    _id: string;
}
