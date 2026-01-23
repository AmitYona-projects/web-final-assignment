import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../config";
import { ITokenInfo } from "../express/auth/interface";
import { ServerError } from "./errors";
import { StatusCodes } from "http-status-codes";

const { jwtSecret, jwtRefreshSecret, accessTokenExpiration, refreshTokenExpiration, saltRounds } = config.auth;

export const generateAccessToken = (userId: string): string => {
    return jwt.sign({ _id: userId }, jwtSecret, {
        expiresIn: accessTokenExpiration,
    } as SignOptions);
};

export const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ _id: userId }, jwtRefreshSecret, {
        expiresIn: refreshTokenExpiration,
    } as SignOptions);
};

export const generateTokens = (userId: string): { accessToken: string; refreshToken: string } => {
    return {
        accessToken: generateAccessToken(userId),
        refreshToken: generateRefreshToken(userId),
    };
};

export const verifyAccessToken = (token: string): ITokenInfo => {
    return jwt.verify(token, jwtSecret) as ITokenInfo;
};

export const encryptPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
};

export const comparePasswords = async (password: string, hashedPassword: string): Promise<void> => {
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordValid) {
        throw new ServerError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
    }
};
