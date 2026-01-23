import { Request } from "express";
import { IMongoUser } from "../users/interface";

export interface ILoginData {
    email: string;
    password: string;
}

export interface IRegisterData {
    email: string;
    password: string;
    username: string;
}

export interface ILogoutData {
    refreshToken: string;
}

export interface IRefreshTokenData {
    refreshToken: string;
}

export interface IAuthResponse {
    accessToken: string;
    refreshToken: string;
    user: IMongoUser;
}

export interface ITokenInfo {
    _id: string;
}

export interface AuthRequest extends Request {
    user: ITokenInfo;
}
